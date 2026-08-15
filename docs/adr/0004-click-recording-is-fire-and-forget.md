---
status: accepted
---

# Click recording is fire-and-forget; the redirect responds before the write is confirmed

When a visitor hits a link, the server responds with the redirect immediately and writes the click record without waiting for that write to complete. We considered writing the click record first and redirecting only after it succeeded, which guarantees no click is ever lost, but rejected it: redirect latency is directly visible to every visitor on every click, while an occasional lost click (only on a process crash mid-write) has no visible cost. This is a deliberate deviation from the safer default — a future engineer optimizing for data completeness should know it was chosen for latency, not overlooked.
