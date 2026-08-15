---
status: accepted
---

# The Flow canvas is built on @xyflow/react, not a custom-built editor

Node rendering, drag/pan/zoom, connection-snapping, and selection are handled by `@xyflow/react` (v12, MIT license) rather than hand-built. We considered a custom canvas, since it would let every interaction be shaped exactly to this domain, but rejected it: pan/zoom/connection UX is a multi-week problem on its own before a single Input or Output node ever renders, and `@xyflow/react` already maps its "handles" concept directly onto our `Slot` vocabulary. Styling is done via CSS variables and custom React node components, so nodes are ordinary Tailwind-styled components, not a fight against the library's own look.
