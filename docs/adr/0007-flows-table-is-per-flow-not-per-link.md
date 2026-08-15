---
status: accepted
---

# The Flows table shows one row per Flow, not one row per link

`/dashboard/flows` lists one row per Flow, not one row per Input node (link) — reversing an earlier draft of this decision from the first design session. We considered one row per link, since a link is the thing a user actually copies and shares, but rejected it: once a Flow can hold more than one Input node, showing every link as its own top-level row makes "editing a row" ambiguous — are you editing the link, or the whole Flow's routing logic? Multiple Input nodes per Flow is also expected to be the unusual case, not the common one; most Flows will have exactly one link. Copying an individual link when a Flow has several is a real UI problem this decision deliberately leaves unsolved, to be designed later.
