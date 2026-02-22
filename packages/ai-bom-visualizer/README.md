<!-- markdownlint-disable -->

<p align="center"><h1 align="center">
  ai-bom-visualizer
</h1>

<p align="center">
  A Command-Line tool for an AI-BOM Visualizer
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ai-bom-visualizer"><img src="https://badgen.net/npm/v/ai-bom-visualizer" alt="npm version"/></a>
  <a href="https://www.npmjs.com/package/ai-bom-visualizer"><img src="https://badgen.net/npm/license/ai-bom-visualizer" alt="license"/></a>
  <a href="https://www.npmjs.com/package/ai-bom-visualizer"><img src="https://badgen.net/npm/dt/ai-bom-visualizer" alt="downloads"/></a>
  <a href="https://github.com/lirantal/ai-bom-visualizer/actions?workflow=CI"><img src="https://github.com/lirantal/ai-bom-visualizer/workflows/CI/badge.svg" alt="build"/></a>
  <a href="https://codecov.io/gh/lirantal/ai-bom-visualizer"><img src="https://badgen.net/codecov/c/github/lirantal/ai-bom-visualizer" alt="codecov"/></a>
  <a href="https://snyk.io/test/github/lirantal/ai-bom-visualizer"><img src="https://snyk.io/test/github/lirantal/ai-bom-visualizer/badge.svg" alt="Known Vulnerabilities"/></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
</p>

## Install

```sh
npm add ai-bom-visualizer
```
## Usage

Pipe AI-BOM JSON from stdin and open the result in your browser:

```bash
snyk aibom --experimental --json | npx ai-bom-visualizer --view
```

**Options:**

- **`--view`**, **`-v`** — After writing the HTML file, open it in the default system browser.
- **`--file <path>`**, **`-f`** — Read AI-BOM JSON from a file instead of stdin.
- **`--output <path>`**, **`-o`** — Write the HTML to this path (default: `ai-bom-visual-output-HH-mm-ss.html` in the current directory).

**Examples:**

```bash
# From stdin (e.g. Snyk)
snyk aibom --experimental --json | npx ai-bom-visualizer --view

# From a file
npx ai-bom-visualizer --file ./my-bom.json --output report.html --view
```

## Build

Building this package requires the root project’s HTML viewer template. From this package directory, run:

```bash
npm run build
```

This runs `build:template:root` (builds the template in the repo root), then `tsc`, `tsup`, and copies the template into `dist/viewer-template.html`. If the root template is missing, run `npm run build:template` from the repository root first.

## Contributing

Please consult [CONTRIBUTING](./.github/CONTRIBUTING.md) for guidelines on contributing to this project.

## Author

**ai-bom-visualizer** © [Liran Tal](https://github.com/lirantal), Released under the [Apache-2.0](./LICENSE) License.
