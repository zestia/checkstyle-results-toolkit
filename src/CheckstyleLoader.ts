import { XMLParser } from 'fast-xml-parser';
import { promises as fsPromises } from 'fs';
import { CheckstyleReport } from './model/CheckstyleReport';
import { CheckstyleViolation, Severity } from './model/CheckstyleViolation';
import { FileResults } from './model/FileResults';
import { ReportSummary } from './model/ReportSummary';
import * as path from 'path';

export default class CheckstyleLoader {
  private readonly parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreDeclaration: true,
      ignoreAttributes: false,
      attributeNamePrefix: '_',
      isArray: (name, jpath) => jpath === 'checkstyle.file' || jpath === 'checkstyle.file.error',
    });
  }

  async loadFiles(basedir: string, paths: string[]): Promise<CheckstyleReport> {
    const reportResults = await Promise.all(paths.map((path) => this.loadFile(basedir, path)));

    return reportResults.reduce((acc, report) => acc.combine(report));
  }

  private async loadFile(basedir: string, path: string): Promise<CheckstyleReport> {
    const raw = await fsPromises.readFile(path);
    const parsed = this.parser.parse(raw);
    return this.parseReport(basedir, parsed);
  }

  private parseReport(basedir: string, xml: any): CheckstyleReport {
    if (!xml.checkstyle) {
      throw new Error('Invalid Checkstyle report');
    }

    const checkstyleVersion = xml.checkstyle._version as string;
    const files = (xml.checkstyle.file || []).map((f: any) => this.parseFile(basedir, f));
    const summary = this.summariseFiles(files);

    return new CheckstyleReport(checkstyleVersion, summary, files);
  }

  private parseFile(basedir: string, xml: any): FileResults {
    const name = CheckstyleLoader.relativeFilename(basedir, xml._name as string);

    const rawErrors = xml.error || [];
    const violations = rawErrors.map((v: any) => this.parseViolation(v));
    const summary = this.summariseFile(violations);

    return new FileResults(name, summary, violations);
  }

  private parseViolation(xml: any): CheckstyleViolation {
    const line = parseInt(xml._line as string);
    const severity = xml._severity as Severity;
    const message = xml._message as string;
    const source = xml._source as string;

    return {
      line,
      severity,
      message,
      source,
    };
  }

  private summariseFile(violations: CheckstyleViolation[]): ReportSummary {
    return violations.reduce((acc, violation) => {
      switch (violation.severity) {
        case Severity.Error:
          return acc.incrementError();
        case Severity.Warning:
          return acc.incrementWarning();
        case Severity.Info:
          return acc.incrementInfo();
        case Severity.Ignore:
          return acc.incrementIgnored();
      }
    }, new ReportSummary());
  }

  private summariseFiles(files: FileResults[]): ReportSummary {
    if (!files.length) {
      return new ReportSummary();
    }

    return files.reduce((acc, file) => acc.combine(file.summary), new ReportSummary());
  }

  private static relativeFilename(basedir: string, file: string): string {
    const relpath = path.relative(basedir, file);

    if (relpath.startsWith('..')) {
      return file;
    }
    return relpath;
  }
}
