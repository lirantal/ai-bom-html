# Components legend

The **Components legend** lists all component types used in the constellation graph, each with its icon and label. It appears in the **bottom-left** of the page, next to the CycloneDX spec version pill. The legend is **collapsible** and starts **collapsed** by default.

## Placement

- **Position:** Bottom-left (`bottom-4 left-4`), in a horizontal row with the CycloneDX pill.
- **Order:** The legend is the first (left) element; the CycloneDX pill is immediately to its right. Both align to the bottom of the container (`items-end`).

## Collapsed state (default)

- **Appearance:** A single bar showing the label **“Components”** and a **chevron-right** (►) icon. The bar uses the same styling as the rest of the card (rounded, bordered, muted text).
- **Height:** The collapsed legend bar has the **same height** as the CycloneDX pill (both use `h-9` / 36px) so they align neatly side by side.
- **Interaction:** Clicking the bar toggles the legend to the expanded state.

## Expanded state

- **Appearance:** The same “Components” header row, but with a **chevron-down** (▼) icon, and below it a **grid** of component types. Each row shows:
  - The **icon** for that type (color and symbol from `nodeTypeConfig` in `src/lib/graph-data.ts`).
  - The **label** for that type (e.g. “MCP Client”, “Model”, “Agent”, “Library”).
- **Order:** Types are listed in the same order as the constellation rings (inner to outer), then **Application** last. That order is `constellationRingOrder` + `'application'`, matching the ring order described in [Constellation layout](./constellation-layout.md).
- **Interaction:** Clicking the header again collapses the legend back to the single bar.

## Purpose

- **Reference:** Lets users match the icons and colors on the graph to type names (e.g. what “MCP Server” or “Library” looks like in the constellation).
- **Consistency:** The type order and styling (icon, color, label) are shared with the constellation layout and the dashboard stat cards via `nodeTypeConfig` and `constellationRingOrder`.

## Implementation

- **UI:** `src/App.tsx` — bottom-left overlay contains the legend block and the CycloneDX pill. Legend expand/collapse is controlled by `legendExpanded` state (default `false`). The header is a button that toggles this state; the grid is rendered only when `legendExpanded` is true.
- **Data:** Same as the constellation and dashboard — `nodeTypeConfig` and `constellationRingOrder` from `src/lib/graph-data.ts`. The legend does not appear inside the constellation graph component; it is rendered in the main app layout next to CycloneDX.
