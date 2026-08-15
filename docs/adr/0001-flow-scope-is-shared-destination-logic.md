---
status: accepted
---

# A Flow's scope is defined by shared destination logic, not by an owning link

A Flow can contain multiple Input nodes (multiple generated links), but every Input node inside one Flow must resolve through the same downstream routing logic — today that means the same Output node; later it may mean the same shared geo/condition node. We considered letting Input nodes within a single Flow point at unrelated Outputs (turning a Flow into a loose folder of unrelated redirects), but rejected it: it would make "what does this Flow mean" ambiguous, and it's the wrong fit for the motivating use case (many QR-code campaign links funneling into one shared redirect policy). If two links need genuinely unrelated destinations, they belong in two separate Flows, not two branches of one.
