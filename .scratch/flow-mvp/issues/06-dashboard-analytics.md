# 06 — Dashboard analytics

**What to build:** The `/dashboard` page — the only place charts live in this product, filterable across every Flow and link the user owns.

**Blocked by:** 01 — Core Flow/Node/Edge schema and redirect pipeline, 02 — Flow and Input node lifecycle, 03 — UTM configuration and forwarding

**Status:** ready-for-agent

- [ ] A total-clicks tile reflects the current filter selection (one number, no breakdown)
- [ ] A ranked bar chart shows clicks by country, sorted descending, top 6 plus an "Other" bucket
- [ ] A ranked bar chart shows clicks by link, same top-6-plus-Other pattern
- [ ] A ranked bar chart shows clicks by referrer, same top-6-plus-Other pattern
- [ ] A ranked bar chart shows clicks by UTM campaign, same top-6-plus-Other pattern, with a distinct "(No campaign)" bucket separate from "Other" for untagged clicks
- [ ] Filters for time range (24h / 7d / 30d / all-time, default 7d), link, country, and Flow can all be combined simultaneously
- [ ] Archived or disabled links/Flows still appear in filters and charts, visually marked as such, so historical performance stays reviewable
- [ ] No unique-visitor metric appears anywhere — every number is a raw click count
- [ ] Data refreshes on load only — no real-time updates
