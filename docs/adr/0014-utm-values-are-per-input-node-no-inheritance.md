---
status: accepted
---

# UTM values are configured independently per Input node; Flows don't define inheritable defaults

Each Input node stores its own five UTM fields directly; there is no Flow-level "default UTM" that nodes inherit and can override. We considered inheritance — appealing for the QR-banner scenario, where many links in one Flow might share a campaign name — but rejected it for MVP: it requires real design (override resolution, showing "inherited vs overridden" in the UI) for a problem that copy-pasting a value into a handful of nodes already solves well enough. A lighter alternative — duplicating an existing Input node (carrying over its UTM values as a starting point) — was raised as a future feature to revisit this problem without building inheritance.
