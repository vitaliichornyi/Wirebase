---
status: accepted
---

# Deleting a Flow or Input node is soft, and never cascades into shared nodes

Deleting an Input node or a Flow marks it deleted and stops it from serving redirects, but the row and its click history are kept for historical reporting rather than hard-deleted. We considered hard delete, which is simpler, but rejected it: click history has reporting value independent of whether the link is still live, and there's no way to recover it once a hard delete runs. Deletion cascades only to the deleted node's own edges — it never removes a shared Output (or, later, a shared geo/condition node) that other Input nodes in the same Flow still depend on; only deleting every Input node that references a shared node would leave it orphaned, and orphan cleanup is a separate concern from this decision.
