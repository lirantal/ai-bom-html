import { test, describe } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const cliPath = path.join(process.cwd(), 'dist', 'bin', 'cli.cjs')
const templatePath = path.join(process.cwd(), 'dist', 'viewer-template.html')
const fixturePath = path.join(process.cwd(), '__tests__', '__fixtures__', 'sample-bom.json')

const hasBuild = fs.existsSync(cliPath) && fs.existsSync(templatePath)

function runCli(args: string[], stdin?: string): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const proc = spawn('node', [cliPath, ...args], {
      cwd: process.cwd(),
      stdio: stdin !== undefined ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    proc.stdout?.on('data', (d) => { stdout += d })
    proc.stderr?.on('data', (d) => { stderr += d })
    if (stdin !== undefined && proc.stdin) {
      proc.stdin.write(stdin)
      proc.stdin.end()
    }
    proc.on('close', (code) => resolve({ stdout, stderr, code: code ?? null }))
  })
}

/**
 * Simulate a slow producer that writes spinner text first, pauses, then writes
 * JSON — mimicking the Snyk CLI behaviour that prefixes stdout with progress
 * animation before emitting the actual payload.
 */
function runCliWithDelayedStdin(
  args: string[],
  chunks: { data: string; delayMs: number }[],
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const proc = spawn('node', [cliPath, ...args], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    proc.stdout?.on('data', (d) => { stdout += d })
    proc.stderr?.on('data', (d) => { stderr += d })

    let offset = 0
    for (const chunk of chunks) {
      offset += chunk.delayMs
      setTimeout(() => { proc.stdin?.write(chunk.data) }, offset)
    }
    setTimeout(() => { proc.stdin?.end() }, offset + 50)

    proc.on('close', (code) => resolve({ stdout, stderr, code: code ?? null }))
  })
}

describe('CLI e2e', () => {
  const minimalBom = '{"bomFormat":"CycloneDX","specVersion":"1.6","version":1,"components":[],"dependencies":[]}'

  test('reads JSON from stdin and writes HTML file', { skip: !hasBuild }, async () => {
    const { stdout, stderr, code } = await runCli([], minimalBom)
    assert.strictEqual(code, 0, `stderr: ${stderr}`)
    const outPath = stdout.trim()
    assert.ok(outPath.endsWith('.html'))
    assert.ok(fs.existsSync(outPath))
    const content = fs.readFileSync(outPath, 'utf8')
    assert.ok(content.includes('"bomFormat":"CycloneDX"'))
    fs.unlinkSync(outPath)
  })

  test('--file reads JSON from file', { skip: !hasBuild }, async () => {
    const { stdout, stderr, code } = await runCli(['--file', fixturePath])
    assert.strictEqual(code, 0, `stderr: ${stderr}`)
    const outPath = stdout.trim()
    assert.ok(fs.existsSync(outPath))
    const content = fs.readFileSync(outPath, 'utf8')
    assert.ok(content.includes('SampleApp'))
    fs.unlinkSync(outPath)
  })

  test('--output writes to specified path', { skip: !hasBuild }, async () => {
    const outFile = path.join(process.cwd(), 'e2e-output-custom.html')
    const { stdout, stderr, code } = await runCli(['--output', outFile], minimalBom)
    assert.strictEqual(code, 0, `stderr: ${stderr}`)
    assert.strictEqual(stdout.trim(), outFile)
    assert.ok(fs.existsSync(outFile))
    fs.unlinkSync(outFile)
  })

  test('invalid JSON on stdin exits non-zero and prints error', { skip: !hasBuild }, async () => {
    const { stdout, stderr, code } = await runCli([], 'not json')
    assert.notStrictEqual(code, 0)
    assert.ok(stderr.includes('ai-bom-visualizer') || stderr.includes('Invalid'))
  })

  test('--view exits 0 and creates file (opener may run)', { skip: !hasBuild }, async () => {
    const { stdout, stderr, code } = await runCli(['--view'], minimalBom)
    assert.strictEqual(code, 0, `stderr: ${stderr}`)
    const outPath = stdout.trim()
    assert.ok(fs.existsSync(outPath))
    fs.unlinkSync(outPath)
  })

  test('--help prints usage and exits 0', { skip: !hasBuild }, async () => {
    const { stdout, stderr, code } = await runCli(['--help'])
    assert.strictEqual(code, 0)
    assert.ok(stdout.includes('ai-bom-visualizer') && stdout.includes('--view') && stdout.includes('--file'))
  })

  test('handles stdin with leading spinner/progress text before JSON', { skip: !hasBuild }, async () => {
    const spinnerPrefix = '\\ Creating file bundle\n- Analyzing\n'
    const stdinWithPrefix = spinnerPrefix + minimalBom
    const { stdout, stderr, code } = await runCli([], stdinWithPrefix)
    assert.strictEqual(code, 0, `stderr: ${stderr}`)
    const outPath = stdout.trim()
    assert.ok(outPath.endsWith('.html'))
    assert.ok(fs.existsSync(outPath))
    const content = fs.readFileSync(outPath, 'utf8')
    assert.ok(content.includes('"bomFormat":"CycloneDX"'))
    fs.unlinkSync(outPath)
  })

  test('handles delayed stdin from a slow producer', { skip: !hasBuild }, async () => {
    const { stdout, stderr, code } = await runCliWithDelayedStdin([], [
      { data: '\\ Creating file bundle\n', delayMs: 0 },
      { data: '- Analyzing\n', delayMs: 100 },
      { data: minimalBom, delayMs: 200 },
    ])
    assert.strictEqual(code, 0, `stderr: ${stderr}`)
    const outPath = stdout.trim()
    assert.ok(outPath.endsWith('.html'))
    assert.ok(fs.existsSync(outPath))
    const content = fs.readFileSync(outPath, 'utf8')
    assert.ok(content.includes('"bomFormat":"CycloneDX"'))
    fs.unlinkSync(outPath)
  })
})
