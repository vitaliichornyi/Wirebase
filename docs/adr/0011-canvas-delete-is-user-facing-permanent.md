---
status: accepted
---

# Deleting a node from the canvas is user-facing permanent; disabling is user-facing reversible

Both actions are soft-delete under the hood (ADR 0006, ADR 0007's Q7 discussion) — a node's row and click history are never hard-deleted. But they present differently to the user: **disable** is an explicit, visible toggle in the node's properties panel — the node grays out on the canvas and can be re-enabled anytime. **Delete** removes the node from the canvas with no corresponding "undelete" UI — from the user's perspective it's gone for good, even though the underlying row is only hidden, not destroyed. We considered exposing delete as reversible too (matching disable), but rejected it for now: restoring a deleted node is a real feature (where does it reappear on the canvas? does it reconnect its old edges?) that deserves deliberate design later, not a side effect of reusing the disable toggle's reversibility.
