import path from 'node:path'

/**
 * Returns the path to the bundled viewer-template.html relative to the bin directory.
 * Call with the directory containing the CLI entry (e.g. dist/bin).
 */
export function getViewerTemplatePath (binDir: string): string {
  return path.join(binDir, '..', 'viewer-template.html')
}
