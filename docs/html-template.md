# HTML template build (data-free viewer)

This document describes the **template build**: a variant of the AI-BOM viewer that produces a single HTML file **without** embedding a specific BOM. Instead, the output contains a **placeholder token** that another project can replace with its own BOM JSON at its own build time. That lets you ship the viewer as a reusable artifact and inject data later.

---

## Why this exists

- **Normal build** (`npm run build`): Embeds the contents of **`data.json`** into the app so the built `dist/index.html` shows that BOM by default.
- **Template build** (`npm run build:template`): Produces the same single-file viewer, but the default BOM is a **placeholder** (`{{{PLACEHOLDER_JSON_TOKEN}}}`). No knowledge of the final data is required at this repo’s build time. Another project can:
  1. Take `dist/index.html` from the template build.
  2. At **their** build time, replace `{{{PLACEHOLDER_JSON_TOKEN}}}` with their actual BOM JSON string.
  3. Serve or ship the resulting HTML (e.g. as a report or dashboard).

So the viewer is built once as a “shell”; the data is supplied by the consumer.

---

## How the default BOM is provided

The app no longer imports `data.json` at build time. Instead:

1. **HTML** includes a script tag that holds the BOM (or the placeholder):

   ```html
   <script type="application/json" id="bom-data">…</script>
   ```

2. **At build time**, a Vite plugin injects the content of that tag:
   - **Normal build / dev:** contents of **`data.json`** (so the app behaves as before).
   - **Template build:** the literal string **`{{{PLACEHOLDER_JSON_TOKEN}}}`** (invalid JSON on purpose, so the app treats it as “no data” until the consumer replaces it).

3. **At runtime**, the app reads the BOM with:
   - `document.getElementById('bom-data')?.textContent`
   - then `JSON.parse(...)` and validation.

If the script tag is missing, contains the placeholder, or contains invalid JSON, the app falls back to a **minimal valid CycloneDX BOM** (empty `components` and `dependencies`) so the UI still loads and the user can upload a file.

### Why use `<script type="application/json">`?

- The browser **does not execute** content when `type` is `application/json`; it’s inert text.
- The only way to “break out” of the script tag in HTML is the literal sequence `</script>`. The build injects JSON with that sequence escaped (e.g. `\u003c/script`) so the tag is not closed early.
- This pattern is common for embedding JSON in HTML (e.g. SSR/hydration). The consumer can do a **simple string replace** of the placeholder with their **raw** JSON; they only need to escape a literal `</script>` inside their JSON if it appears (rare).

---

## Running the template build

From the project root:

```bash
npm run build:template
```

This sets `BUILD_TEMPLATE=1` and runs `vite build`. The output is still **`dist/index.html`**, but the `<script id="bom-data">` body is the placeholder instead of `data.json`.

- **Placeholder token:** `{{{PLACEHOLDER_JSON_TOKEN}}}`
- **Location in output:** inside the only `<script type="application/json" id="bom-data">…</script>` in the file. The rest of the HTML is the full inlined viewer (JS + CSS).

---

## Consumer workflow: replacing the placeholder

The consuming project should, at **its** build or publish step:

1. Read the template HTML (e.g. the `dist/index.html` produced by `npm run build:template` in this repo, or a copy they ship).
2. Replace the string **`{{{PLACEHOLDER_JSON_TOKEN}}}`** with their **BOM JSON string** (the serialized CycloneDX AI-BOM).
3. Write the result to their own output (e.g. their `dist/` or report artifact).

Example (Node):

```js
const html = fs.readFileSync('path/to/template-index.html', 'utf8');
const bomJson = JSON.stringify(myBomObject); // or read from file
// If the JSON can contain "</script>", escape it so the HTML script tag doesn’t close early:
const safeBom = bomJson.replace(/<\/script/gi, '\\u003c/script');
const finalHtml = html.replace('{{{PLACEHOLDER_JSON_TOKEN}}}', safeBom);
fs.writeFileSync('path/to/output/index.html', finalHtml);
```

If their BOM JSON never contains the literal substring `</script>`, a single string replace of the placeholder is enough.

---

## Technical details

### Build pipeline

- **Plugin:** `bom-inject` in **`vite.config.ts`**.
- **Hook:** `transformIndexHtml`. The plugin runs **before** `vite-plugin-singlefile`, so the HTML that gets inlined already has the BOM (or placeholder) in the script tag.
- **Marker in source HTML:** `index.html` contains `<script type="application/json" id="bom-data">__BOM_INJECT__</script>`. The plugin replaces `__BOM_INJECT__` with either:
  - `fs.readFileSync('data.json', 'utf8')` (normal build and dev), or
  - `{{{PLACEHOLDER_JSON_TOKEN}}}` (when `BUILD_TEMPLATE=1`).
- **Escaping:** Any `</script` in the injected string is replaced with `\u003c/script` so the HTML parser does not close the script tag. When the app reads `textContent` and runs `JSON.parse`, `\u003c` is interpreted as `<`, so the BOM stays correct.

### Runtime behavior

- **`getDefaultBomFromDOM()`** in **`src/lib/graph-data.ts`**:
  - Reads `document.getElementById('bom-data')?.textContent`.
  - If missing, or equal to `{{{PLACEHOLDER_JSON_TOKEN}}}`, or invalid JSON, or not a valid CycloneDX BOM shape, returns a **minimal BOM** (`bomFormat`, `specVersion`, `version`, empty `components` and `dependencies`).
  - Otherwise returns the parsed BOM.
- **App state:** `App.tsx` initializes with `useState<CycloneDXBom>(() => getDefaultBomFromDOM())`, so the BOM is read once at mount from the DOM.

### Edge cases

- **Placeholder not replaced:** If the consumer deploys the template without replacing the token, the script tag body is the literal `{{{PLACEHOLDER_JSON_TOKEN}}}`. `JSON.parse` throws; `getDefaultBomFromDOM` catches and returns the minimal BOM, so the app loads with an empty graph and the user can still upload a file.
- **JSON contains `</script>`:** The consumer must escape it (e.g. `\u003c/script`) when doing the replacement, or the HTML will break. The same escaping is applied automatically when this repo injects `data.json` in the normal build.

---

## Summary

| Item | Detail |
|------|--------|
| **Script** | `npm run build:template` |
| **Env** | `BUILD_TEMPLATE=1` (used by Vite plugin) |
| **Output** | `dist/index.html` (same as normal build, but BOM script body is the placeholder) |
| **Placeholder** | `{{{PLACEHOLDER_JSON_TOKEN}}}` |
| **Consumer** | Replace that string with their BOM JSON (and escape `</script>` if present in JSON) |
| **Doc** | This file; see also [project.md](project.md) for general build and data source overview. |
