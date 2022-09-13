import { threadId } from 'worker_threads';
import { Severity } from './CheckstyleViolation';

export class ReportSummary {
  ignored: number;
  info: number;
  warning: number;
  error: number;

  constructor(ignored: number = 0, info: number = 0, warning: number = 0, error: number = 0) {
    this.ignored = ignored;
    this.info = info;
    this.warning = warning;
    this.error = error;
  }

  incrementIgnored(): ReportSummary {
    this.ignored++;
    return this;
  }

  incrementInfo(): ReportSummary {
    this.info++;
    return this;
  }

  incrementWarning(): ReportSummary {
    this.warning++;
    return this;
  }

  incrementError(): ReportSummary {
    this.error++;
    return this;
  }

  checkThreshold(threshold: Severity): boolean {
    switch (threshold) {
      case Severity.Info:
        if (this.info > 0) {
          return true;
        }

      case Severity.Warning:
        if (this.warning > 0) {
          return true;
        }

      case Severity.Error:
        if (this.error > 0) {
          return true;
        }

      default:
        return false;
    }
  }

  combine(other: ReportSummary): ReportSummary {
    return new ReportSummary(
      this.ignored + other.ignored,
      this.info + other.info,
      this.warning + other.warning,
      this.error + other.error,
    );
  }
}
