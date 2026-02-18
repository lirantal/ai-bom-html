# Show JSON (Raw CycloneDX)

The **Show JSON** button in the header toggles a panel that displays the raw CycloneDX AI-BOM as formatted JSON. The panel includes a **copy** control to copy the JSON to the clipboard.

## Where to find it

- **Header** — Next to the filter and Zoom to Fit controls, labeled "Show JSON" with a code icon. When active, the button uses the accent gradient style.
- **Panel** — When open, a bottom panel titled **Raw CycloneDX AI-BOM** shows the JSON. The panel header has:
  - **Title** — "Raw CycloneDX AI-BOM" on the left.
  - **Copy** — Copy icon (top right, next to the close button). Copies the full JSON to the clipboard.
  - **Close** — Code-like button to close the panel (same as toggling "Show JSON" off).

## Behavior

- **Toggle** — Click "Show JSON" to open the panel; click again or use the close button in the panel to hide it.
- **Copy** — Click the copy icon in the panel header to copy the entire CycloneDX BOM JSON (pretty-printed with 2-space indent) to the clipboard. The icon briefly changes to a check mark and green color for 2 seconds to confirm the copy.
- **Content** — The panel shows `bomData` from the app (the same CycloneDX structure used for the graph), formatted as `JSON.stringify(bomData, null, 2)`.

## Implementation

- **UI:** `App.tsx` — "Show JSON" button toggles `showJSON` state. The Raw CycloneDX panel renders when `showJSON` is true. The copy button calls `copyJsonToClipboard()`, which uses `navigator.clipboard.writeText()` with the stringified BOM; `jsonCopied` state drives the check-icon feedback with a 2s reset.
- **Data:** `bomData` is imported from `./lib/graph-data` and is the single source of truth for the BOM displayed in both the graph and the JSON panel.
