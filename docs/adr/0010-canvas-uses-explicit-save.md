---
status: accepted
---

# The Flow editor uses an explicit Save action, not autosave

Changes on the canvas (node position, connections, names, added/removed nodes) only persist when the user clicks Save; leaving with unsaved changes prompts a confirmation. We considered debounced autosave, which matches the mental model of Figma/Notion-style editors, but rejected it: it requires debounce-timing decisions, in-flight request cancellation, and a persistent "saving…" indicator, and still has a failure mode where a crash mid-debounce loses unsaved work anyway. Explicit Save with a navigation guard is a smaller, more predictable implementation with the same practical safety — nothing is ever silently in-flight.
