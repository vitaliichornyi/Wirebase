# 05 — Canvas editor

**What to build:** The visual Flow editor at `/dashboard/flows/[id]`, built on `@xyflow/react` (ADR 0008) — the primary way users construct and edit a Flow's graph.

**Blocked by:** 01 — Core Flow/Node/Edge schema and redirect pipeline, 02 — Flow and Input node lifecycle, 03 — UTM configuration and forwarding

**Status:** ready-for-agent

- [ ] The canvas renders a Flow's current nodes and edges
- [ ] A right-side panel shows an add-node palette when nothing is selected: "New link" adds an Input node instantly (no form); "New destination" adds an Output node and prompts for its URL
- [ ] Nodes can be connected by dragging between handles, moved (position persists), and deleted
- [ ] Selecting a node switches the right panel to that node's properties form: name, link/URL, UTM fields (Input only), and an enable/disable toggle (Input only)
- [ ] Changes only persist when the user clicks Save; navigating away with unsaved changes prompts a confirmation (ADR 0010)
- [ ] The Flow's name can be renamed inline from the canvas header
- [ ] Each Input node's card shows its link with a copy-to-clipboard button, without needing to open the properties panel
- [ ] A disabled Input node's card is visually grayed out, consistent with how disabled/archived items look elsewhere in the product
- [ ] No connection-validation code is needed — Input's single "out" handle and Output's single "in" handle make an invalid connection impossible to draw
- [ ] No in-canvas undo/redo — reloading without saving is the safety net
