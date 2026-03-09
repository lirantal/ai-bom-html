# AI-BOM CLI — Project overview

Note: this CLI project was previously named **ai-bom-visualizer**. It has now been renamed to **aibom** npm package name.

## Purpose

The **aibom** CLI reads CycloneDX AI-BOM JSON (from stdin or a file), injects it into a single-file HTML viewer template, and writes an HTML file. With `--view`, it opens the result in the default system browser. With `--serve`, it starts a local HTTP server on `localhost:8081` to serve the generated HTML. It is intended for use with tools like Snyk that emit AI-BOM on stdout:

```bash
snyk aibom --experimental --json | npx aibom --view
```

## Project structure

- **`src/bin/cli.ts`** — CLI entrypoint. Parses arguments with Node’s `util.parseArgs()`, reads JSON (stdin or `--file`), resolves the viewer template path, and calls the runner.
- **`src/lib/run.ts`** — Core flow. Exports `render()` (validate JSON/CycloneDX, load template, inject BOM, return HTML string) and `run()` (calls `render()`, writes HTML to disk, optionally opens in browser via injectable opener).
- **`src/lib/inject.ts`** — Replaces the placeholder token in the template with the BOM JSON and escapes `</script>` for safe embedding.
- **`src/lib/template-path.ts`** — Resolves the path to the bundled `viewer-template.html` relative to the bin directory.
- **`src/lib/open-browser.ts`** — Cross-platform “open in browser” (macOS `open`, Linux `xdg-open`, Windows `start`). Opener is injectable for tests.
- **`src/lib/serve.ts`** — Local HTTP server that serves HTML on `localhost:8081`. Accepts either a file path (reads from disk) or an in-memory HTML string. Used by the `--serve` CLI flag.
- **`src/main.ts`** — Library exports: `run`, `render`, `injectBomIntoHtml`, `PLACEHOLDER_TOKEN`, `serve`.
- **`scripts/copy-template.mjs`** — ESM script used at build time to copy the root project’s `dist/index.html` into this package’s `dist/viewer-template.html`.

## Relationship with the webapp

This CLI lives in **`packages/aibom`** inside the monorepo. The webapp in **`packages/webapp`** is a Vite app that builds a single-file AI-BOM viewer:

- **Webapp** runs `pnpm run build:template` (`BUILD_TEMPLATE=1 vite build`) and produces **`packages/webapp/dist/index.html`** with a placeholder `{{{PLACEHOLDER_JSON_TOKEN}}}` inside `<script type="application/json" id="bom-data">…</script>`.
- The **CLI build** depends on that template: it runs `pnpm --filter ai-bom-viewer build:template`, then copies **`../webapp/dist/index.html`** to **`dist/viewer-template.html`** so the published package contains the viewer.
- At runtime the CLI reads `dist/viewer-template.html` and replaces the placeholder with the user’s BOM JSON. By default it writes the result to a file (e.g. `ai-bom-visual-output-HH-mm-ss.html`); with `--serve` alone the HTML is kept in memory and served directly without writing to disk. The same placeholder appears once in the HTML script tag and once as a string in the bundled JS; only the script-tag occurrence is replaced.

See the webapp docs **`packages/webapp/docs/html-template.md`** and **`packages/webapp/docs/project.md`** for how the template build and BOM injection work.

## How to run tests

From **`packages/aibom`**:

```bash
# Unit and integration tests (no build required for unit tests)
npm test
```

- **Unit tests** (`__tests__/inject.test.ts`, `template-path.test.ts`, `run.test.ts`, `serve.test.ts`, `app.test.ts`) — Test inject, template path, `run()`/`render()` with mock opener, `serve()` with file and in-memory HTML, and main exports. They do not require a prior build.
- **E2E tests** (`__tests__/cli.e2e.test.ts`) — Spawn the built CLI (`dist/bin/cli.cjs`) with stdin / `--file` / `--output` / invalid JSON / `--view`. They are **skipped** if `dist/bin/cli.cjs` or `dist/viewer-template.html` is missing. Run **`npm run build`** first to execute e2e tests.

Coverage is reported by **c8** (see `package.json` scripts and `c8` config).

## Local development

To run the CLI from source (e.g. `node --import tsx src/bin/cli.ts` or `npm run start`) with piped input:

1. Run **`npm run build`** once so **`dist/viewer-template.html`** exists. The runner resolves the template relative to the running script; when running from `src/bin/cli.ts`, that path does not exist, so it falls back to **`dist/viewer-template.html`** under the current working directory.
2. From the package directory, pipe JSON or use `--file`:
   - `cat bom.json | npm run start`
   - `cat bom.json | npm run start -- --view`
   - `npm run start -- --file ./bom.json --view`
   - `npm run start -- --file ./bom.json --serve`

If you run the CLI with no input (no pipe and no `--file`) in an interactive terminal, it exits with a message instead of waiting: *"No input provided. Pipe AI-BOM JSON to stdin or use --file <path>. See --help."* Use **`--help`** to print usage.

## Build

```bash
npm run build
```

This runs, in order (see `package.json` scripts):

1. **`build:template:root`** — `pnpm --filter ai-bom-viewer build:template` to produce the webapp's `dist/index.html`.
2. **`tsc`** — TypeScript compile.
3. **`tsup`** — Bundle `src/main.ts` and `src/bin/cli.ts` to `dist/` (CJS and ESM).
4. **`copy:template`** — `node scripts/copy-template.mjs` to copy the webapp template into `dist/viewer-template.html`.

The package **files** include `dist`, so the published tarball contains `dist/bin/cli.cjs`, `dist/viewer-template.html`, and the library builds.
