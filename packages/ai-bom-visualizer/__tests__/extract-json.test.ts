import { test, describe } from 'node:test'
import assert from 'node:assert'
import { extractJson } from '../src/lib/extract-json.ts'

describe('extractJson', () => {
  test('returns clean JSON unchanged', () => {
    const json = '{"bomFormat":"CycloneDX","version":1}'
    assert.strictEqual(extractJson(json), json)
  })

  test('strips leading spinner/progress text', () => {
    const raw = '\\ Creating file bundle\n- Analyzing\n{"bomFormat":"CycloneDX","version":1}'
    assert.strictEqual(extractJson(raw), '{"bomFormat":"CycloneDX","version":1}')
  })

  test('strips trailing non-JSON content', () => {
    const raw = '{"bomFormat":"CycloneDX","version":1}\nSome trailing text'
    assert.strictEqual(extractJson(raw), '{"bomFormat":"CycloneDX","version":1}')
  })

  test('strips both leading and trailing non-JSON content', () => {
    const raw = 'spinner junk\n{"bomFormat":"CycloneDX"}\nmore junk'
    assert.strictEqual(extractJson(raw), '{"bomFormat":"CycloneDX"}')
  })

  test('handles whitespace-padded JSON', () => {
    const raw = '  \n  {"key":"value"}  \n  '
    assert.strictEqual(extractJson(raw), '{"key":"value"}')
  })

  test('returns trimmed input when no braces found', () => {
    assert.strictEqual(extractJson('  no json here  '), 'no json here')
  })

  test('returns trimmed input when only opening brace found', () => {
    assert.strictEqual(extractJson('  { incomplete  '), '{ incomplete')
  })

  test('handles nested objects correctly', () => {
    const json = '{"a":{"b":{"c":1}}}'
    const raw = `prefix\n${json}\nsuffix`
    assert.strictEqual(extractJson(raw), json)
  })
})
