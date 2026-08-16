# 01 — Core Flow/Node/Edge schema and redirect pipeline

**What to build:** The complete backend mechanism, end to end, with no UI yet: creating a Flow (seeded with one auto-generated Input node, per ADR 0009), adding an Output node with a destination URL, connecting an Input to an Output, and having a visit to the Input node's public link redirect (HTTP 302) to the Output's destination while a Click record is written afterward. An Input node not yet connected to an Output shows a "not set up" page instead of erroring. This also introduces the project's test framework (none exists yet) since every later ticket depends on it, and establishes the Flow/Node/Edge/Click schema every subsequent ticket builds on.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Creating a Flow creates exactly one auto-generated Input node with a random slug (no custom slugs for MVP)
- [ ] An Output node can be added to a Flow with a destination URL
- [ ] An Input node can be connected to an Output node via an Edge (named slots, not a formal Port entity — ADR 0002)
- [ ] Multiple Input nodes can connect to the same Output node
- [ ] Visiting a fully-wired Input node's link responds with HTTP 302 (never 301 — ADR 0005) to the Output's destination URL
- [ ] Visiting an Input node's link before it's connected to an Output shows a "not set up" page instead of an error
- [ ] A Click row is written after the redirect response is sent, never before (fire-and-forget — ADR 0004)
- [ ] The Click row captures timestamp, resolved country, user agent, and referrer — the visitor's IP is never stored, hashed or otherwise (ADR 0003)
- [ ] All Flow/Node/Edge/Click data is scoped to the authenticated owner via `user_id`
- [ ] The public redirect route resolves slugs and walks the graph via a Postgres RPC function, never a direct table `.select()` against Flow/Node data, per this project's public-data-isolation rule
- [ ] A test framework is installed and configured; this ticket's behavior is verified through the two confirmed seams — direct Server Action calls, and real HTTP requests to the redirect route
