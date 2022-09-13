import { CheckstyleReport } from './model/CheckstyleReport';
import * as ejs from 'ejs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

export async function generateHtmlReport(
  tmpDir: string,
  report: CheckstyleReport,
): Promise<string> {
  const renderedReport = await ejs.renderFile(path.join(__dirname, 'templates', 'report.ejs'), {
    report,
  });

  const reportFile = path.join(tmpDir, 'checkstyle-report.html');
  await fsPromises.writeFile(reportFile, renderedReport);
  return reportFile;
}

export async function genearteJsonReport(
  tmpDir: string,
  report: CheckstyleReport,
): Promise<string> {
  const reportFile = path.join(tmpDir, 'checkstyle-summary.json');
  await fsPromises.writeFile(reportFile, JSON.stringify(report.summary));
  return reportFile;
}
