# AI-BOM HTML — Agent context

This repository contains:

1. **Root: AI-BOM Viewer (Vite/React)** — A single-file HTML viewer for CycloneDX AI-BOM. Build with `npm run build` or `npm run build:template` for a template with a JSON placeholder. See `docs/project.md` and `docs/html-template.md` in the repo for build and data flow.

2. **CLI: ai-bom-visualizer** — A Node.js CLI in `packages/ai-bom-visualizer` that reads AI-BOM JSON (stdin or `--file`), injects it into the viewer template, and writes HTML (optionally opens with `--view`). Typical use: `snyk aibom --experimental --json | npx ai-bom-visualizer --view`.

For a deeper dive on the CLI (structure, tests, relationship with the root visualizer), see **[packages/ai-bom-visualizer/docs/project.md](packages/ai-bom-visualizer/docs/project.md)**.
