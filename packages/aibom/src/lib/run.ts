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

export interface RenderOptions {
  bomJson: string
  binDir: string
}

export function render (options: RenderOptions): string {
  const { bomJson, binDir } = options

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

  return injectBomIntoHtml(template, bomJson)
}

export interface RunOptions {
  bomJson: string
  binDir: string
  outputPath?: string
  view: boolean
  opener?: Opener
}

export function run (options: RunOptions): string {
  const { bomJson, binDir, outputPath, view, opener } = options

  const html = render({ bomJson, binDir })
  const outPath = outputPath
    ? path.resolve(process.cwd(), outputPath)
    : path.join(process.cwd(), getDefaultOutputFilename())

  fs.writeFileSync(outPath, html, 'utf8')

  if (view && opener) {
    opener(outPath)
  }

  return outPath
}
