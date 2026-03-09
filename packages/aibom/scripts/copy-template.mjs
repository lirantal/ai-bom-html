import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()
const source = path.resolve(cwd, '../webapp/dist/index.html')
const dest = path.resolve(cwd, 'dist/viewer-template.html')

if (!fs.existsSync(source)) {
  console.error('aibom: Webapp template not found at packages/webapp/dist/index.html. Run "pnpm run build:template" from the repo root first.')
  process.exit(1)
}

const destDir = path.dirname(dest)
if (!fs.existsSync(destDir)) {
  console.error('aibom: dist/ not found. Run "tsup" (or full build) first so dist/ exists.')
  process.exit(1)
}

fs.cpSync(source, dest)
console.log('Copied viewer template to dist/viewer-template.html')
