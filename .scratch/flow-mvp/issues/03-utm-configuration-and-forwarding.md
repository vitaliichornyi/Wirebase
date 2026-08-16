# 03 — UTM configuration and forwarding

**What to build:** UTM tagging on Input nodes, forwarded to the destination on redirect, and captured on each Click.

**Blocked by:** 01 — Core Flow/Node/Edge schema and redirect pipeline

**Status:** ready-for-agent

- [ ] An Input node can store optional `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `utm_content` values via a Server Action
- [ ] On redirect, configured UTM values are merged into the destination URL's query string, preserving any params already on that URL
- [ ] If the destination URL already defines one of the five UTM keys, the Input node's configured value wins (ADR 0013)
- [ ] Each Click record captures the UTM values that were active on its Input node at the time of the click
