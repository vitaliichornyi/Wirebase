---
status: accepted
---

# Edges reference slot strings instead of a formal Port entity

An Edge stores `(from_node_id, from_slot)` and `(to_node_id, to_slot)`, where `slot` is a plain string, rather than introducing a dedicated `ports` table that nodes own rows in. Today every node has exactly one slot per direction (`"in"`/`"out"`), but future branching nodes (geo, condition) need several named outgoing slots (`"usa"`, `"ukraine"`, `"other"`). The slot-string approach gets that same flexibility without a Port table that would sit unused until those node types actually exist — it can be introduced later without a data migration if a slot ever needs its own attributes beyond a name.
