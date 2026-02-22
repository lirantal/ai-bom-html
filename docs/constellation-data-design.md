# Constellation data design

This document describes how **CycloneDX AI-BOM** data is represented in the app, how it is converted into a **graph** (nodes and edges), and to what extent the **full interconnected graph** is shown on the canvas and tracked in memory.

---

## Source format: CycloneDX

The application consumes **CycloneDX** Bill of Materials (BOM), specifically the **1.6** schema used for AI-BOM. The format is graph-oriented:

- **Nodes** are represented by:
  - **`components`** — array of components (agents, models, libraries, MCP servers/clients, tools, data, applications, etc.), each with a unique **`bom-ref`**.
  - **`services`** (optional) — array of services, each with a unique **`bom-ref`**.

- **Edges** are represented by:
  - **`dependencies`** — array of dependency objects. Each object has:
    - **`ref`** — the `bom-ref` of the component (or service) that has dependencies.
    - **`dependsOn`** — optional array of `bom-ref` values that this component depends on.

So in CycloneDX, the graph is implicit: **components** and **services** are the vertices; **dependencies** define the directed edges (who depends on whom). The spec expects that every `ref` and every entry in `dependsOn` refers to a `bom-ref` that appears in `components` or `services` (or in the same `dependencies` array as a `ref`). Components with no dependencies should still appear in `dependencies` with an empty or omitted `dependsOn`.

References:

- [CycloneDX v1.6 JSON](https://cyclonedx.org/docs/1.6/json/)
- [Software Dependencies / Dependency graph](https://cyclonedx.org/use-cases/software-dependencies/)

---

## In-app representation

### CycloneDX → graph conversion

Conversion is implemented in **`src/lib/graph-data.ts`**:

1. **Nodes**
   - Every **component** in `bom.components` becomes a **node** with:
     - `id` = component’s `bom-ref`
     - `label` / `fullName` from `name`
     - `type` derived from `bom-ref` prefix (e.g. `model:`, `agent:`, `pkg:`, `mcp-server:`, …) via `getNodeType()`
     - `raw` = original component object
   - Every **service** in `bom.services` (if present) becomes a node with `type: 'service'` and the same shape.

2. **Edges**
   - For each **dependency** in `bom.dependencies`:
     - For each `target` in `dep.dependsOn`, an edge `{ from: dep.ref, to: target }` is added.

So the in-memory graph is:

- **Nodes**: exactly the set of components + services (no synthetic nodes).
- **Edges**: exactly the set of (ref, dependsOn) pairs from the BOM.

No placeholder or “stub” nodes are created for dependency targets that are not listed in `components` or `services`. If the BOM references a `bom-ref` only in `dependsOn` and not in components/services, that ref will have no node; edges pointing to it will still exist in `graphData.edges` but cannot be drawn (see below).

---

## Data structures (TypeScript)

- **`CycloneDXBom`** — mirrors the BOM: `components`, `services` (optional), `dependencies`, plus `bomFormat`, `specVersion`, `version`, etc.
- **`GraphData`** — `{ nodes: GraphNode[], edges: GraphEdge[] }`.
- **`GraphNode`** — `id` (bom-ref), `label`, `fullName`, `type`, `raw` (BomComponent | BomService).
- **`GraphEdge`** — `{ from: string, to: string }` (bom-refs).

The app keeps a single source of truth for the BOM (**`currentBom`** in `App.tsx`). Graph data is derived on every change:

```ts
const graphData = useMemo(() => getGraphData(currentBom), [currentBom]);
```

So the **full graph** (all nodes from components/services and all edges from dependencies) is **fully tracked** in memory in `graphData`.

---

## What is shown on the canvas

The **constellation graph** (`src/components/constellation-graph.tsx`) does the following:

1. **Filtering**
   - **Nodes** are filtered by:
     - Component type (multi-select filter): only nodes whose type matches the selected filter(s) are visible; if no filter is selected, all nodes are visible.
     - Search: only nodes matching the search query (label, fullName, type) are visible.
   - **Edges** are then filtered to only those whose **both** endpoints are in the current visible node set:
     - `filteredEdges = graphData.edges` where `edge.from` and `edge.to` are in `filteredNodes`.

2. **Layout**
   - Visible nodes are laid out in a **radial/orbital** constellation: one node (root application) at center, others on concentric rings by **type** (see `constellationRingOrder` and `docs/feature/constellation-layout.md`).

3. **Rendering**
   - All **filtered** edges are drawn (curved lines between node positions).
   - All **filtered** nodes are drawn (with type-based styling).

So:

- **Full graph in memory:** Yes. `graphData.nodes` and `graphData.edges` contain every component/service and every dependency relationship from the CycloneDX BOM.
- **Full graph on canvas:** When no filters and no search are applied, **all** nodes and **all** edges between those nodes are shown. When filters or search are applied, only the subgraph induced by the visible nodes is shown (all edges between visible nodes are still drawn).

Edges that reference a `bom-ref` not present in `components` or `services` are stored in `graphData.edges` but will never be drawn, because there is no node for the missing ref (so at least one endpoint is never in `filteredNodes`).

---

## Summary table

| Aspect | Status |
|--------|--------|
| Data format | CycloneDX 1.6 AI-BOM (`components`, `services`, `dependencies`) |
| Nodes from | `components` + `services` only |
| Edges from | `dependencies` (each `ref` → each `dependsOn` target) |
| Full graph in memory | Yes — `graphData.nodes` and `graphData.edges` |
| Full graph on canvas (no filters) | Yes — all nodes and all edges between them |
| Full graph on canvas (with filters/search) | Subgraph only — visible nodes + edges between them |
| Dangling refs (in deps but not in components/services) | Edges kept in memory; no node created; edge not drawn |

---

## Related code and docs

- **Types and conversion:** `src/lib/graph-data.ts` — `CycloneDXBom`, `BomComponent`, `BomDependency`, `GraphData`, `bomToGraphData()`, `getGraphData()`.
- **Rendering:** `src/components/constellation-graph.tsx` — `filteredNodes`, `filteredEdges`, draw loop.
- **App state:** `src/App.tsx` — `currentBom`, `graphData`, filter and search state.
- **Layout and UX:** `docs/feature/constellation-layout.md`, `docs/project.md`, `docs/html-template.md`.
