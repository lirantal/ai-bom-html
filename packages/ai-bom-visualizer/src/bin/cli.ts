#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { run } from '../lib/run.js'
import { getDefaultOpener } from '../lib/open-browser.js'

function getBinDir (): string {
  // ESM: use import.meta.url (resolves to the actual script file)
  try {
    const url = (import.meta as { url?: string }).url
    if (url?.startsWith('file:')) {
      return path.dirname(fileURLToPath(url))
    }
  } catch {
    // CJS or no import.meta
  }
  // Fallback: resolve argv[1] so symlinks (e.g. npx -> node_modules/.bin/ai-bom-visualizer) resolve to real cli.cjs
  const scriptPath = process.argv[1]
  if (scriptPath) {
    try {
      const real = fs.realpathSync(scriptPath)
      return path.dirname(real)
    } catch {
      // realpathSync can fail for some paths; use unresolved path
    }
  }
  return path.dirname(path.resolve(scriptPath ?? '.'))
}

function readStdin (): string {
  return fs.readFileSync(0, 'utf8')
}

function printHelp (): void {
  const help = `
ai-bom-visualizer — Render CycloneDX AI-BOM JSON as an HTML visual

USAGE
  ai-bom-visualizer [options]
  cat bom.json | ai-bom-visualizer [options]

OPTIONS
  -v, --view      Open the generated HTML in the default browser
  -f, --file <path>  Read AI-BOM JSON from a file instead of stdin
  -o, --output <path>  Write HTML to this path (default: ai-bom-visual-output-HH-mm-ss.html)
  -h, --help      Show this help

EXAMPLES
  snyk aibom --experimental --json | npx ai-bom-visualizer --view
  npx ai-bom-visualizer --file ./bom.json --output report.html --view
`
  console.log(help.trim())
}

function main (): number {
  const { values } = parseArgs({
    options: {
      view: { type: 'boolean', short: 'v', default: false },
      file: { type: 'string', short: 'f' },
      output: { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
  })

  if (values.help) {
    printHelp()
    return 0
  }

  let bomJson: string
  if (values.file) {
    try {
      bomJson = fs.readFileSync(path.resolve(process.cwd(), values.file), 'utf8')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`ai-bom-visualizer: Failed to read file: ${message}`)
      return 1
    }
  } else {
    if (process.stdin.isTTY) {
      console.error(
        'ai-bom-visualizer: No input provided. Pipe AI-BOM JSON to stdin or use --file <path>. See --help.'
      )
      return 1
    }
    try {
      bomJson = readStdin()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const noInput = /EAGAIN|temporarily unavailable|EOF/i.test(message)
      console.error(
        noInput
          ? 'ai-bom-visualizer: No input provided. Pipe AI-BOM JSON to stdin or use --file <path>. See --help.'
          : `ai-bom-visualizer: Failed to read stdin: ${message}`
      )
      return 1
    }
    if (!bomJson?.trim()) {
      console.error(
        'ai-bom-visualizer: No input provided. Pipe AI-BOM JSON to stdin or use --file <path>. See --help.'
      )
      return 1
    }
  }

  const binDir = getBinDir()
  const opener = values.view ? getDefaultOpener() : undefined

  try {
    const outPath = run({
      bomJson,
      binDir,
      outputPath: values.output,
      view: values.view ?? false,
      opener,
    })
    console.log(outPath)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`ai-bom-visualizer: ${message}`)
    return 1
  }

  return 0
}

process.exitCode = main()
