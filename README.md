# Checkstyle Results Toolkit

GitHub action that parses Checkstyle reports, outputs a JSON summary and (optionally) generates an HTML report.

## Usage

To parse results in Checkstyle XML format add this action as a step:

```yaml
jobs:
  java-build:
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: 11

      - name: Run style checks
        run: sbt checkstyle

      - name: Parse Checkstyle Results
        uses: zestia/checkstyle-results-toolkit@v1
        id: style-results
        if: ${{ always() }}
        with:
          files: '**/checkstyle-report.xml'

      - name: Echo Style Results
        run: |
          echo "Test Results:"
          echo "  Ignored: ${{ fromJson(steps.style-results.outputs.checkstyle-results).ignored }}"
          echo "  Info:    ${{ fromJson(steps.style-results.outputs.checkstyle-results).info }}"
          echo "  Warning: ${{ fromJson(steps.style-results.outputs.checkstyle-results).warning }}"
          echo "  Error:   ${{ fromJson(steps.style-results.outputs.checkstyle-results).error }}"
```

**Note:** it is important to add an `if` clause to ensure that the Checkstyle results are always parsed.

## Options

| Name             | Description                                                                             | Default                               |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------- |
| `files`          | Glob pattern to match Checkstyle XML files. Multiple matching reports will be combined. | _none_ (required)                     |
| `upload-report`  | If `true` then an HTML report will be generated & uploaded to `$artifact-name`.         | `true`                                |
| `artifact-name`  | Name of the artifact to use when uploading HTML report.                                 | `checkstyle-report-${context.job}`    |
| `retention-days` | Number of days to retain HTML report artifact.                                          | Repository default (usually 90 days). |

## Outputs

### `checkstyle-results`

Summary of Checkstyle results in JSON format.

For example:

```json
{
  "ignored": 0,
  "info": 3,
  "warning": 1,
  "error": 0
}
```
