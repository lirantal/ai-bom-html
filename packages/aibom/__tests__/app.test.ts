import { test, describe } from 'node:test'
import assert from 'node:assert'
import { run, render, injectBomIntoHtml, PLACEHOLDER_TOKEN, serve } from '../src/main.ts'

describe('main exports', () => {
  test('exports run, render, injectBomIntoHtml, and serve', () => {
    assert.strictEqual(typeof run, 'function')
    assert.strictEqual(typeof render, 'function')
    assert.strictEqual(typeof injectBomIntoHtml, 'function')
    assert.strictEqual(typeof serve, 'function')
    assert.strictEqual(PLACEHOLDER_TOKEN, '{{{PLACEHOLDER_JSON_TOKEN}}}')
  })
})
