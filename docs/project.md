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
   - Bundles the React app (TS/TSX, CSS) and resolves imports (including **`data.json`**).
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

### Build-time default: `data.json`

- **File:** **`data.json`** in the **project root** (same level as `package.json`, `index.html`, `src/`).
- **Usage:** It is **imported** in **`src/lib/graph-data.ts`**:

  ```ts
  import bomDataJson from '../../data.json';
  export const defaultBomData: CycloneDXBom = bomDataJson as CycloneDXBom;
  ```

- **At build time:** Vite/Rollup treats this as a JSON module. The contents of `data.json` are **bundled into the JavaScript** (no separate network request for `data.json` in the built app). So the built **`dist/index.html`** already contains that default BOM data.
- **Format:** CycloneDX 1.6 (see `$schema` / `bomFormat` in `data.json`). Editing **`data.json`** and rebuilding changes the default graph and “Reset” behavior.

### Runtime: user upload

- The UI also allows **uploading** a `.json` file (e.g. another AI-BOM export). That file is **not** from the repo; it’s chosen by the user and only affects the current session (state in memory). It does not change `data.json` or the built `dist/index.html`.

---

## Summary

| Question | Answer |
|----------|--------|
| Does the build produce a single consolidated HTML file? | **Yes.** One file: **`dist/index.html`**. |
| Where is that file? | **`dist/index.html`** (and `dist/` is in `.gitignore`). |
| Where does the default JSON come from? | **Project root `data.json`**, imported in **`src/lib/graph-data.ts`** and bundled into the JS at build time. |
| How to change the default BOM? | Edit **`data.json`**, then run **`npm run build`** again. |
