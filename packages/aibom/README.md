<!-- markdownlint-disable -->

<p align="center"><h1 align="center">
  aibom toolkit and cli
</h1>

<p align="center">
  An AI-BOM toolkit and Command-Line tool
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ai-bom-visualizer"><img src="https://badgen.net/npm/v/ai-bom-visualizer" alt="npm version"/></a>
  <a href="https://www.npmjs.com/package/ai-bom-visualizer"><img src="https://badgen.net/npm/license/ai-bom-visualizer" alt="license"/></a>
  <a href="https://www.npmjs.com/package/ai-bom-visualizer"><img src="https://badgen.net/npm/dt/ai-bom-visualizer" alt="downloads"/></a>
  <a href="https://github.com/lirantal/ai-bom-visualizer/actions?workflow=CI"><img src="https://github.com/lirantal/ai-bom-visualizer/workflows/CI/badge.svg" alt="build"/></a>
  <a href="https://app.codecov.io/gh/lirantal/ai-bom-visualizer"><img src="https://badgen.net/codecov/c/github/lirantal/ai-bom-visualizer" alt="codecov"/></a>
  <a href="https://snyk.io/test/github/lirantal/ai-bom-visualizer"><img src="https://snyk.io/test/github/lirantal/ai-bom-visualizer/badge.svg" alt="Known Vulnerabilities"/></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
</p>

## Install

```sh
npm add aibom
```
## Usage

Pipe AI-BOM JSON from stdin and open the result in your browser:

```bash
snyk aibom --experimental --json | npx aibom --view
```

**Options:**

- **`--view`**, **`-v`** — After writing the HTML file, open it in the default system browser.
- **`--file <path>`**, **`-f`** — Read AI-BOM JSON from a file instead of stdin.
- **`--output <path>`**, **`-o`** — Write the HTML to this path (default: `ai-bom-visual-output-HH-mm-ss.html` in the current directory).

**Examples:**

```bash
# From stdin (e.g. Snyk)
snyk aibom --experimental --json | npx aibom --view

# From a file
npx aibom --file ./my-bom.json --output report.html --view
```

## Build

Building this package requires the root project’s HTML viewer template. From this package directory, run:

```bash
npm run build
```

This runs `build:template:root` (builds the template in the repo root), then `tsc`, `tsup`, and copies the template into `dist/viewer-template.html`. If the root template is missing, run `npm run build:template` from the repository root first.

### Developers quickstart of AI-BOM CLI package

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/index.html (single file, all assets inlined)
npm run preview  # preview production build
```

Default BOM comes from **`data.json`** at project root (injected into the HTML at build time); edit it and rebuild to change the default graph. See [docs/project.md](docs/project.md) for build and data source details. To build a data-free viewer for another project to inject their BOM later, use **`npm run build:template`** — see [docs/html-template.md](docs/html-template.md).

## Contributing

Please consult [CONTRIBUTING](../../.github/CONTRIBUTING.md) for guidelines on contributing to this project.

## Author

**aibom** © [Liran Tal](https://github.com/lirantal), Released under the [Apache-2.0](./LICENSE) License.
