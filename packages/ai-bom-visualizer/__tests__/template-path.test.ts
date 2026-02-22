import { test, describe } from 'node:test'
import assert from 'node:assert'
import path from 'node:path'
import { getViewerTemplatePath } from '../src/lib/template-path.ts'

describe('getViewerTemplatePath', () => {
  test('returns path ending with viewer-template.html under parent of bin dir', () => {
    const binDir = path.join(process.cwd(), 'dist', 'bin')
    const result = getViewerTemplatePath(binDir)
    assert.strictEqual(path.basename(result), 'viewer-template.html')
    assert.ok(result.endsWith('viewer-template.html'))
    assert.strictEqual(path.dirname(result), path.join(process.cwd(), 'dist'))
  })
})
