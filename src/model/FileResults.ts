import { CheckstyleViolation } from './CheckstyleViolation';
import { ReportSummary } from './ReportSummary';

export class FileResults {
  name: string;
  summary: ReportSummary;
  violations: CheckstyleViolation[];

  constructor(name: string, summary: ReportSummary, violations: CheckstyleViolation[]) {
    this.name = name;
    this.summary = summary;
    this.violations = violations;
  }

  get hasViolations(): boolean {
    return this.violations.length > 0;
  }
}
