# Zoom

The constellation graph supports zoom in and zoom out, similar to Google Maps.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| **+** or **=** | Zoom in |
| **-** | Zoom out |

Shortcuts work globally when the graph is in view. They are ignored when focus is in an input, textarea, or other editable field so that typing `+` or `-` does not change the graph zoom.

## Mouse wheel

- **Scroll up** — zoom in  
- **Scroll down** — zoom out  

Use the scroll wheel while the pointer is over the graph canvas.

## On-screen controls

In the bottom-right of the graph:

- **+** button — zoom in  
- **−** button — zoom out  
- **Reset** — reset zoom to 1× and center the view (pan to 0,0)

## Limits

- **Minimum zoom:** 0.3×  
- **Maximum zoom:** 3×

All zoom methods (keyboard, wheel, and buttons) respect these limits.
