import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const BOM_INJECT_MARKER = '__BOM_INJECT__'
const PLACEHOLDER_TOKEN = '{{{PLACEHOLDER_JSON_TOKEN}}}'

/** Escape </script> in injected content so the HTML parser does not close the script tag. */
function escapeScriptContent(s: string): string {
  return s.replace(/<\/script/gi, '\\u003c/script')
}

function bomInjectPlugin() {
  const dataJsonPath = path.resolve(__dirname, 'data.json')
  const isTemplate = process.env.BUILD_TEMPLATE === '1'

  return {
    name: 'bom-inject',
    transformIndexHtml(html: string) {
      const raw = isTemplate ? PLACEHOLDER_TOKEN : fs.readFileSync(dataJsonPath, 'utf8')
      const content = escapeScriptContent(raw)
      return html.replace(BOM_INJECT_MARKER, content)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    bomInjectPlugin(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Inline all assets
    assetsInlineLimit: 100000000,
    // Single chunk
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
