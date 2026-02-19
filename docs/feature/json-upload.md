# Upload JSON (AI-BOM file)

The **Upload JSON** button in the header lets users load a CycloneDX AI-BOM from a local JSON file. The graph, stats, legend, and Show JSON panel all update to reflect the uploaded BOM.

## Where to find it

- **Header** — Rightmost control, after "Show JSON". Label "Upload JSON" with an upload icon. Styled like the other secondary header buttons (e.g. Zoom to Fit, Show JSON when inactive).

## Behavior

- **Click** — Opens the system file picker restricted to `.json` / `application/json`. No file is sent to a server; everything runs in the browser.
- **Valid file** — After selecting a valid CycloneDX AI-BOM JSON:
  - The graph redraws with the new components and dependencies.
  - Stats cards, Components legend, and CycloneDX version badge reflect the new BOM.
  - "Show JSON" panel (if open) and Copy JSON use the uploaded BOM.
  - The current node selection is cleared.
- **Invalid file** — If the file is not valid JSON or does not look like a CycloneDX AI-BOM, an error banner appears below the header with a short message and a "Dismiss" button. The previous BOM remains in use.

## Validation

Uploaded JSON is accepted only if it passes `isValidCycloneDXBom()`:

- Must be an object with:
  - `components` — array
  - `dependencies` — array
  - `bomFormat === 'CycloneDX'` or a string `specVersion`

Parse errors (invalid JSON) also show in the error banner.

## Implementation

- **App state:** `currentBom` holds the BOM in use (initialized from the injected BOM (script#bom-data) via `getDefaultBomFromDOM()` in `graph-data.ts`). `graphData` is derived with `getGraphData(currentBom)` and passed to `ConstellationGraph`.
- **UI:** `App.tsx` — Hidden `<input type="file" accept=".json,application/json">`; the "Upload JSON" button triggers it via `fileInputRef`. `handleFileSelect` reads the file with `FileReader`, parses JSON, validates, then `setCurrentBom(parsed)` or `setUploadError(...)`.
- **Error UI:** When `uploadError` is set, a dismissible banner below the header shows the message; "Dismiss" clears it.
- **Data flow:** The default BOM is read from the DOM by `getDefaultBomFromDOM()`; `getGraphData()` lives in `src/lib/graph-data.ts`. The graph component receives `graphData` as a prop instead of importing it, so it always renders the current BOM (default or uploaded).
