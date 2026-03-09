# AI-BOM HTML — Agent context

This is a pnpm monorepo with two packages:

1. **Webapp: AI-BOM Viewer (Vite/React)** in `packages/webapp` — A single-file HTML viewer for CycloneDX AI-BOM. Build with `pnpm run build` or `pnpm run build:template` from the repo root (proxy scripts delegate to the webapp). See `packages/webapp/docs/project.md` and `packages/webapp/docs/html-template.md` for build and data flow.

2. **CLI: aibom** in `packages/aibom` — A Node.js CLI that reads AI-BOM JSON (stdin or `--file`), injects it into the viewer template, and writes HTML (optionally opens with `--view`). Typical use: `snyk aibom --experimental --json | npx aibom --view`.

For a deeper dive on the CLI (structure, tests, relationship with the webapp), see **[packages/aibom/docs/project.md](packages/aibom/docs/project.md)**.
