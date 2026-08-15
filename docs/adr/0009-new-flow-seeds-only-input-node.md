---
status: accepted
---

# A new Flow starts with one Input node, never a pre-seeded Output

Creating a Flow places exactly one auto-generated Input node on the canvas — no Output node is created until the user adds one and supplies a destination URL. We considered pre-seeding both (a connected, immediately "complete" Flow), but rejected it: an Output requires a URL only the user can provide, and forcing one to exist at Flow-creation time means either blocking creation until a URL is entered or inventing a placeholder value — both add friction or ambiguity for no benefit. Instead, an Input with no path to an Output is exactly the already-handled "dangling link" case from session 1 (ADR-adjacent Q17): visiting it shows a "not set up yet" page. No new validation or error handling was needed to make this decision safe.
