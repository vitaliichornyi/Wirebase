# Wirebase

Wirebase lets users build link-routing graphs ("Flows") that generate public short links and redirect visitors through configurable logic to a destination, while recording click analytics.

## Language

**Flow**:
A user-built graph of connected nodes that defines how traffic arriving on one or more generated links is routed to a destination. All Input nodes within a Flow share the same downstream routing logic — links that must lead to unrelated destinations belong in separate Flows.
_Avoid_: Wire (deprecated working name)

**Node**:
A single step in a Flow (e.g. an Input node or an Output node) that traffic passes through.

**Edge**:
A directed connection between two nodes in a Flow, along which traffic travels from one node to the next. Identified by the slots it connects, not a separate entity of its own.
_Avoid_: Wire, Connection

**Slot**:
A named connection point on a node where an Edge attaches. Input and Output nodes each have exactly one slot today (`"in"`/`"out"`); future branching nodes (e.g. a geo node) will expose one slot per branch (`"usa"`, `"ukraine"`, `"other"`).
_Avoid_: Port (rejected as a formal entity — see ADR 0002)

**Input node**:
The node that generates the public link a visitor clicks; the entry point where traffic arrives into a Flow. A Flow may have several Input nodes (e.g. multiple campaign links feeding one shared destination).
_Avoid_: Entry node, Source node, Output node (an earlier, corrected mislabeling)

**Output node**:
The terminal node holding the destination URL a visitor is redirected to. More than one Input node may share the same Output.
_Avoid_: Destination node, Input node (an earlier, corrected mislabeling)

**Click**:
A single recorded visit to an Input node's link — timestamp, resolved country, user agent, referrer, and the Input node's UTM values at the time of the click, never the visitor's IP (see ADR 0003). The only countable analytics unit; there is no unique-visitor concept for MVP.
_Avoid_: Session, unique visitor, hit

**Flow status** (Active / Inactive / Archived):
Active redirects normally. Inactive is a fast, reversible pause — links show a "not configured" page, but the Flow stays visible in the default Flows list. Archived is also paused, but hidden from the default list, reached deliberately via a menu action rather than a one-click switcher (see ADR 0012).
_Avoid_: Disabled, Enabled (reserved for Input node status, a separate concept)

**Input node status** (Enabled / Disabled):
Independent of Flow status — a single Input node can be Disabled inside an otherwise Active Flow, pausing one link without affecting the rest of the Flow.
_Avoid_: Active, Inactive (reserved for Flow status, a separate concept)
