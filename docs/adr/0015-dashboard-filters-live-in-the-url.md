---
status: accepted
---

# Dashboard filters live in the URL

Dashboard filters (`timeRange`, `flowId`, `inputNodeId`, `country`) are synced to the URL's query string: changing a filter calls `router.replace` with a new query string, and `page.tsx` (a Server Component) re-reads `searchParams` on every navigation and calls `getClickStats` directly with the parsed values. We considered instead keeping filters in client `useState` and only mirroring them into the URL on the side, but rejected it — that leaves two copies of the same state (URL and client) that can drift apart, which is exactly the failure mode this feature exists to prevent. With the URL as the sole source of truth, copying the address bar's URL always reproduces the exact filtered view, and deleting a filter from the URL resets it for free, with no manual reconciliation code.

A malformed or stale value for one filter (e.g. a `flowId` for a deleted flow) is silently dropped back to that field's default rather than surfacing an error — the user is treated as having opened a stale or hand-edited link, not as having done something wrong.
