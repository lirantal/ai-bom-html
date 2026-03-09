# Search

The header search box filters the constellation graph by component **type** and **name** using substring matching.

## Behavior

- **Search input** — Type in the "Search components..." field to narrow the visible nodes.
- **Keyboard shortcut** — Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) from anywhere in the app to focus the search input. A **⌘K** hint is shown on the right side of the search box.
- **Substring match** — A query matches only if it appears as a **contiguous substring** in the target text (case-insensitive). For example:
  - `gpt` matches "gpt-3.5-turbo", "gpt-4o-mini"
  - `blip` matches "Salesforce/blip-vqa-base"
  - `deep` matches "deepseek-reasoner" or "api-docs.deepseek.com", but not "FLUX.1-dev-ControlNet-Union-Pro" (where d, e, e, p appear but not as the word "deep")
- **What is matched** — The query is checked against:
  - Component **name** (short label and full name)
  - Component **type** (e.g. `model`, `mcp-server`) and its display label (e.g. "Model", "MCP Server")
- **Combined with type filter** — Search works together with the filter dropdown: first nodes are filtered by the selected type (All, Models, Agents, etc.), then the search query is applied. Edges are limited to visible nodes only.

## Implementation

- **Utility:** `src/lib/fuzzy-match.ts` — `fuzzyMatch(query, text)` and `fuzzyMatchAny(query, texts)` use contiguous substring matching (case-insensitive).
- **Graph:** `ConstellationGraph` accepts an optional `searchQuery` prop and uses it in the `filteredNodes` memo along with the existing `filter` (type) so only matching nodes and their edges are shown.
