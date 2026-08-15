---
status: accepted
---

# Flow status is a three-state model: Active, Inactive, Archived

A Flow is **Active** (redirects normally, shown in the default Flows list), **Inactive** (paused — its links show a "not configured" page, but it's still visible in the default list with a status indicator, toggled instantly via a switcher on the row), or **Archived** (also paused, but hidden from the default list — visible only via a dedicated active/archived view switcher, reached through the row's three-dot menu, reversible). We considered treating Archive as the only pause mechanism, but rejected a two-state model: quickly pausing one campaign and permanently setting a finished Flow aside are different-weight actions that deserve different affordances — an instant row-level toggle for the former, a deliberate menu action for the latter.

This is independent of an Input node's own Enabled/Disabled state (session 3, ADR-adjacent Q9), which lets one link be paused without affecting the rest of the Flow. A Flow can be Active while one of its Input nodes is Disabled.
