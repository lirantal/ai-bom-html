# Zoom to Fit

The **Zoom to Fit** button in the header frames the entire constellation graph in the viewport so all visible nodes are on screen with comfortable padding.

## Where to find it

- **Header** — Next to the filter and "Show JSON" controls, labeled "Zoom to Fit" with a maximize icon (on smaller screens the label may be hidden; the icon remains).

## Behavior

- **One click** — Centers the graph and sets zoom so the bounding box of all currently visible nodes (plus 80px padding) fits inside the canvas.
- **Respects filters** — Only nodes that are currently visible (after applying the type filter and search) are used to compute the fit. Changing filters or search and clicking Zoom to Fit again reframes the new set of nodes.
- **Zoom limits** — The resulting zoom is clamped to the same range as other zoom controls: **0.3×** to **3×**.

## Implementation

- **UI:** `App.tsx` — Header button calls `graphRef.current?.zoomToFit()`.
- **Graph:** `ConstellationGraph` exposes a `zoomToFit()` method via `forwardRef` and `useImperativeHandle` (`ConstellationGraphHandle`). It computes the bounding box of `nodePositions` (including node radii), centers the view on that box, and sets zoom to fit the box in the canvas dimensions.

Related zoom controls (keyboard, wheel, +/−, Reset) are documented in [Zoom](../feature/zoom.md).
