# Project overview

## Build output: single-file HTML

**Yes.** The build produces one self-contained static file: **`dist/index.html`**.

That file includes:

- The full HTML document
- All JavaScript (bundled and transpiled) inlined
- All CSS (including Tailwind) inlined
- No external scripts, stylesheets, or assets — the app runs from this one file (e.g. open in a browser or host as a static file).

The `dist/` directory is gitignored; it is created only when you run the build.

---

## How the single-file build works

### Stack

- **Vite** — bundler and dev server
- **vite-plugin-singlefile** — inlines all JS and CSS into the HTML so the output is a single file

### Flow

1. **`npm run build`** runs **`vite build`** (see `package.json`).
2. **Vite**:
   - Uses the entry **`index.html`** (project root), which loads **`/src/main.tsx`**.
   - Bundles the React app (TS/TSX, CSS). A **BOM inject** plugin replaces the `__BOM_INJECT__` marker in the HTML with the contents of **`data.json`** (or a placeholder for the template build). The same injection runs when you use **`npm run dev`**: Vite serves `index.html` with the BOM already embedded, so the browser does not request `data.json` separately.
3. **vite-plugin-singlefile** runs during the build and:
   - Takes the generated `index.html` and the built JS/CSS assets.
   - Inlines all script and style content into that HTML.
   - Writes the result as **`dist/index.html`** (no separate `.js` or `.css` files).

### Vite config (relevant parts)

In **`vite.config.ts`**:

- **`viteSingleFile()`** — enables the single-file output.
- **`build.assetsInlineLimit: 100000000`** — forces assets to be inlined (no separate asset files).
- **`rollupOptions.output.manualChunks: undefined`** — keeps a single JS chunk so everything ends up in one inlined script.

---

## Where the JSON “source” comes from

The default AI-BOM data shown when you open the app (and when you reset) comes from **one place at build time** and **optionally from a user upload at runtime**.

### Build-time default: injected into HTML

- **File:** **`data.json`** in the **project root** (same level as `package.json`, `index.html`, `src/`).
- **Mechanism:** The **`index.html`** contains a `<script type="application/json" id="bom-data">__BOM_INJECT__</script>` tag. The **bom-inject** Vite plugin replaces `__BOM_INJECT__` with the contents of **`data.json`** when serving HTML (dev server) and during the normal build (and with a placeholder when building the HTML template). The browser never fetches `data.json` as a separate request—the BOM is already in the delivered HTML. At runtime the app reads it via **`getDefaultBomFromDOM()`** in **`src/lib/graph-data.ts`** (no JSON import in the bundle).
- **Format:** CycloneDX 1.6 (see `$schema` / `bomFormat` in `data.json`). Editing **`data.json`** and running **`npm run build`** again updates the default graph.
- **Template build:** Run **`npm run build:template`** to produce a viewer HTML that contains a **placeholder token** instead of `data.json`, so another project can replace it with their own BOM at their build time. See **[docs/html-template.md](html-template.md)** for full details.


### Runtime: user upload

- The UI also allows **uploading** a `.json` file (e.g. another AI-BOM export). That file is **not** from the repo; it’s chosen by the user and only affects the current session (state in memory). It does not change `data.json` or the built `dist/index.html`.

---

## Summary

| Question | Answer |
|----------|--------|
| Does the build produce a single consolidated HTML file? | **Yes.** One file: **`dist/index.html`**. |
| Where is that file? | **`dist/index.html`** (and `dist/` is in `.gitignore`). |
| Where does the default JSON come from? | **Project root `data.json`**, injected into **`<script id="bom-data">`** at build time; read at runtime by **`getDefaultBomFromDOM()`** in **`src/lib/graph-data.ts`**. |
| How to change the default BOM? | Edit **`data.json`**, then run **`npm run build`** again. |
| How to build a data-free viewer for another project to inject BOM later? | Run **`npm run build:template`**; see **[html-template.md](html-template.md)**. |
