import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { Globber } from '@actions/glob';
import { context } from '@actions/github';
import * as artifact from '@actions/artifact';

import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as os from 'os';

import CheckstyleLoader from './CheckstyleLoader';
import { genearteJsonReport, generateHtmlReport } from './report-generator';

const CHECKSTYLE_LOADER = new CheckstyleLoader();

function getNumberInput(key: string): number | undefined {
  const raw = core.getInput(key);

  if (raw) {
    return parseInt(raw, 10);
  }
}

async function uploadReports(
  tmpDir: string,
  reports: string[],
  artifactName: string,
  retentionDays?: number,
): Promise<void> {
  const artifactClient = artifact.create();
  await artifactClient.uploadArtifact(artifactName, reports, tmpDir, { retentionDays });
}

async function run(): Promise<void> {
  const workspace = process.env.GITHUB_WORKSPACE as string;
  const fileGlob: Globber = await glob.create(core.getInput('files', { required: true }));
  const uploadReport = core.getBooleanInput('upload-report');
  const artifactName = core.getInput('artifact-name');
  const retentionDays = getNumberInput('retention-days');

  const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'checkstyle-results-toolkit-'));

  const inputFiles: string[] = await fileGlob.glob();
  core.debug(`Found ${inputFiles.length} Checkstyle reports`);

  const report = await CHECKSTYLE_LOADER.loadFiles(workspace, inputFiles);
  core.setOutput('checkstyle-results', report.summary);

  if (uploadReport) {
    const htmlReport = await generateHtmlReport(tmpDir, report);
    const jsonReport = await genearteJsonReport(tmpDir, report);

    // TODO slugify job name
    const targetName = artifactName ? artifactName : `checkstyle-report-${context.job}`;
    await uploadReports(tmpDir, [htmlReport, jsonReport], targetName, retentionDays);
  }
}

run().catch((error) => {
  core.error('Unexpected error while processing Checkstyle results');
  core.debug(error);
  core.setFailed(error);
});
