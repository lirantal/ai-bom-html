import { test, describe } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { run } from '../src/lib/run.ts'
import { PLACEHOLDER_TOKEN } from '../src/lib/inject.ts'

const minimalBom = JSON.stringify({
  bomFormat: 'CycloneDX',
  specVersion: '1.6',
  version: 1,
  components: [],
  dependencies: [],
})

const templateWithPlaceholder = `<!DOCTYPE html><html><body><script type="application/json" id="bom-data">${PLACEHOLDER_TOKEN}</script></body></html>`

describe('run', () => {
  test('throws on invalid JSON', () => {
    assert.throws(
      () =>
        run({
          bomJson: 'not json',
          binDir: os.tmpdir(),
          view: false,
        }),
      /Invalid JSON/
    )
  })

  test('throws on invalid CycloneDX shape', () => {
    assert.throws(
      () =>
        run({
          bomJson: '{"foo":1}',
          binDir: os.tmpdir(),
          view: false,
        }),
      /Invalid CycloneDX/
    )
  })

  test('writes HTML and returns path; opener not called when view is false', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aibom-'))
    const templatePath = path.join(tmpDir, 'viewer-template.html')
    fs.writeFileSync(templatePath, templateWithPlaceholder)
    const binDir = path.join(tmpDir, 'bin')
    fs.mkdirSync(binDir, { recursive: true })
    const outPath = path.join(tmpDir, 'out.html')

    const openerCalls: string[] = []
    const out = run({
      bomJson: minimalBom,
      binDir,
      outputPath: outPath,
      view: false,
      opener: (p) => openerCalls.push(p),
    })

    assert.strictEqual(out, outPath)
    assert.strictEqual(openerCalls.length, 0)
    const content = fs.readFileSync(outPath, 'utf8')
    assert.ok(content.includes('"bomFormat":"CycloneDX"'))
    fs.rmSync(tmpDir, { recursive: true })
  })

  test('calls opener with output path when view is true', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aibom-'))
    const templatePath = path.join(tmpDir, 'viewer-template.html')
    fs.writeFileSync(templatePath, templateWithPlaceholder)
    const binDir = path.join(tmpDir, 'bin')
    fs.mkdirSync(binDir, { recursive: true })
    const outPath = path.join(tmpDir, 'out.html')

    const openerCalls: string[] = []
    const out = run({
      bomJson: minimalBom,
      binDir,
      outputPath: outPath,
      view: true,
      opener: (p) => openerCalls.push(p),
    })

    assert.strictEqual(out, outPath)
    assert.strictEqual(openerCalls.length, 1)
    assert.strictEqual(openerCalls[0], outPath)
    fs.rmSync(tmpDir, { recursive: true })
  })
})
