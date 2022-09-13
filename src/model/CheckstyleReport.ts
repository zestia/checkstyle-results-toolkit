import { createVerify } from 'crypto';
import { FileResults } from './FileResults';
import { ReportSummary } from './ReportSummary';

export class CheckstyleReport {
  checkstyleVersion: string;

  summary: ReportSummary;
  files: FileResults[];

  constructor(checkstyleVersion: string, summary: ReportSummary, files: FileResults[]) {
    this.checkstyleVersion = checkstyleVersion;
    this.summary = summary;
    this.files = files;
  }

  combine(other: CheckstyleReport): CheckstyleReport {
    // TODO is there anything we could do if versions differ?
    const checkstyleVersion = this.checkstyleVersion;
    const summary = this.summary.combine(other.summary);
    const files = this.files.concat(other.files).sort();

    return new CheckstyleReport(checkstyleVersion, summary, files);
  }
}
