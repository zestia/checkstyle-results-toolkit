export interface CheckstyleViolation {
  line: number;
  severity: Severity;
  message: string;
  source: string;
}

export enum Severity {
  Ignore = 'ignore',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}
