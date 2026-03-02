#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { run, render } from '../lib/run.js'
import { getDefaultOpener } from '../lib/open-browser.js'
import { extractJson } from '../lib/extract-json.js'
import { serve } from '../lib/serve.js'

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

async function readStdin (): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function printHelp (): void {
  const help = `
ai-bom-visualizer — Render CycloneDX AI-BOM JSON as an HTML visual

USAGE
  ai-bom-visualizer [options]
  cat bom.json | ai-bom-visualizer [options]

OPTIONS
  -v, --view      Open the generated HTML in the default browser
  -s, --serve     Serve the generated HTML on http://localhost:8081
  -f, --file <path>  Read AI-BOM JSON from a file instead of stdin
  -o, --output <path>  Write HTML to this path (default: ai-bom-visual-output-HH-mm-ss.html)
  -h, --help      Show this help

EXAMPLES
  snyk aibom --experimental --json | npx ai-bom-visualizer --view
  npx ai-bom-visualizer --file ./bom.json --output report.html --view
  npx ai-bom-visualizer --file ./bom.json --serve
`
  console.log(help.trim())
}

async function main (): Promise<number> {
  const { values } = parseArgs({
    options: {
      view: { type: 'boolean', short: 'v', default: false },
      serve: { type: 'boolean', short: 's', default: false },
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
    let rawStdin: string
    try {
      rawStdin = await readStdin()
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
    if (!rawStdin?.trim()) {
      console.error(
        'ai-bom-visualizer: No input provided. Pipe AI-BOM JSON to stdin or use --file <path>. See --help.'
      )
      return 1
    }
    bomJson = extractJson(rawStdin)
  }

  const binDir = getBinDir()
  const needsFile = values.view || values.output || !values.serve

  if (needsFile) {
    const opener = values.view ? getDefaultOpener() : undefined
    let outPath: string
    try {
      outPath = run({
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

    if (values.serve) {
      try {
        const port = 8081
        await serve({ filePath: outPath, port })
        console.log(`Serving on http://localhost:${port} — press Ctrl+C to stop`)
        await new Promise(() => {})
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`ai-bom-visualizer: Failed to start server: ${message}`)
        return 1
      }
    }
  } else {
    let html: string
    try {
      html = render({ bomJson, binDir })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`ai-bom-visualizer: ${message}`)
      return 1
    }

    try {
      const port = 8081
      await serve({ html, port })
      console.log(`Serving on http://localhost:${port} — press Ctrl+C to stop`)
      await new Promise(() => {})
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`ai-bom-visualizer: Failed to start server: ${message}`)
      return 1
    }
  }

  return 0
}

main().then((code) => { process.exitCode = code })
