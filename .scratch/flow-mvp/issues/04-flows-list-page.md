# 04 — Flows list page

**What to build:** The `/dashboard/flows` page — a manageable list of the user's Flows with search, status controls, and a clear entry point to create new ones.

**Blocked by:** 01 — Core Flow/Node/Edge schema and redirect pipeline, 02 — Flow and Input node lifecycle

**Status:** ready-for-agent

- [ ] The page lists one row per Flow with name, created and edited timestamps, link (Input node) count, and status (ADR 0007)
- [ ] A "New flow" button (top-right of the header) creates a Flow named "Untitled flow" and redirects straight into its canvas editor
- [ ] Flows can be searched by name
- [ ] The default sort order is most-recently-edited first
- [ ] An empty state with a "New flow" call-to-action shows when the user has no Flows yet
- [ ] Each row has an instant Active/Inactive status switcher
- [ ] Each row has a three-dot menu with Archive/Unarchive
- [ ] Archived Flows are hidden from the default view and shown only via a separate active/archived view switcher
- [ ] Each row has an icon button linking to that Flow's dashboard view, pre-filtered to it
- [ ] The sidebar's "Wires" nav item is renamed to "Flows" and points at `/dashboard/flows`
- [ ] No pagination — the full list loads at once; no click counts are shown in this table
