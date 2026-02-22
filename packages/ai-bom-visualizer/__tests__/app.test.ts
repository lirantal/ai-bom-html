import { test, describe } from 'node:test'
import assert from 'node:assert'
import { run, injectBomIntoHtml, PLACEHOLDER_TOKEN } from '../src/main.ts'

describe('main exports', () => {
  test('exports run and injectBomIntoHtml', () => {
    assert.strictEqual(typeof run, 'function')
    assert.strictEqual(typeof injectBomIntoHtml, 'function')
    assert.strictEqual(PLACEHOLDER_TOKEN, '{{{PLACEHOLDER_JSON_TOKEN}}}')
  })
})
