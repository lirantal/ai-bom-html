import { test, describe } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import http from 'node:http'
import { serve } from '../src/lib/serve.ts'

function get (url: string): Promise<{ status: number; body: string; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body, headers: res.headers }))
    }).on('error', reject)
  })
}

describe('serve', () => {
  test('throws when neither filePath nor html is provided', () => {
    assert.throws(
      () => serve({ port: 0 }),
      /Either filePath or html must be provided/
    )
  })

  test('throws when file does not exist', () => {
    assert.throws(
      () => serve({ filePath: '/tmp/nonexistent-aibom-test-file.html', port: 0 }),
      /File not found/
    )
  })

  test('serves HTML from a file at the root path', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aibom-serve-'))
    const htmlPath = path.join(tmpDir, 'test.html')
    const htmlContent = '<!DOCTYPE html><html><body><h1>AI-BOM Test</h1></body></html>'
    fs.writeFileSync(htmlPath, htmlContent)

    const server = await serve({ filePath: htmlPath, port: 0, host: '127.0.0.1' })
    const addr = server.address()
    assert.ok(addr && typeof addr === 'object')
    const port = addr.port

    try {
      const res = await get(`http://127.0.0.1:${port}/`)
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body, htmlContent)
      assert.ok(res.headers['content-type']?.includes('text/html'))
    } finally {
      server.close()
      fs.rmSync(tmpDir, { recursive: true })
    }
  })

  test('serves in-memory HTML content', async () => {
    const htmlContent = '<!DOCTYPE html><html><body><h1>In-Memory</h1></body></html>'

    const server = await serve({ html: htmlContent, port: 0, host: '127.0.0.1' })
    const addr = server.address()
    assert.ok(addr && typeof addr === 'object')
    const port = addr.port

    try {
      const res = await get(`http://127.0.0.1:${port}/`)
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body, htmlContent)
      assert.ok(res.headers['content-type']?.includes('text/html'))
    } finally {
      server.close()
    }
  })

  test('serves the same content for any path', async () => {
    const htmlContent = '<html><body>hello</body></html>'

    const server = await serve({ html: htmlContent, port: 0, host: '127.0.0.1' })
    const addr = server.address()
    assert.ok(addr && typeof addr === 'object')
    const port = addr.port

    try {
      const res = await get(`http://127.0.0.1:${port}/some/other/path`)
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body, htmlContent)
    } finally {
      server.close()
    }
  })
})
