---
status: accepted
---

# Redirects use 302 (temporary), never 301 (permanent)

Every redirect a Flow serves responds with HTTP 302. We considered 301, which is the more common default for "permanent-feeling" short links and carries minor SEO benefits, but rejected it: browsers and CDNs cache 301s aggressively and stop re-checking with the origin. Since an Input node's destination is user-editable by design — the whole point of routing through an Output node is that it can be repointed later — a cached 301 would silently strand a portion of visitors on a stale destination, and their clicks would never reach the server to be recorded. 302 is re-validated on every visit, matching the fact that "where this link goes" is never assumed to be permanent.
