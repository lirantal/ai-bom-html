# Dashboard cards stats

The overlay in the top-left of the graph shows three summary cards: **Components**, **Models**, and **MCP**. These numbers are **live stats** derived from the loaded AIBOM (CycloneDX) data — they are not mock or hardcoded values.

## What is shown

| Card        | Value | Meaning |
|------------|-------|--------|
| **Components** | Total node count | All graph nodes: every BOM component plus every BOM service. |
| **Models**     | Count of `model` nodes | Components whose `bom-ref` starts with `model:` (e.g. ML models). |
| **MCP**        | Count of MCP nodes | Components whose `bom-ref` starts with `mcp-server:` or `mcp-client:`. |

The cards use the same `graphData` that drives the constellation graph, so the counts always match what the BOM defines.

## Data source

- **BOM:** The app loads the CycloneDX AIBOM from **`data.json`** at the project root (see `src/lib/graph-data.ts`).
- **Graph:** `bomToGraphData(bomData)` converts that BOM into nodes (one per component and one per service) and edges (from `dependencies`). Node types (model, mcp-server, mcp-client, etc.) are inferred from the `bom-ref` prefix via `getNodeType()`.
- **Stats:** The dashboard reads `graphData.nodes.length` for Components and filters by `node.type` for Models and MCP.

Changing or replacing `data.json` (e.g. with another AIBOM or an export from Snyk) and rebuilding will update both the graph and the card numbers.

## Implementation

- **Data & types:** `src/lib/graph-data.ts` — `bomData`, `graphData`, `bomToGraphData()`, `getNodeType()`, `NodeType`.
- **UI:** `src/App.tsx` — the three stat cards in the overlay (`absolute top-4 left-4`), each displaying a count from `graphData.nodes` (total or filtered by type).
