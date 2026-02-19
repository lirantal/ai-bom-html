# Dashboard cards stats

The overlay in the **top-left** of the graph shows summary cards with live counts derived from the loaded AIBOM (CycloneDX) data. The cards are **generated dynamically** from the graph data: there is always a total **Components** card, then one card per **component type** that actually appears in the current BOM.

## Layout

- **Position:** `absolute top-4 left-4` over the constellation graph.
- **Behavior:** Cards are in a single row with `flex flex-wrap gap-2`; when there are many types, the row wraps to additional lines. No fixed count of cards — the set depends entirely on the data.

## What is shown

1. **Components (first card)**  
   - **Value:** Total number of graph nodes (all components + services from the BOM).  
   - **Meaning:** Same as `graphData.nodes.length`; every node in the constellation is counted.  
   - **Not clickable:** This card is for the total only; clicking it does nothing.

2. **Type cards (one per type present in the data)**  
   - **Value:** Count of nodes of that type (e.g. number of models, agents, MCP servers, etc.).  
   - **Label:** The display name for the type (e.g. “Model”, “Agent”, “MCP Server”, “Library”) from `nodeTypeConfig` in `src/lib/graph-data.ts`.  
   - **Color:** The number uses the same color as that type in the graph and in the Components legend (from `nodeTypeConfig[type].color`).  
   - **Clickable (when the type has a header filter):** Clicking a type card filters the constellation to show only that component type (or the filter category that includes it). See [Interaction: filtering from cards](#interaction-filtering-from-cards) below.

Only types that have at least one node in the current `graphData` get a card. So if the BOM has no tools or no data nodes, there will be no “MCP Tool” or “Data” card.

## Order of type cards

Type cards follow a fixed order so the dashboard is consistent across BOMs:

1. **Constellation ring order** first: types in `constellationRingOrder` (mcp-client → mcp-server → agent → model → library → service → mcp-resource → tool → data). Only types with count &gt; 0 are included.
2. **Other types** after that: any type that has nodes but is not in `constellationRingOrder` (e.g. `application`) is appended.

So the order matches the semantic ring order (inner to outer) used in the constellation and in the Components legend.

## Possible card types (by data)

The set of type cards depends on what the BOM contains. The possible types (and their labels) are defined in `nodeTypeConfig`:

| Type          | Label          | Meaning (bom-ref prefix or source)     |
|---------------|----------------|----------------------------------------|
| `model`       | Model          | `model:`                               |
| `agent`       | Agent          | `agent:`                               |
| `library`     | Library        | `pkg:`                                 |
| `mcp-server`  | MCP Server     | `mcp-server:`                          |
| `mcp-client`  | MCP Client     | `mcp-client:`                          |
| `mcp-resource`| MCP Resource   | `mcp-resource:`                        |
| `tool`        | MCP Tool       | `tool:`                                |
| `service`     | Service        | `service:` or BOM services             |
| `application`| Application    | `application:`                         |
| `data`        | Data           | (fallback)                             |

Again: only types that have at least one node in the current graph get a card.

## Data source

- **BOM:** The app loads the CycloneDX AIBOM from the HTML-injected BOM (see `src/lib/graph-data.ts`: `getDefaultBomFromDOM()`); the default source is **`data.json`** at the project root, injected at build time.
- **Graph:** `bomToGraphData(bomData)` builds nodes (one per component and one per service) and edges from `dependencies`. Node types are inferred from the `bom-ref` prefix via `getNodeType()`.
- **Stats:** The dashboard computes `typeCounts` from `graphData.nodes` (count per `node.type`), then builds the ordered list of types with count &gt; 0 and renders one card per type plus the total Components card.

Changing or replacing `data.json` and rebuilding (or, for the template build, replacing the placeholder with your BOM) will update both the graph and the card counts.

## Interaction: filtering from cards

The dashboard type cards are **connected to the header components filter**: clicking a type card applies that filter so the constellation shows only the corresponding component type(s).

- **Total "Components" card:** Not clickable (showing a total count only).
- **Type cards that map to a filter:** Clickable. **First click** sets the header filter to that type's category; **clicking the same card again** (when it's the only active filter) clears it to "All Components". For example:
  - **Model** → filter "Models".
  - **Agent** → filter "Agents".
  - **MCP Server** / **MCP Client** → filter "MCP Servers" (both types).
  - **Library** → filter "Libraries".
  - **Service** → filter "Services".
  - **MCP Tool** / **MCP Resource** → filter "Tools & Resources" (both types).
- **Type cards with no filter (e.g. Application, Data):** Not clickable; they only show the count.

Clickable cards use hover styles (e.g. slightly stronger background and border), a tooltip ("Show only X" or "Clear filter (show all)" when that card is the active filter), and keyboard support (Enter/Space) for accessibility. The header filter dropdown and the dashboard cards stay in sync: after clicking a card, the dropdown shows that single filter as selected; clearing in the dropdown or by clicking the same card again both reset to all components.

## Implementation

- **Data & types:** `src/lib/graph-data.ts` — `bomData`, `graphData`, `bomToGraphData()`, `getNodeType()`, `NodeType`, `nodeTypeConfig`, `constellationRingOrder`.
- **UI:** `src/App.tsx` — overlay at `top-4 left-4` with the total Components card and a loop over `statsTypeOrder` rendering one card per type (label and color from `nodeTypeConfig`). Type cards that have a corresponding header filter id (via `getFilterIdForNodeType`) are rendered as buttons and set `selectedFilterIds` on click.
