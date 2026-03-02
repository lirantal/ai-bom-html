import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

export interface ServeOptions {
  /** Path to an HTML file to serve. Mutually exclusive with `html`. */
  filePath?: string
  /** In-memory HTML content to serve. Mutually exclusive with `filePath`. */
  html?: string
  port?: number
  host?: string
}

/**
 * Start a local HTTP server that serves HTML content at every path.
 * Provide either `filePath` (reads from disk on each request) or `html`
 * (serves the string directly from memory, no file needed).
 */
export function serve (options: ServeOptions): Promise<http.Server> {
  const { filePath, html, port = 8081, host = 'localhost' } = options

  if (!filePath && html === undefined) {
    throw new Error('Either filePath or html must be provided')
  }

  let absolutePath: string | undefined
  if (filePath) {
    absolutePath = path.resolve(filePath)
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`)
    }
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer((_req, res) => {
      if (html !== undefined) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
        return
      }
      fs.readFile(absolutePath!, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' })
          res.end('Internal Server Error')
          return
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(data)
      })
    })

    server.on('error', reject)
    server.listen(port, host, () => {
      resolve(server)
    })
  })
}
