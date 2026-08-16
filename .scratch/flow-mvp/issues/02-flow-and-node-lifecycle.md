# 02 — Flow and Input node lifecycle

**What to build:** The pause/archive/disable mechanics for Flows and Input nodes, and soft-delete for nodes. A Flow can be Active, Inactive, or Archived; an Input node can independently be Enabled or Disabled even inside an Active Flow. The redirect route (from ticket 01) enforces all of these states.

**Blocked by:** 01 — Core Flow/Node/Edge schema and redirect pipeline

**Status:** ready-for-agent

- [ ] A Flow's status can be set to Active, Inactive, or Archived via a Server Action
- [ ] An Input node's status can be set to Enabled or Disabled via a Server Action, independent of its Flow's status
- [ ] A Flow can be reactivated from Inactive, and unarchived from Archived
- [ ] Visiting a link belonging to an Inactive or Archived Flow shows the "not set up" page instead of redirecting
- [ ] Visiting a link belonging to a Disabled Input node shows the "not set up" page instead of redirecting, even when its Flow is Active
- [ ] Deleting a node (Input or Output) soft-deletes it — the row and any associated Click history persist, but it's presented to the user as permanently gone (ADR 0006, ADR 0011)
- [ ] Deleting a node removes only its own edges — it never cascades into deleting a shared Output that other Input nodes still depend on
