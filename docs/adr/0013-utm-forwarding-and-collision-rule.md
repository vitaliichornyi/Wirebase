---
status: accepted
---

# UTM values are forwarded to the Output URL, taking precedence on collision

When redirecting, the five UTM values configured on an Input node (source, medium, campaign, term, content — each optional) are merged into the Output URL's query string: existing params are preserved, and if the destination URL already defines one of the five UTM keys itself, Wirebase's configured value overwrites it. We considered leaving the destination URL's own value untouched on collision, but rejected it: a UTM field explicitly set in Wirebase is a deliberate signal from the link creator, while a UTM key already baked into a raw destination URL is more likely a stale leftover from before the link was routed through Wirebase.
