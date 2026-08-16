Status: ready-for-agent

# Flow-Based Link Routing MVP

## Problem Statement

Users who share links across multiple channels (QR codes on banners, social posts, ads) have no way to route that traffic through a single, editable destination, or to see who's actually clicking. Once a link is printed on a banner or shared publicly, its destination is fixed — changing where it points means reprinting or re-sharing, and there's no visibility into clicks, geography, or which channel is performing.

## Solution

Users build a **Flow** — a small graph of connected nodes — that generates one or more public short links (**Input nodes**) and routes their traffic to a destination (**Output node**). Because the destination lives behind the graph rather than in the shared link itself, it can be repointed at any time without touching what was printed or posted. Every click is recorded (country, referrer, UTM values — never the visitor's IP) and surfaced on a filterable analytics dashboard. Flows are built and edited visually on a canvas.

## User Stories

**Flow & node lifecycle**

1. As a user, I want to create a new Flow, so that I can start building a link-routing setup.
2. As a user, I want a new Flow to start with one auto-generated Input node, so that I immediately have a working (if unwired) link.
3. As a user, I want to add an Output node with a destination URL, so that my Input node's traffic has somewhere to go.
4. As a user, I want to add additional Input nodes to an existing Flow, so that multiple distinct links (e.g. QR codes on different banners) can share the same destination logic.
5. As a user, I want multiple Input nodes to connect to the same Output node, so that several campaign links can redirect to one shared destination.
6. As a user, I want to rename a Flow inline from its canvas editor, so that I can identify it later.
7. As a user, I want to rename an Input or Output node, so that individual links/destinations are identifiable within a Flow.
8. As a user, I want each node's canvas position to be remembered, so that the layout doesn't rearrange itself every time I reopen the Flow.
9. As a user, I want to disable a single Input node without affecting the rest of the Flow, so that I can kill one campaign link while keeping others live.
10. As a user, I want to re-enable a previously disabled Input node, so that I can resume a paused link.
11. As a user, I want to instantly pause an entire Flow (set it Inactive) from the flows list, so that I can quickly stop all its traffic without opening the editor.
12. As a user, I want to reactivate an Inactive Flow, so that I can resume it.
13. As a user, I want to archive a Flow, so that it's removed from my everyday list without losing its data.
14. As a user, I want to view archived Flows separately from active ones, so that my main list stays uncluttered.
15. As a user, I want to unarchive a Flow, so that I can bring it back into active use.
16. As a user, I want to delete a node from the canvas, so that I can remove parts of my Flow I no longer need — even though this looks permanent to me, the system retains the underlying data for historical reporting.

**Canvas editor**

17. As a user, I want to build my Flow visually by adding, connecting, moving, and removing nodes on a canvas, so that I can design routing logic intuitively.
18. As a user, I want to explicitly save my changes, so that I have full control over when my edits take effect.
19. As a user, I want to be warned before leaving the editor with unsaved changes, so that I don't accidentally lose my work.
20. As a user, I want a right-side panel that shows available node types to add when nothing is selected, and switches to that node's editable properties when I select it, so that I have one consistent place to configure anything on the canvas.
21. As a user, I want to copy an Input node's generated link directly from its canvas card, so that I can quickly grab and share a specific link even when a Flow has several.

**Redirects**

22. As a visitor, when I click a Wirebase-generated link, I want to be redirected to the correct destination immediately, so that I reach the intended content without noticeable delay.
23. As a visitor, if I click a link whose Flow isn't fully wired to a destination yet, I want to see a clear "not set up" page rather than an error, so that I understand the link simply isn't ready.
24. As a visitor, if I click a link belonging to a disabled Input node, or an Inactive/Archived Flow, I want to see the same "not set up" experience, so that a paused link doesn't redirect me somewhere unintended.
25. As the product, redirects must use HTTP 302, so that browsers and CDNs never cache a destination the link owner might change later.

**Click analytics & privacy**

26. As a user, I want each click recorded with timestamp, resolved country, user agent, referrer, and the Input node's active UTM values, so that I can analyze my traffic.
27. As a visitor, I want my IP address to never be stored, not even hashed, so that my privacy is protected beyond what's strictly required for the product to function.
28. As the product, click recording must not delay the redirect response, so that visitors experience fast redirects even under load.

**Dashboard**

29. As a user, I want to see my total click count at a glance, so that I immediately know my overall traffic level.
30. As a user, I want to see a ranked breakdown of clicks by country, so that I understand my geographic reach.
31. As a user, I want to see a ranked breakdown of clicks by link, so that I know which specific links perform best.
32. As a user, I want to see a ranked breakdown of clicks by referrer, so that I know which sources send me traffic.
33. As a user, I want to see a ranked breakdown of clicks by UTM campaign, with untagged clicks shown separately from small named campaigns, so that I can evaluate my marketing campaigns accurately.
34. As a user, I want to filter the dashboard by time range (24h/7d/30d/all-time), link, country, and Flow, in any combination, so that I can drill into exactly the traffic I care about.
35. As a user, I want archived or disabled links/Flows to still appear (marked accordingly) in dashboard filters and charts, so that I can still evaluate how a past campaign performed.

**Flows list page**

36. As a user, I want to see a list of my Flows with name, created/edited timestamps, link count, and status, so that I can manage them at a glance.
37. As a user, I want to create a new Flow from a clearly visible button, so that I can start quickly.
38. As a user, I want to search my Flows by name, so that I can find one quickly as my list grows.
39. As a user, I want my Flows sorted by most-recently-edited by default, so that the ones I'm actively working on are easiest to find.
40. As a user, I want a clear empty state with a call to action when I have no Flows yet, so that I know how to get started.
41. As a user, I want a quick link from a Flow's row to that Flow's filtered dashboard view, so that I can check its performance without extra navigation.

**UTM tagging**

42. As a user, I want to configure UTM source/medium/campaign/term/content values on an Input node, so that my destination analytics can attribute traffic correctly.
43. As a user, I want my configured UTM values to be appended to the destination URL on redirect, so that downstream analytics tools see them.
44. As a user, I want my configured UTM values to take precedence if the destination URL already defines the same parameter, so that my explicit tagging isn't silently overridden.

## Implementation Decisions

**Domain model** (see `CONTEXT.md` for full vocabulary):

- **Flow**: owned by a user; has a name and a status of `Active` / `Inactive` / `Archived` (ADR 0012). All Input nodes within one Flow resolve through the same shared downstream logic (ADR 0001).
- **Node**: belongs to a Flow, has a type (`Input` or `Output`), a name, and a canvas position (x/y). Input and Output carry different additional attributes — exact table normalization (one `nodes` table with type-conditional columns vs. per-type detail tables joined to a shared node row) is left open for implementation to decide.
  - **Input node** additionally has: a unique randomly-generated slug (no custom slugs — deferred, see Out of Scope), a status of `Enabled` / `Disabled`, and five optional UTM fields (source, medium, campaign, term, content).
  - **Output node** additionally has: a destination URL.
- **Edge**: connects two nodes via named slots (`from_node_id`/`from_slot`, `to_node_id`/`to_slot`) rather than a formal Port entity (ADR 0002). Today every node has exactly one slot per direction (`"in"`/`"out"`).
- **Click**: one row per visit — timestamp, the Input node it hit, resolved country, user agent, referrer, and the UTM values active on that Input node at click time. No IP address is ever stored, hashed or otherwise (ADR 0003).

**Redirect route** (the public, unauthenticated entry point):

- Resolves the requested slug to its Input node, checks that the Input node is Enabled and its Flow is Active, and walks the Edge graph to find a connected Output node.
- If fully wired and active end-to-end: merges the Input node's configured UTM values into the destination URL's query string (existing params preserved; Wirebase's UTM values win on key collision, ADR 0013) and responds with an HTTP 302 (ADR 0005) to the merged URL.
- If any part of that chain is missing, Disabled, Inactive, or Archived: renders a plain "this link isn't set up" page instead of redirecting (ADR 0009's Q17 discussion; ADR 0012).
- Writes the Click record after responding, not before — the redirect must never wait on the write completing (ADR 0004).
- Because this route serves anonymous, unauthenticated requests against otherwise user-owned data, slug resolution and graph traversal go through a Postgres function (`supabase.rpc(...)`) rather than a direct table `.select()`, per this project's public-data-isolation rule — the function returns only the resolved destination (or a "not configured" signal), never exposing Flow/Node data beyond that.

**Server Actions** (the authenticated app surface — this project uses the Server Actions pattern, no `services/` layer):

- Flow actions: create, rename, change status (Active/Inactive/Archived), delete.
- Node actions: add Input, add Output, rename, reposition, change Input status (Enabled/Disabled), update Output destination URL, update Input UTM fields, delete (routes through the same soft-delete mechanism regardless of whether it's triggered from the canvas or the flows list — ADR 0006, ADR 0011).
- Edge actions: connect, disconnect.
- Dashboard query actions: aggregate Click data by the combinable filters (time range, link, country, Flow), returning the total-clicks count plus the four ranked breakdowns (country, link, referrer, campaign — each top-6-plus-"Other", campaign additionally getting a distinct "(No campaign)" bucket for untagged clicks).
- Every action follows the shared `ActionResponse<T>` shape, validates with Zod before touching the database, and scopes all queries to the authenticated `user.id` — standard for every action/service in this codebase, not new to this feature.
- Deleting a node (from canvas or elsewhere) is soft — the row and its Click history persist; only the Flow-owner-facing UI treats it as gone (ADR 0011).

**Canvas editor**:

- Built on `@xyflow/react` (MIT, v12, React 19-compatible — ADR 0008), not a custom-built canvas.
- A new Flow's editor opens pre-seeded with one Input node; no Output is pre-created (ADR 0009).
- Explicit Save button; no autosave. Leaving with unsaved changes prompts a confirmation (ADR 0010).
- A right-side panel toggles between a node-type palette (nothing selected — "New link" instantly adds an Input, "New destination" adds an Output and prompts for its URL) and a properties form for whichever node is currently selected (name, link/URL, UTM fields, enable/disable toggle).
- No connection-validation logic is needed for MVP — Input exposes only an "out" handle and Output only an "in" handle, so `@xyflow/react`'s native handle typing already makes an invalid connection impossible to draw.
- No in-canvas undo/redo for MVP — reloading without saving is the safety net given the explicit-save model.

**Flows list page**:

- One row per Flow (not per link — ADR 0007), showing name, created/edited timestamps, link count, and status.
- No click counts in this table (that's the dashboard's job).
- Row actions: an icon button to jump to that Flow's filtered dashboard view, and a three-dot menu (Archive/Unarchive), plus a dedicated instant Active/Inactive switcher on the row.
- "New flow" button (top-right of the page header) creates the row immediately as "Untitled flow" and redirects straight into its canvas — no name-prompt step.
- Search-by-name input; default sort is most-recently-edited first; no pagination for MVP (load all).
- A view switcher separates the default Active/Inactive list from the Archived list.

## Testing Decisions

- **No test framework currently exists in this repository** — there is no prior art to follow. A framework needs to be introduced as part of this work; Vitest is a reasonable default given first-class TypeScript/ESM support and straightforward integration with Next.js Server Actions and route handlers, but this is a starting recommendation, not a locked decision.
- Tests target exactly the two seams confirmed for this feature:
  - **Redirect route**: exercised via real HTTP requests to the route with slugs in every relevant state — fully wired & active, dangling (no Output connected), Input Disabled, Flow Inactive, Flow Archived. Assert on response status and redirect `Location` (including correct UTM merge/collision behavior against a destination URL that already has query params), and assert a Click row was written afterward with the expected fields.
  - **Server Actions**: exercised by calling the exported action functions directly. Assert on the returned `ActionResponse<T>` shape and the resulting database state — covering Flow/Node/Edge CRUD, all three status transitions on a Flow, Enabled/Disabled on an Input node, soft-delete behavior, and dashboard aggregation queries against seeded Click data (including the top-6-plus-Other and "(No campaign)" bucketing behavior).
- A good test in this codebase asserts on external behavior (the action's return value and the database rows that exist afterward, or the HTTP response), never on internal implementation details of how an action or the route handler is written internally.
- **Explicitly not covered by automated tests**: the canvas's visual/drag-and-drop interactions (`@xyflow/react` mechanics, node dragging, edge drawing) — verified manually in-browser per this project's standard practice for UI changes, not worth an automated seam for an MVP.

## Out of Scope

- **Geo/condition branching nodes** — traffic splitting by country or other conditions. An entire future grilling session is dedicated to this; only the `Slot` data model (ADR 0002) is built to accommodate it later.
- **"Split" node** (percentage-based A/B traffic splitting) — mentioned once as a future idea, never designed.
- **Custom link slugs** — MVP is random-slug-only.
- **Unique-visitor / session tracking** — no IP-derived identifier is stored; only raw click counts exist.
- **Real-time dashboard updates** — refresh-on-load only.
- **In-canvas undo/redo**.
- **Flow-level UTM defaults/inheritance** — each Input node's UTM fields are fully independent; a future "duplicate node" feature was proposed as a lighter alternative but isn't designed.
- **Dashboard charts for utm_source/medium/term/content** — only `utm_campaign` gets a chart; the other four fields are captured and forwarded but not separately visualized.
- **Node-deletion restore/undelete UI** — deletion is soft internally, but there is no user-facing way to bring a deleted node back for MVP.
- **Bulk actions, pagination, or advanced filtering on the flows list** — search-by-name and a two-way active/archived view switch are the only list controls.

## Further Notes

This spec synthesizes five design sessions (`docs/adr/0001`–`0014`, `CONTEXT.md`) covering: the core Flow/Input/Output model, click analytics and privacy, the dashboard, the canvas editor, the flows list page, and UTM tagging. Every implementation decision above traces back to one of those ADRs or to explicit confirmation in those sessions — none of it is newly invented here. The project's Server Actions pattern, `ActionResponse<T>` convention, Zod-first validation, and user-scoped query rules (CLAUDE.md) apply throughout and aren't restated per-action above.
