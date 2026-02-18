# Constellation layout

## Page layout (where things are)

The app screen is organized as follows:

- **Header (top, full width):** Evo by Snyk logo, “AI-BOM” label, search (⌘K), then on the right: components filter dropdown (multi-select with checkboxes; see [Components filter (multi-select)](#components-filter-multi-select)), “Zoom to Fit”, and “Show JSON”. The header is fixed; the main content scrolls underneath if needed.
- **Main area:** The constellation graph (radial/orbital node layout) fills the space below the header.
- **Top-left overlay:** Dashboard stat cards — total **Components** plus one card per component type that appears in the current BOM (e.g. MCP Client, MCP Server, Agent, Model, Library, …). Cards wrap when there are many types. See [Dashboard cards stats](./dashboard-cards-stats.md).
- **Bottom-left:** Two elements side by side:
  1. **Components legend** — collapsible (default: collapsed). When expanded, shows the list of component types with icon and label in the same order as the constellation rings. See [Components legend](./components-legend.md).
  2. **CycloneDX** — small pill showing the spec version (e.g. “CycloneDX v1.6”). Same vertical height as the collapsed legend bar.
- **Bottom-right:** Zoom controls (+, −, Reset) over the graph.
- **Overlays (when used):** “Show JSON” opens a panel at the bottom with the raw CycloneDX AI-BOM; clicking a node opens the node detail panel on the right.

So: stats live top-left; the legend and CycloneDX live bottom-left together; zoom controls stay bottom-right.

---

## What we call it

The layout is a **radial / orbital** layout: nodes sit on concentric circles (rings) around a center. The code and UI already call it **constellation**, which fits well: nodes are like stars on fixed orbits, with edges connecting them. So **“constellation”** is an appropriate and consistent name.

---

## How many circles and why

- **Drawn circles:** The canvas always draws **8 orbital rings** (see `constellation-graph.tsx`: loop `for (let i = 1; i <= 8; i++)` with radius `80 + i * 90`). So visually there are 8 circles.
- **Used circles:** How many rings actually get nodes depends on:
  - The **type order** (see below): we have 9 non-root types + optionally one extra ring for “other” application nodes.
  - The **data**: only types that have nodes in the current (filtered) set get a ring.
  - So with “All components” you might use e.g. rings 1–5 if you only have mcp-client, mcp-server, agent, model, and maybe application; with a single-type filter, previously we used only ring 1 (see fix below).

The choice of **8 drawn rings** is a reasonable upper bound so the canvas doesn’t look empty when many types are present, while keeping the radial spacing (90px per ring) readable.

**Grid and ring styling:** The background grid is drawn so it fully contains all 8 rings (extent = max ring radius 800px + 160px margin). Orbital rings use a white stroke with opacity that steps down from inner to outer rings (e.g. ~0.18 to ~0.06) so they stay visible without overpowering the nodes.

---

## Meaning of position on each circle (ring)

Position on a circle is **entirely determined by component type**, in a fixed order. The same order is used for the constellation layout and the **Components legend** (inner-to-outer ring, then Application):

1. **Ring 1** – MCP Client  
2. **Ring 2** – MCP Server  
3. **Ring 3** – Agent  
4. **Ring 4** – Model  
5. **Ring 5** – Library  
6. **Ring 6** – Service  
7. **Ring 7** – MCP Resource  
8. **Ring 8** – Tool  
9. **Ring 9** – Data  

(Plus the center for the root application, and an extra ring for other application nodes if present.)

So:
- **MCP Client** on the first circle and **MCP Server** on the second is by design: the order is `['mcp-client', 'mcp-server', 'agent', 'model', ...]`.
- **Model** on the 4th circle is because in that list, “model” is the 4th type, so it gets the 4th ring.

So the significance is **semantic**: ring index = fixed order of component types (clients → servers → agents → models → libraries → services → resources → tools → data). It’s not random and not based on the number of nodes.

---

## Filter behavior: why a single component jumped to the first circle (and the fix)

**What was happening:**  
When you use the “All Components” filter to show only one type (e.g. only Models), the layout code:

1. Builds `filteredNodes` (only that type).
2. Groups by type → only one type has nodes.
3. Iterates over `typeOrder` and assigns a **ring index** only when a type has nodes: `ringIndex++` then `ringRadius = 80 + ringIndex * 90`.

So the **first (and only) type with nodes** always got `ringIndex = 1`, i.e. the first circle. That’s why “choose one component type” drew that type on the first circle instead of keeping it on its usual ring.

**What we want:**  
Filtering should only hide/show types; it should not change **which ring** a type belongs to. So e.g. Models should always sit on ring 4 (radius `80 + 4 * 90`) whether we show “All” or “Models only”.

**Fix:**  
Use a **canonical ring index per type** derived from `constellationRingOrder` in `src/lib/graph-data.ts` (e.g. model = index 3 → ring 4), and use that when placing nodes, instead of a running `ringIndex` that only increments for types that have nodes in the current view. That way, when you filter to one component type, it stays on the same circle as in the full constellation view. The Components legend uses the same order (`constellationRingOrder` + application) so it matches the rings.

---

## Components filter (multi-select)

The header filter dropdown lets users show **one or more** component types at once instead of a single choice.

- **Behavior:**  
  - **No selection** = “All Components” (all types visible).  
  - **One or more types selected** = only those types are shown. A node is included if its type matches any selected filter (e.g. “MCP Servers” includes both `mcp-server` and `mcp-client`).

- **UI:**  
  - Each option has a **checkbox** to the left of the label (Models, Agents, MCP Servers, Libraries, Services, Tools & Resources).  
  - Checked = that type is included in the filter. Clicking a row toggles that type; the menu stays open so multiple options can be selected.  
  - The button label shows: “All Components” when none selected; the single type name when one is selected; or “N types” when multiple are selected (e.g. “2 types”).  
  - A **“Clear all filters”** action at the bottom of the dropdown clears the selection (back to “All Components”) and closes the menu.

- **Implementation:**  
  - App state is `selectedFilterIds: Set<string>` (empty = all). The graph receives `selectedFilterIds` as an array and filters nodes with `nodeMatchesFilterIds()` so a node is shown if it matches any selected filter id. Ring positions still use the canonical ring index per type, so filtered views keep the same ring per type as in the full view.
