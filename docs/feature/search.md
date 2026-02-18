# Search

The header search box filters the constellation graph by component **type** and **name** using fuzzy matching.

## Behavior

- **Search input** — Type in the "Search components..." field to narrow the visible nodes.
- **Fuzzy match** — A query matches if every character of the query appears in order in the target text (case-insensitive). For example:
  - `gpt` matches "gpt-3.5-turbo", "gpt-4o-mini"
  - `blip` matches "Salesforce/blip-vqa-base"
  - `openai` matches component names or labels containing those letters in order
- **What is matched** — The query is checked against:
  - Component **name** (short label and full name)
  - Component **type** (e.g. `model`, `mcp-server`) and its display label (e.g. "Model", "MCP Server")
- **Combined with type filter** — Search works together with the filter dropdown: first nodes are filtered by the selected type (All, Models, Agents, etc.), then the search query is applied. Edges are limited to visible nodes only.

## Implementation

- **Utility:** `src/lib/fuzzy-match.ts` — `fuzzyMatch(query, text)` and `fuzzyMatchAny(query, texts)`.
- **Graph:** `ConstellationGraph` accepts an optional `searchQuery` prop and uses it in the `filteredNodes` memo along with the existing `filter` (type) so only matching nodes and their edges are shown.
