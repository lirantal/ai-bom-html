# AI-BOM Toolkit: web application visualizer

This package creates a web page to interactively explore AI-BOM assets.

## Deployed Version

The AI-BOM web visualizer is deployed live here for public use: [https://aibom.vercel.app](https://aibom.vercel.app)

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