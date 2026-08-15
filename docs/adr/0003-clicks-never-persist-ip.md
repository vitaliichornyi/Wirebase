---
status: accepted
---

# Click records never persist the visitor's IP address, not even hashed

A click record stores the country resolved for the visitor, but never the IP address itself — not raw, not hashed. On Vercel (the target deployment platform) country arrives pre-resolved via the `x-vercel-ip-country` request header, so the app never needs to look up or retain the IP to get it. We considered hashing the IP to support future unique-visitor counting, but rejected persisting anything IP-derived for MVP: it's a GDPR-sensitive default to avoid, and unique-visitor counting (which would need a hash, a salt rotation policy, and a retention period) deserves to be designed deliberately later rather than bolted on now. If the deployment platform changes away from Vercel, country resolution will need a replacement (e.g. a geolocation service), but the no-persisted-IP rule stands regardless of platform.
