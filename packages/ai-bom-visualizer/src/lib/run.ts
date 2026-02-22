import fs from 'node:fs'
import path from 'node:path'
import { injectBomIntoHtml, PLACEHOLDER_TOKEN } from './inject.js'
import { getViewerTemplatePath } from './template-path.js'
import type { Opener } from './open-browser.js'

function minimalCycloneDXCheck (value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  return (
    Array.isArray(o.components) &&
    Array.isArray(o.dependencies) &&
    (o.bomFormat === 'CycloneDX' || typeof (o as { specVersion?: string }).specVersion === 'string')
  )
}

function getDefaultOutputFilename (): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  return `ai-bom-visual-output-${h}-${m}-${s}.html`
}

export interface RunOptions {
  /** JSON string (from stdin or file) */
  bomJson: string
  /** Directory containing the CLI entry (e.g. dist/bin) */
  binDir: string
  /** Output path; if not set, use timestamped name in cwd */
  outputPath?: string
  /** If true, open the output file in the default browser */
  view: boolean
  /** Optional opener; if not set, use default (open in browser) */
  opener?: Opener
}

/**
 * Load BOM JSON, inject into template, write HTML, optionally open in browser.
 */
export function run (options: RunOptions): string {
  const { bomJson, binDir, outputPath, view, opener } = options

  let parsed: unknown
  try {
    parsed = JSON.parse(bomJson)
  } catch {
    throw new Error('Invalid JSON')
  }
  if (!minimalCycloneDXCheck(parsed)) {
    throw new Error('Invalid CycloneDX AI-BOM: expected components and dependencies arrays')
  }

  let templatePath = getViewerTemplatePath(binDir)
  if (!fs.existsSync(templatePath)) {
    const distFallback = path.join(process.cwd(), 'dist', 'viewer-template.html')
    if (fs.existsSync(distFallback)) templatePath = distFallback
  }
  let template: string
  try {
    template = fs.readFileSync(templatePath, 'utf8')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to read viewer template: ${message}. Run "npm run build" in the package directory so dist/viewer-template.html exists.`)
  }

  if (!template.includes(PLACEHOLDER_TOKEN)) {
    throw new Error('Viewer template does not contain the expected placeholder token')
  }

  const html = injectBomIntoHtml(template, bomJson)
  const outPath = outputPath
    ? path.resolve(process.cwd(), outputPath)
    : path.join(process.cwd(), getDefaultOutputFilename())

  fs.writeFileSync(outPath, html, 'utf8')

  if (view && opener) {
    opener(outPath)
  }

  return outPath
}
