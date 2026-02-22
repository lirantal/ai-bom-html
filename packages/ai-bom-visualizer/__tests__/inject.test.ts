import { test, describe } from 'node:test'
import assert from 'node:assert'
import { injectBomIntoHtml, PLACEHOLDER_TOKEN } from '../src/lib/inject.ts'

describe('injectBomIntoHtml', () => {
  test('replaces placeholder in script tag with BOM JSON', () => {
    const template = `<!DOCTYPE html><script type="application/json" id="bom-data">${PLACEHOLDER_TOKEN}</script>`
    const bom = '{"bomFormat":"CycloneDX","version":1}'
    const out = injectBomIntoHtml(template, bom)
    assert.ok(out.includes('id="bom-data">{"bomFormat":"CycloneDX","version":1}</script>'))
    assert.ok(!out.includes(PLACEHOLDER_TOKEN))
  })

  test('escapes </script in JSON', () => {
    const template = `<!DOCTYPE html><script type="application/json" id="bom-data">${PLACEHOLDER_TOKEN}</script>`
    const bom = '{"x":"</script><script>alert(1)</script>"}'
    const out = injectBomIntoHtml(template, bom)
    assert.ok(out.includes('\\u003c/script'))
    assert.ok(!out.includes('</script><script>'))
  })

  test('does not replace placeholder when not inside bom-data script tag', () => {
    const template = `const token="${PLACEHOLDER_TOKEN}";<script type="application/json" id="bom-data">${PLACEHOLDER_TOKEN}</script>`
    const bom = '{}'
    const out = injectBomIntoHtml(template, bom)
    assert.ok(out.includes(`const token="${PLACEHOLDER_TOKEN}"`))
    assert.ok(out.includes('id="bom-data">{}</script>'))
  })
})
