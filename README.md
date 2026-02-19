# AI-BOM Viewer

A single-page viewer for **CycloneDX AI Bill of Materials** (AI-BOM). Renders components (models, agents, MCP servers, libraries, etc.) and their dependencies as an interactive constellation graph. Built to output one self-contained **`dist/index.html`** — no server required.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/index.html (single file, all assets inlined)
npm run preview  # preview production build
```

Default BOM comes from **`data.json`** at project root (injected into the HTML at build time); edit it and rebuild to change the default graph. See [docs/project.md](docs/project.md) for build and data source details. To build a data-free viewer for another project to inject their BOM later, use **`npm run build:template`** — see [docs/html-template.md](docs/html-template.md).

## Features

| Feature | Description |
|--------|-------------|
| [Constellation layout](docs/feature/constellation-layout.md) | Radial/orbital graph, rings by type, dashboard cards, legend |
| [Search](docs/feature/search.md) | Fuzzy filter by name/type; ⌘K / Ctrl+K to focus |
| [Zoom](docs/feature/zoom.md) & [Zoom to fit](docs/feature/zoom-to-fit.md) | Pan/zoom canvas; fit-all and reset |
| [Show JSON](docs/feature/show-json.md) | Raw CycloneDX panel + copy to clipboard |
| [Upload JSON](docs/feature/json-upload.md) | Load another AI-BOM file from disk |
| [Components legend](docs/feature/components-legend.md) | Collapsible type legend |
| [Dashboard stats](docs/feature/dashboard-cards-stats.md) | Component counts by type |
| [Logo](docs/feature/logo.md) | Evo by Snyk branding in header |

## Tech

React, TypeScript, Vite, Tailwind. Single-file output via [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile).
