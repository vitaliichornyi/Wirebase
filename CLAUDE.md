# CLAUDE.md — Project Engineering Standards

**Contents:** Maintenance Protocol · Ticket Interpretation · Tech Stack · Directory Structure · Routing & Access Control · Server & Client Components · RESTful API Architecture · Component Architecture · Data Layer · Error Handling & Display · Types & Zod Schemas · Code Style · Forms · Security & Environment Variables · UI Copy Guidelines

---

## Maintenance Protocol

This file is read at the start of every session as the project's rule set — treat it as read-only context by default.

- **Read, don't edit, by default.** Never modify this file on your own initiative — not to "clean up," fix a typo, reorder, or rephrase — even if something looks improvable. Follow the rules; don't maintain the file unless asked.
- **Edit only on an explicit add-rule request.** The user will say something like "add a rule that..." / "добавь правило чтобы...". That phrasing (or equivalent) is the only trigger to write to this file.
- **Where to put a new rule:**
  1. Find the existing `##`/`###` section the rule belongs to and add it there as a new bullet, in that section's existing style (dense bullets, tables, or code fences — match what's already there).
  2. If no section fits, create a new `##` section in a sensible place and add it to the Contents line at the top.
  3. Never add a numbered section header (`## 1.`, `### 2.3`, etc.) — headers stay name-only, and cross-references point to header names in bold, never numbers (see why in git history / ask the user if unclear — a past renumbering silently broke every `§N` reference in this file).
- **Before adding, check for conflicts.** If the new rule contradicts or overlaps an existing one, point out the conflict and ask how to resolve it rather than silently adding a duplicate or contradictory bullet.
- **No unsolicited restructuring.** Bulk reorganizations (like the one that produced this file) happen only when the user explicitly asks for them — not as a side effect of adding one rule.
- **Stay generic — this file is a cross-project style guide, not a spec for this project.** It encodes the user's own engineering style and conventions, reused across different projects — not a record of this specific project's entities, files, or one-off decisions. New rules must read as portable conventions (patterns, naming schemes, folder shapes) that would make sense in another codebase too. A concrete example is fine for illustration, but favor generic stand-ins (`format-date.ts`, `<feature-name>`) over this project's actual filenames when a generic one teaches the same rule just as well. Examples already in the file that happen to use this project's real names don't need to be swapped out retroactively — this only shapes how new rules get worded going forward.

---

## Ticket Interpretation

- Tickets are written by someone who doesn't know this codebase's architecture — treat a ticket as a statement of the required **outcome** (what must be true, what the user must be able to do), not as a literal implementation spec. How that outcome is achieved is an engineering decision, made using this file and the existing codebase — not by transcribing the ticket's wording into code or prose one line at a time.
- **Check for existing functionality before implementing.** A described behavior may already fall out of the current architecture (an existing form's validation mode, a shared schema, a redirect already wired elsewhere). If it does, don't add redundant code, don't duplicate logic to "cover" it a second time, and don't write filler text declaring it done — just recognize it's already satisfied and move on.
- Acceptance criteria describe what must hold true when the ticket is finished, not a one-for-one checklist of separate features to build — one existing mechanism can already satisfy several stated criteria at once.

---

## Tech Stack & Documentation

The project relies strictly on the technologies below. Refer to the official docs for syntax, features, and best practices — do not rely on legacy memory.

| Technology | Purpose | Docs |
| --- | --- | --- |
| React | Core UI library | https://react.dev/reference/react |
| Next.js | Routing, rendering, server-side functionality | https://nextjs.org/docs |
| TypeScript | Static typing across the app | https://www.typescriptlang.org/docs/ |
| TanStack Query | Client-side async state, fetching, caching | https://tanstack.com/query/latest/docs/framework/react/overview |
| Tailwind CSS | Utility-first styling | https://tailwindcss.com/docs |
| shadcn/ui | Accessible UI primitives | https://ui.shadcn.com/docs/installation |
| Zod | Schema validation (API payloads, forms, env vars) | https://zod.dev/ |
| React Hook Form | Form state & input handling | https://react-hook-form.com/docs |
| Supabase | Database, auth, storage (BaaS) | https://supabase.com/docs |

### Version & Convention Verification

- Before proposing architectural structures, file names, or framework conventions, verify they are valid for the current/latest target version.
- If unsure whether a naming convention or API method still exists, explicitly state the uncertainty or check the official docs — never rely on legacy memory.
- Do not hallucinate migration tools, codemods, or API exports without absolute certainty.

### Dependency Management

- **Pre-installation check:** before installing/configuring any library, inspect `package.json` to confirm whether it's already installed.
- **Version-specific docs:** don't guess API usage — check the exact installed version in `package.json` and reference the docs for that version.
- **Conflict resolution:** if a request, syntax, or prompt conflicts with training data or modern package practices, verify the current correct implementation against the official docs before writing code.

---

## Directory Structure

### Root Convention

All source code lives strictly inside `src/`.

### App Router Layout

Routing is built strictly on Next.js App Router conventions inside `src/app/`. File placement directly dictates URL routing, layout inheritance, and access control:

```text
src/
├── proxy.ts # Access control (see Routing & Access Control)
└── app/
    ├── layout.tsx # Root layout
    ├── page.tsx # Public entry page.
    ├── <section_name>/
    │   └── page.tsx # Another unprotected section.
    ├── <section_name>/ # Protected application section.
    │   ├── layout.tsx # Section layout
    │   ├── page.tsx # Main page of the protected section.
    │   └── <section_name>/ # Another protected application section
    │       └── page.tsx
    └── api/ # API route handlers
        └── <resource_name>/ # Entity collection endpoint (e.g., movies, users)
            ├── route.ts
            └── [id]/ # Dynamic entity endpoint (e.g., movies/[id])
                └── route.ts
```

Placeholders (not literal folder names) — replace with names appropriate to the project:

- `<section_name>` → a routing section under `app/` (`dashboard`, `users`, `projects`, `settings`, `billing`, `insights`, `reports`) — a URL/routing concept, distinct from `features/<name>/` (see Extended `src/` Structure below): one route section's `page.tsx` typically composes several `features/*`, not just one.
- `<resource_name>` → an API resource (`users`, `projects`, `posts`, `orders`)
- `[id]` → a dynamic resource identifier

### Extended `src/` Structure — Feature-First

Code is grouped **by business feature, not by technical layer.** Everything belonging to one business capability (`actions/`, `services/`, `schemas/`, `types/`, `components/`, `hooks/`, `lib/`) lives together, in one folder. The only exception is `shared/`, for code with zero dependency on any specific business entity.

```text
src/
├── features/                      # All business logic, grouped by domain
│   └── <feature-name>/
│       ├── actions/                # Server Actions pattern only — thin, createSafeAction-wrapped
│       │   └── update-profile.ts
│       ├── services/                # Business logic — has ZERO knowledge of Next.js (no cookies(), revalidatePath(), etc.)
│       │   └── user-service.ts
│       ├── schemas/                 # Zod validation schemas owned by this feature
│       │   └── user-schema.ts
│       ├── types/                   # ONLY types that can't be inferred from a schema (DB entities, DTOs, etc.)
│       │   └── user.types.ts
│       ├── components/              # React components that know about this feature's entities
│       │   ├── user-card.tsx
│       │   └── user-form.tsx
│       ├── hooks/                   # Hooks specific to this feature
│       │   └── use-user.ts
│       ├── lib/                     # Pure algorithm/helper code scoped to this feature only — no DB, no Next.js
│       │   └── generate-slug.ts
│       └── index.ts                 # PUBLIC API of the feature — the only entry point from outside it
└── shared/                         # Fully domain-agnostic code only
    ├── ui/
    │   ├── primitives/               # Raw shadcn/ui components, generated by the CLI, unmodified
    │   └── ...                       # Agnostic wrappers over primitives/ (avatar.tsx, confirm-dialog.tsx)
    ├── lib/                          # Framework-agnostic utils & HOFs (create-safe-action.ts, format-date.ts)
    ├── types/                        # Global types with no feature owner (Pagination<T>, cross-cutting enums)
    ├── schemas/                      # Global Zod schemas reused across features (pagination, date range, address)
    ├── hooks/                        # Universal hooks with no domain knowledge (useDebounce, useMediaQuery)
    └── providers/                    # Global React context providers — see Providers & Root Layout
```

| Folder | Responsibility |
| --- | --- |
| `features/<name>/actions/` | **Server Actions pattern only.** Thin `'use server'` wrappers built with `createSafeAction`, which owns Zod validation and the `getUser()` auth check. The action body only calls the matching `services/` function — no business logic or DB/Supabase calls live here (see Data Layer → Server Actions Pattern). |
| `features/<name>/services/` | The only place business logic and DB/Supabase queries live for this feature. Knows nothing about Next.js — no `cookies()`, `revalidatePath()`, route handlers, etc. |
| `features/<name>/schemas/` | Zod validation schemas owned by this feature. |
| `features/<name>/types/` | Only types that genuinely can't be inferred from a schema (DB row shapes not covered by Zod, DTOs, service response payloads). |
| `features/<name>/components/` | React components that know about this feature's entities — see Component Architecture. |
| `features/<name>/hooks/` | Hooks specific to this feature. |
| `features/<name>/lib/` | Pure algorithm/helper code tied to this feature's domain (e.g. generating a redirect slug for a node) — a feature-scoped mirror of `shared/lib/`. No DB/Supabase calls (that's `services/`) and no Next.js APIs (`cookies()`, `revalidatePath()`). If the same helper is later needed by 3+ features and is genuinely domain-agnostic, promote it to `shared/lib/` instead (see Cross-Feature Reuse → Rule of Three). |
| `features/<name>/index.ts` | The feature's public API. Everything another feature or `app/` imports from this feature goes through here — see Cross-Feature Reuse below. |
| `shared/ui/primitives/` | Raw shadcn/ui components — installed via CLI only, never hand-edited for feature-specific logic. |
| `shared/ui/` (above `primitives/`) | Domain-agnostic wrappers over `primitives/` (`Avatar`, `ConfirmDialog`, `DataTable`) — know nothing about any entity — see Component Architecture. |
| `shared/lib/` | Framework-agnostic utils, constants, and HOFs. Never DB queries or domain-specific auth/business logic — see Data Layer → Environment & Client Setup for the one named exception (`createSafeAction`). |
| `shared/types/` | Global types with no feature owner (`Pagination<T>`, cross-cutting enums). |
| `shared/schemas/` | Global Zod schemas genuinely reused across features (pagination, date range, address). |
| `shared/hooks/` | Universal hooks with no domain knowledge (`useDebounce`, `useMediaQuery`). |
| `shared/providers/` | One global provider per file — see Providers & Root Layout below. |

**Small features don't need every subfolder.** If a feature is small (1–2 functions), skip subfolders that would be empty — start with flat files (`actions/user.ts`, `services/user.ts`) and only introduce a subfolder once a file genuinely needs to split (see File & Code Naming Conventions below).

### Feature Boundaries

A feature is a **cohesive business capability with a clear entry point** — not a database table, not a technical layer. Judge a boundary with these tests together, not any single one in isolation:

- **Business capability, not entity.** A feature is "what the user can do", not "what table exists". One feature can legitimately cover multiple entities that have no meaning apart from each other (`node` + `edge` → one `flow-editor` feature, since an `edge` doesn't mean anything without a `node`).
- **Independent-ownership test.** A good feature is one you could hand to a single developer, and they'd rarely need to touch code outside it.
- **Deletion test.** Deleting the feature's folder entirely should break little, and predictably (only through its `index.ts` imports elsewhere). If deleting it breaks things scattered across the whole app, it's not a feature — it's infrastructure, and belongs in `shared/`.
- **Dependency-direction test.** One-directional imports between features (A imports B, never the reverse) are fine. A cycle (A imports B and B imports A) is a signal that either the shared part belongs in `shared/`, or the boundary itself is drawn wrong and needs to be reconsidered.
- **Change-frequency test.** Code that almost always changes together in the same commit is probably one feature. Code that lives an independent life is separate features, even when technically related.

Examples:
- `auth` (login/register/session) is its own feature.
- `user-profile` is separate from `auth`, even though both concern the same user — different business purpose.
- `node` + `edge` are one feature (`flow-editor`), never split — `edge` has no meaning on its own.
- `payment` and `order` are usually separate features, linked via an interface/event, not a direct import.
- `notification` is often its own infrastructure feature that others *use*, never the reverse.

### Cross-Feature Reuse

When something from feature A is needed inside feature B:

1. **Never duplicate.** Export it from `features/A/index.ts` and import it from there in B — never reach past the public API into `features/A/services/...` or any other internal path.
   ```ts
   // features/user/index.ts
   export { userSchema } from './schemas/user-schema';

   // features/post/schemas/post-schema.ts
   import { userSchema } from '@/features/user';
   ```
2. **If only part of an entity is needed, don't import the whole thing.** Don't pull in a heavy shared schema/type wholesale for a couple of fields — define a narrow local variant instead:
   ```ts
   // don't import the whole userSchema if only id + name are needed
   const postAuthorSchema = z.object({ id: z.string(), name: z.string() });
   ```
3. **Rule of Three:** used in 1 place → leave it where it is. Used in 2 places → still fine to leave it, don't extract yet. Used in 3+ places → move it to `shared/` if the code is genuinely agnostic, or keep it with the owning feature (exported via `index.ts`) if it's tied to that feature's entity.

### Providers & Root Layout

- `src/shared/providers/` is for providers that own actual setup/config code (e.g. TanStack Query Provider instantiating a `QueryClient`, a Theme Provider managing theme state) — each one lives in its own file, starting with `'use client'`.
- **Always wrap a provider in its own file, even a zero-config one.** A third-party client primitive (e.g. a UI library's `TooltipProvider`) used with no extra options still gets its own file in `src/shared/providers/` rather than being imported raw into `src/app/layout.tsx` — this keeps the pattern consistent everywhere, even when today's wrapper is a thin pass-through with no config of its own.
- **One provider per file, always.** Never stack multiple providers in a single file — a zero-config provider is not an exception; it still gets its own dedicated file, not folded into another provider's.
- Global providers are wired up **only** in the root layout (`src/app/layout.tsx`) — never in nested/section/feature layouts.
- `src/app/layout.tsx` must remain a Server Component; never convert it to a Client Component to render providers.
- **Every layout (root and nested/section) is a Server Component.** No `layout.tsx` at any level ever carries `'use client'`. Layouts exist to wrap pages and route groups with shared structure — any interactivity belongs in the pages or components they render, not in the layout itself.

### File & Code Naming Conventions

- **Core philosophy:** avoid micro-files. Group all closely related operations for a feature into one file by domain/module (e.g. `auth.ts` covers `login`, `logout`, `refreshToken`; `links.ts`, `links-analytics.ts`).
- **Stay flat until a file genuinely needs to split.** Start with flat files directly inside each subfolder (`services/user.ts`, `actions/user.ts`) and split only once a file outgrows itself (~150–300 lines, or it's accumulated logically unrelated content) — never speculatively (see Component Architecture → Don't Split Into Subcomponents Unless Actually Reused).
- **`createSafeAction`** (see Data Layer → Server Actions Pattern) is shared infrastructure, not a feature entity, so it does **not** live inside any `features/<name>/` folder — it lives in `src/shared/lib/create-safe-action.ts` (see Data Layer → Environment & Client Setup for why `shared/lib/` and not a feature's `actions/`).
- **File naming:** kebab-case only, everywhere. Pattern: `domain.ts` or `domain-submodule.ts`.

| Location | File naming | Symbol naming | Example |
| --- | --- | --- | --- |
| `features/<name>/types/` | kebab-case (`user.types.ts`, `auth-credentials.ts`) | PascalCase types/interfaces | `export type DashboardStats = {...}`, `export interface UserProfile {...}` |
| `features/<name>/services/` | kebab-case (`user-service.ts`, `links-management.ts`) | camelCase functions | `export async function loginUser() {...}` |
| `features/<name>/actions/` | kebab-case (`update-profile.ts`, `delete-user.ts`) | camelCase functions | `export const updateProfile = createSafeAction(updateUserSchema, ...)` |
| `features/<name>/schemas/` | kebab-case (`user-schema.ts`, `links.ts`) | camelCase, suffixed `Schema` | `export const loginSchema = z.object({...})` |
| `features/<name>/lib/` / constants | kebab-case (`generate-slug.ts`) | UPPER_SNAKE_CASE (constants); camelCase functions | `export const SLUG_LENGTH = 8;`, `export function generateSlug() {...}` |
| `shared/lib/` / constants | kebab-case (`auth-constants.ts`, `api-routes.ts`) | UPPER_SNAKE_CASE (constants); camelCase functions | `export const MAX_RETRY_ATTEMPTS = 3;`, `export function formatDate() {...}` |
| `features/<name>/hooks/`, `shared/hooks/` | kebab-case, `use-` prefix (`use-auth.ts`) | camelCase, `use` prefix | `export function useAuth() {...}` |

---

## Routing & Access Control

### Public & Protected Sections

- **Public (unprotected):** accessible without authentication — landing page, login, register, docs, etc. `app/page.tsx` may represent any public entry point depending on the project.
- **Protected:** accessible only to authenticated users. Contains the main application, with its own shared `layout.tsx` for the app shell (Sidebar, Header, Navigation). All authenticated pages live here.
- **"All authenticated pages live here" means one real folder, not a route group.** The protected area is a single top-level feature folder whose `page.tsx` is the post-login landing page (e.g. `app/dashboard/`) — its `layout.tsx` is the shared app shell, and every other protected page nests inside that same folder (`app/dashboard/wires/page.tsx` → `/dashboard/wires`, `app/dashboard/settings/page.tsx` → `/dashboard/settings`), never as a sibling top-level folder. Do not reach for a Next.js route group (`(name)/`) to share the shell across sibling folders instead — the protected area's URLs should read as one product section, not several unrelated top-level ones.

### Authentication Routing

Access control is handled strictly in `src/proxy.ts` (Next.js Proxy — `middleware.ts`/`middleware.js` no longer exists in this project's target Next.js version; it was renamed to `proxy.ts`):

- Unauthenticated users can freely access the Public Section; any attempt to reach the Protected Section redirects to `/`.
- Authenticated users can freely access the Protected Section; any attempt to reach the Public Section redirects to the Protected Section's main page.
- Any request interception, rewrite, routing, or pre-processing goes in `proxy.ts`. Never suggest or write `middleware.ts`.

### Dynamic Routes & URL Prefixing

- **Forbidden root dynamic routes:** dynamic parameters must never sit directly at the root of `app/` (e.g. `src/app/[slug]/page.tsx` is strictly forbidden) — they collide with global pages, auth routes, and the standard 404 fallback.
- **Mandatory entity prefixes:** every dynamic segment must live inside an explicit parent directory that scopes the entity type:
  - Catch-all/redirect shortcodes: a dedicated short-prefix directory, e.g. `src/app/c/[slug]/page.tsx` for `/c/abc123`.
  - Domain entities: the plural entity name, e.g. `src/app/movies/[id]/page.tsx`, `src/app/users/[id]/page.tsx`.
- Never mix generic root-level routing with dynamic pattern matching — shortlinks, deep links, or user handles must live in their own scoped namespace.

---

## Server & Client Components

### Defaults

- `layout.tsx` (root and nested) is always a Server Component — no exception, ever. Layouts only wrap pages/route groups with shared structure; whatever interactivity is needed belongs in what they render, not in the layout itself.
- `page.tsx` is a Server Component by default. It goes client directly only when the entire page is genuinely client-driven and there's nothing on it worth keeping server — no fetch to `await`, no static/instant part worth splitting out into its own piece. Introducing a server `page.tsx` that does nothing but render one client child, purely to keep the directive off `page.tsx` itself, is the kind of speculative splitting this file otherwise forbids (see Component Architecture → Don't Split Into Subcomponents Unless Actually Reused) — when there's truly nothing to gain from the split, mark `page.tsx` itself `'use client'`.
- Whenever only *part* of a page needs client capabilities and something else on the page (a fetch, a static header, another region) genuinely benefits from staying server, extract the client-needing part — however large, up to nearly the whole visible content — into its own Client Component, and keep `page.tsx` Server. Size doesn't decide this; a real, isolable reason to keep something server does. Where that extracted piece lives (next to `page.tsx` in `app/`, or in `features/<name>/components/`) depends on whether it knows about a business entity — see Layering, Assembly & Styling Rules → "Pages are orchestrators" for the placement rule. The same server/client reasoning is why a data-driven page keeps `page.tsx` server and extracts its interactive part into a Client Component fed by props (see Fetching below).

### Fetching

- Fetching is independent of whether a page ends up needing a client piece. It always happens in a Server Component — `page.tsx` itself, or a nested `async` Server Component further down — via a direct `await`, regardless of what's client above or below it.
- `useEffect` is never the mechanism for a page's or a section's initial data load, in either data-fetching pattern:
  - **Server Actions pattern (the default — see Data Layer → Pattern Selection):** `await` the Server Action directly in the Server Component.
  - **API Routes + TanStack Query pattern:** `useQuery` is the fetching mechanism (see Data Layer → API Routes + TanStack Query Pattern), never a raw `useEffect` + `fetch`.
  - Reserve `useEffect` itself for genuinely client-only concerns unrelated to initial data — subscriptions, browser APIs, syncing with something outside React's data flow.

### Loading States

- No fetch on a page → no `loading.tsx`, no `<Suspense>` — there's nothing to gate.
- **A page's content isn't one monolithic loading unit.** A page can contain multiple independent data-dependent regions — each wrapped in its own `<Suspense>` around its own `async` Server Component — so they load and stream in parallel, each showing (or skipping) its own loading state, instead of one boundary gating the whole page.
- Pick the mechanism by what else is on the page:
  - Nothing else worth showing before the fetch resolves (the page's entire content is the data-dependent part) → `loading.tsx` at that route segment. Next wraps the segment in Suspense automatically — the parent layout (sidebar, etc.) renders immediately, the page's own content shows the fallback as one unit, with no manual Suspense boundary and no manual `isLoading` state.
  - A genuinely independent static/instant part exists alongside a slower region (e.g. a header that renders instantly next to a data table that doesn't) → an explicit `<Suspense>` around just that region's `async` Server Component instead of — or in addition to — `loading.tsx`, since `loading.tsx` would blank the whole page's content, static parts included.
- Whether to physically split a region into its own file/component still follows ordinary Component Architecture rules (reuse, render-isolation, a real need) — a fetch existing somewhere on the page is not itself a reason to fragment it into wrapper components. A single file with a single `loading.tsx` remains the right, simpler choice whenever the page has no genuinely independent regions worth streaming separately.
- A loading state scoped to part of an *already-client* component's JSX (e.g. gating just a table's rows behind a client-side `isLoading` prop/state) stays an ordinary inline conditional — no new file, no Suspense boundary, since there's no server/client seam or streaming involved.

### Components

- **Push `'use client'` down to the smallest subtree that actually needs it.** If only one piece of a component needs a client-only hook (`usePathname()`, `useState`), an event handler, or a browser API, extract just that piece into its own Client Component rather than marking the whole parent `'use client'`. Example: `shared/ui/sidebar.tsx` renders a list of nav links; only the active-link highlight needs `usePathname()` — extract a `NavItem` Client Component for that, instead of making all of `Sidebar` client. At the moment of that split, both files move into `shared/ui/sidebar/` (`shared/ui/sidebar/sidebar.tsx` + `shared/ui/sidebar/nav-item.tsx`) — see Component Architecture → Flat Files.
- This doesn't automatically make the parent a Server Component — if the parent has its own independent reason to be client (its own state, its own handlers), it stays client regardless of what's extracted from it. The extraction is still worth doing on its own merits (see Component Architecture → Don't Split Into Subcomponents Unless Actually Reused for the render-isolation reason).

---

## RESTful API Architecture (`src/app/api/`)

### Resource Structure

```text
app/api/
└── <resource_name>/
    ├── route.ts        # Collection-level: GET (list), POST (create)
    └── [id]/
        └── route.ts    # Single resource: GET, PATCH, PUT, DELETE
```

### Design Principles

- Organize endpoints by business domain, not by HTTP method.
- Group all handlers for one endpoint inside a single `route.ts`.
- Follow standard REST semantics wherever practical.
- Resource names are project-specific — replace with the actual entity names.

_(Endpoint security — Zod validation, auth checks, authorization — applies to any Route Handler anywhere in `src/app/`, not only REST resources under `src/app/api/`, so it's documented pattern/location-agnostically in Data Layer → Shared Standards → Endpoint Security & Route Protection. The full API-route pipeline specifically — Zod validation, delegation to the service layer, status codes, response shape — is standardized in Data Layer → API Routes + TanStack Query Pattern.)_

---

## Component Architecture

All basic UI elements (inputs, buttons, dialogs, dropdowns, forms, badges, etc.) must be built on `shadcn/ui`. Never use native HTML controls (`<input>`, `<button>`, `<select>`) or custom elements when a `shadcn/ui` equivalent exists. Search component analogs at https://ui.shadcn.com/docs/components.

Only primitives (buttons, fields, and similar controls) are used as building blocks — layout/container primitives like `VStack`/`HStack` or using `Card` as a layout shortcut are deliberately excluded because they rigidly constrain design. Layout is always plain `<div>`/`<section>` + Tailwind.

### Two Levels: `shared/ui/` and `features/<name>/components/`

```text
shared/
  ui/
    primitives/              # Raw shadcn components, generated by the CLI, unmodified
      button.tsx
      input.tsx
      dialog.tsx
      avatar.tsx
    avatar.tsx                 # Agnostic wrapper: default styling/fallback over primitives/avatar
    confirm-dialog.tsx         # Agnostic wrapper: Dialog + preset props
    data-table.tsx             # Agnostic wrapper: composition of several primitives

features/
  <name>/
    components/
      user-card.tsx            # Knows about this feature's entities
      user-avatar.tsx          # Wraps shared/ui's Avatar with this feature's User type
```

1. **`shared/ui/primitives/`** — vendor code from the shadcn CLI (`npx shadcn add button`). Touch it carefully: re-running the CLI to add/update a component can overwrite hand edits. Point the CLI's output alias here in `components.json`:
   ```json
   { "aliases": { "components": "@/shared/ui/primitives", "utils": "@/shared/lib/utils" } }
   ```
2. **`shared/ui/` (above `primitives/`)** — the actual design layer: combines multiple primitives, sets default props/styles/behavior. Still knows nothing about any business entity (`ConfirmDialog`, `DataTable`, `Avatar`). Usable from anywhere in the app.
3. **`features/<name>/components/`** — components that know about this feature's entities (`UserCard`, `UserAvatar`). Consumed from that feature's own pages/components, or exported through the feature's `index.ts` for a second feature to use (see Directory Structure → Cross-Feature Reuse).

### The Agnosticism Test

The criterion for `shared/ui/` vs. `features/<name>/components/` is never "used in multiple places" — it's **"does this component know about a specific business entity."**

| | Knows about an entity | Doesn't know about an entity |
| --- | --- | --- |
| Used in 1 place | `features/<name>/components/` | `shared/ui/` (only if it's a genuinely universal pattern) |
| Used in N places | Stays with the owning feature, exported via `index.ts` | `shared/ui/` |

A common mistake is moving something into `shared/` only because it's needed in several places. A `UserAvatar` bound to the `User` type stays in `features/user/components/` even if it's used in five places. Only a genuinely agnostic `Avatar` (just `src` + `fallback`, no knowledge of `User`) belongs in `shared/ui/`:

```tsx
// shared/ui/avatar.tsx — agnostic
export function Avatar({ src, fallback }: { src?: string; fallback: string }) { ... }

// features/user/components/user-avatar.tsx — knows about User, uses Avatar
import { Avatar } from '@/shared/ui/avatar';
export function UserAvatar({ user }: { user: User }) {
  return <Avatar src={user.avatarUrl} fallback={user.name} />;
}
```

The test applies at every level, including wrappers over wrappers: `ConfirmDialog` stays in `shared/ui/` as long as it knows nothing about any entity. The moment it starts knowing about the domain (e.g. hardcoded copy like "Delete user") it moves to `features/<name>/components/`, even though it's technically "a wrapper over a wrapper":

```tsx
// features/user/components/delete-user-dialog.tsx — knows about User, not shared
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

export function DeleteUserDialog({ user, onDelete }: { user: User; onDelete: () => void }) {
  return <ConfirmDialog title={`Delete user ${user.name}?`} onConfirm={onDelete} />;
}
```

### App Chrome (Header, Sidebar, Footer, AppShell)

App chrome doesn't fit either bucket cleanly on its own — it's mounted exactly once (from a `layout.tsx`), but can still need live domain data (e.g. a sidebar listing the user's flows). Apply the Agnosticism Test one level up, by splitting the chrome itself instead of forcing the whole thing into one bucket:

- The structural shell — nav frame, collapse behavior, styling, no entity knowledge — is a `shared/ui/` component (e.g. `shared/ui/sidebar.tsx`), exactly like any other agnostic wrapper.
- Any piece that needs live domain data (a nav item showing the user's flows) is a `features/<name>/components/` component, imported into the shell where the two are composed.
- That composition happens directly inside `layout.tsx` — never inside `page.tsx` — and chrome is never imported from a page (see Layering, Assembly & Styling Rules → "Chrome stays in chrome").

### Flat Files — A Folder Appears Only Once a Component Has Genuinely Split

- **Default: one file per component**, directly inside `shared/ui/` or the owning feature's `components/`. `shared/ui/data-table.tsx`; `features/dashboard/components/filter-bar.tsx`. `primitives/` is never split this way — it's managed entirely by the shadcn CLI.
- **Never group by type.** No `buttons/`, `fields/`, `charts/` subfolders inside `shared/ui/` — a single `Alert` component doesn't need an `alerts/` folder just because "alert" sounds like a category to some.
- **A component gets its own folder at the exact moment it splits into 2+ files that ship together — never before, never speculatively.** The trigger is a real split, for any of the reasons already documented elsewhere in this file: reuse on the second occurrence, render-cost isolation, or the server/client boundary (see Don't Split Into Subcomponents Unless Actually Reused below, and Server & Client Components → Components).
  - Concretely: `shared/ui/sidebar.tsx` stays a single flat file until you extract `NavItem` out of it (e.g. for the client-boundary reason). At that exact point — and not a moment before — both files move together into `shared/ui/sidebar/`: `shared/ui/sidebar/sidebar.tsx` + `shared/ui/sidebar/nav-item.tsx`.
  - Before that second file exists, giving `sidebar.tsx` a folder of its own is exactly the premature structuring this rule forbids — it stays flat as `shared/ui/sidebar.tsx`.

### Don't Split Into Subcomponents Unless Actually Reused

- Default to one file per component, not a component tree. `Sidebar` holds its logo, nav list, and footer inline in one file — do not pre-emptively extract `sidebar-logo.tsx`, `nav-links.tsx`, `sidebar-footer.tsx`, etc. unless those pieces are actually rendered from more than one place.
- **Split on the second occurrence, never the first.** When building a component for the first time, write it as one file even if a piece of it looks reusable in principle. Extract a shared subcomponent only once you're implementing a second place that genuinely needs the same markup/logic, then reuse it in both. Splitting speculatively "just in case" is forbidden — over-fragmenting into files nothing ever imports twice is exactly what this rule prevents.
- Judge reuse the way it actually plays out in a SaaS product, not hypothetically: a `NavItem` may genuinely deserve extraction if the same links render in both a sidebar and a command palette or mobile drawer — extract it once that second usage exists, not in anticipation of it. A `Sidebar`, `Header`, `Footer`, or `AppShell` itself is normally mounted exactly once in the whole app (from the root/section `layout.tsx`) — it does not get split into subcomponents just because it has multiple visual sections.
- **Reuse isn't the only valid reason to extract on the first occurrence.** Two other reasons stand on their own, independent of reuse:
  - **Render-cost isolation:** if a piece has its own local, high-frequency state (hover, a local open/close toggle) and the parent is non-trivial (maps a sizeable list, renders an expensive tree), extract that piece so its state changes don't re-render the whole parent. Skip this for small parents — the cost of re-rendering a handful of children isn't worth a new file, and reaching for this on every `useState` is exactly the kind of speculative splitting this section otherwise forbids.
  - **Server/client boundary:** see Server & Client Components → Components.
- **Mixed responsibilities are a reason to split; size by itself isn't.** Split a component when it's doing two or more independent things (e.g. filtering logic + state management + list rendering + animation, all in one file). A file's length (300-400+ lines), difficulty locating code in it, or an oversized prop list (7-8+ props) aren't reasons on their own — they're symptoms that usually mean responsibilities have already mixed together, worth checking for exactly that before deciding whether or how to split.

### Layering, Assembly & Styling Rules

- **Directional imports:** hierarchy is `features/<name>/components/` → `shared/ui/` (above `primitives/`) → `shared/ui/primitives/`. A higher layer may import a lower one; a lower layer must never import a higher one. Two feature folders never import each other's `components/` directly — only through the owning feature's `index.ts` (see Directory Structure → Cross-Feature Reuse).
- **Check before creating:** before adding any new component in `shared/ui/` or a feature's `components/`, check whether one already exists and reuse/extend it instead of duplicating.
- **Check the full shadcn registry, not just the handful already installed:** before hand-writing any markup/logic inside a `shared/ui/` component (error text, label wiring, prefix/suffix icons, show/hide toggles, etc.), check whether shadcn already ships a purpose-built primitive for it — run `npx shadcn@latest view <name>` or browse https://ui.shadcn.com/docs/components. The registry has ~65 components, most not yet pulled into this project (e.g. `field`/`field-label`/`field-error` for form-field composition, `input-group` for prefixed/suffixed inputs, `input-otp`, `combobox`) — don't assume the primitives already in `shared/ui/primitives/` are the only ones available. A missed match means reinventing accessibility/state wiring (ARIA attributes, invalid/disabled propagation, error-list de-duplication, etc.) that's already solved upstream.
- **Never consume shadcn primitives raw:** each primitive (or small related group) must be wrapped in a dedicated `shared/ui/` component owning its domain-agnostic logic, labels, state, and error handling (e.g. `primitives/field.tsx` (`Field`/`FieldLabel`/`FieldError`) + `primitives/input-group.tsx` (`InputGroup`/`InputGroupInput`) → `shared/ui/text-field.tsx`; the app uses `TextField`, never the raw parts).
- **Text-style field elements are built on `InputGroup`:** any `shared/ui/` component wrapping a text-style input (`text-field.tsx` and friends) uses `InputGroup` + `InputGroupInput`, never the bare `primitives/input.tsx` directly — even when no affix is needed yet. Expose optional `prefix`/`suffix` props (rendered via `InputGroupAddon`) so icons, currency symbols, unit labels, or show/hide-password toggles can be added later through props alone, with no restructuring of the component or its call sites.
- **Split components by mechanism, not by label:** if two variants share the same underlying interaction mechanism and differ only in prop values (type, placeholder, validation, copy), they are one component configured via props — not separate files. A single `TextField` covers email, password, and any other text-style input; don't create `PasswordField`, `EmailField`, etc. as separate components. Split into genuinely separate components only when the underlying mechanism differs (e.g. a text field vs. a select/dropdown vs. a drag-and-drop dropzone) — those don't share internals and forcing them into one component would just be a conditional maze.
- **Name the discriminator, don't split on it:** any `shared/ui/` component with more than one semantic variant of the same mechanism exposes a single explicit discriminator prop — `variant` by default; reuse a more specific name only where it already carries that meaning in the DOM (e.g. input `type` for email/password/text). Define the prop even when only one call site exists today. Before creating a new component for what looks like a new case, check whether an existing component's discriminator prop can just take a new value instead.
- **Pages are orchestrators:** `page.tsx` assembles only `shared/ui/` components and feature `components/` (imported via the owning feature's public API) — never raw HTML controls, raw shadcn primitives, or app-chrome components directly (chrome is composed exclusively in `layout.tsx` — see App Chrome above, and "Chrome stays in chrome" below). If a combination of `shared/ui/` components is used on one page only, assemble it inline in a plain `div`; extract it into the feature's `components/` only once the same combination is actually duplicated across a second page within that feature (see Don't Split Into Subcomponents Unless Actually Reused above).
  - This reuse gate is specifically about compound UI assembled from `shared/ui/` pieces. It does not apply to a piece extracted purely for the server/client boundary or render-isolation (see Server & Client Components → Components) — that kind of split colocates with its parent immediately, even on the first occurrence, **but only when the extracted piece is itself domain-agnostic** (see Component Architecture → The Agnosticism Test). An agnostic client-only piece sits next to `page.tsx` in the same `app/` route folder, not in `features/<name>/components/`, until it's genuinely needed on a second page. The moment the extracted piece knows about a specific business entity (calls a feature's schema/action, renders a feature's type — e.g. a login/register form built on the `auth` feature's schema and Server Actions), the Agnosticism Test overrides this gate: it goes straight into `features/<name>/components/` even on the very first occurrence, exactly like any other entity-aware component — this is why `login-form.tsx`/`register-form.tsx` live in `features/auth/components/`, not next to `app/login/page.tsx`/`app/register/page.tsx`.
- **Chrome stays in chrome:** `Header`, `Sidebar`, `Footer`, `AppShell`, and other app-chrome are composed only inside `layout.tsx` (see App Chrome above) — never imported directly into a feature page.
- **No abstract layout primitives:** don't introduce `VStack`/`HStack`-style wrappers, and don't use shadcn's `Card` as a page-layout shortcut. Build page/section layout with plain `<div>`/`<section>` styled via Tailwind utilities (`flex`, `grid`, `gap-*`, `space-*`), placing your own `shared/ui`/feature components inside.

---

## Data Layer

### Pattern Selection

Pick **exactly one** pattern for the entire application. Server Actions and API Routes/TanStack Query must never be mixed for standard internal CRUD.

**Default — Server Actions:**

- Use for all data fetching, mutations, and form handling by default.
- Applies whenever the user has **not** explicitly requested API routes, TanStack Query, or mobile-app compatibility requiring a shared backend.
- Action functions live in each feature's `actions/` and stay thin: each one is built with `createSafeAction`, which owns Zod validation and the `getUser()` auth check (see Data Layer → Server Actions Pattern). Business logic and DB/Supabase calls live in the matching `services/` function within the same feature, never inline in the action.

**Alternative — API Routes + TanStack Query:**

- Use **only** when explicitly requested: REST endpoints, TanStack Query, or future mobile-app support needing a shared backend API.
- Server-side business logic and DB calls (what API routes delegate to) live in each feature's `services/`. No `actions/` folder exists in this pattern.

**Strict rules:**

- **No hybrid usage:** stick to the selected pattern across every feature.
- **Single source of truth for business logic:** a feature's `services/` is where its business logic and DB/Supabase calls live, in either pattern — never in `actions/` or `route.ts`. Server Actions → client calls flow `features/<name>/actions/` (thin, `createSafeAction`-wrapped) → `features/<name>/services/`. API Routes → client requests flow `app/api/` (thin `route.ts`) → `features/<name>/services/`, orchestrated by TanStack Query on the client.

_(Full pipeline details for each pattern are below, in Server Actions Pattern and API Routes + TanStack Query Pattern.)_

### Shared Standards (both patterns)

These rules apply regardless of which pattern was selected above.

**Environment & client setup:**

- All code in a feature's `services/`, and in its `actions/` when it exists (Server Actions pattern — see Pattern Selection), runs strictly on the server.
- Every file in a feature's `actions/` must start with the `'use server'` directive.
- `src/shared/lib/` (e.g. `shared/lib/supabase/`, `shared/lib/utils.ts`) contains **only** low-level infra: SDK initializers (`createClient()`) and static helpers. Never put DB queries, Supabase domain requests, or domain-specific auth/business logic in `shared/lib/` — those belong in a feature's `services/` or `actions/`.
- **One named exception:** `createSafeAction` (`src/shared/lib/create-safe-action.ts`, see Data Layer → Server Actions Pattern) calls `getUser()` internally. It's allowed in `shared/lib/` specifically because it's cross-cutting infrastructure shared by every feature's actions, not domain logic — it doesn't query any domain table itself, it only gates access to `handler` before delegating to the calling feature's `services/`. This is the sole permitted auth call in `shared/lib/`; no other `shared/lib/` file may call `getUser()`/`getSession()`.

**Standardized response format:**

- Services/actions never throw unhandled errors — always return a result object.
- One generic result type per pattern, defined once and reused everywhere. Never write the response shape as an inline object-literal return type (e.g. `Promise<{ error: string | null }>` is forbidden) — always name it via the shared type below. This type is genuinely cross-cutting (used by every feature), so it lives in `src/shared/types/`, not inside any one feature — create it there first if it doesn't exist yet (new project, or first action/service ever written); an empty/missing `shared/types/` file is never a reason to fall back to an inline literal.
  - Server Actions pattern → `src/shared/types/action-response.ts`:
    ```ts
    export type ActionResponse<T = void> = T extends void
      ? { error: string | null }
      : { data: T | null; error: string | null };
    ```
  - API Routes pattern → `src/shared/types/service-response.ts`:
    ```ts
    export type ServiceResponse<T = void> = T extends void
      ? { error: string | null }
      : { data: T | null; error: string | null };
    ```
- No `T` (defaults to `void`) → `{ error: string | null }` — this is the "simple action" shape (login, logout, register, etc.). Pass `T` (e.g. `ActionResponse<DashboardStats>`) → `{ data: T | null, error: string | null }` — this is the "data-returning" shape.
- This `{ data, error }` shape is preserved end-to-end, from the database up to the UI (and across API responses in the API-routes pattern).
- Never return raw primitives or bare nullable types from actions/services (e.g. `Promise<string | null>`, `Promise<boolean>`) — always wrap in `ActionResponse<T>` (Server Actions pattern) or `ServiceResponse<T>` (API Routes pattern), never both in the same project.

**Authentication & authorization:**

- Every protected service/action is only reached after the user's identity has been confirmed via the reusable `getUser()` helper, which returns early on failure:

```ts
const { data: user, error: userError } = await getUser();
if (userError || !user)
  return { data: null, error: userError || 'Unauthorized' };
```

  - **Server Actions pattern:** this call happens once, generically, inside `createSafeAction` (see Data Layer → Server Actions Pattern) — individual actions and services never call `getUser()` themselves.
  - **API Routes pattern:** each route handler still calls it directly, per Endpoint Security & Route Protection below.
- Never trust a `user_id` passed from the client — always override it with the authenticated `user.id` from the session.
- Always chain `.eq('user_id', user.id)` on queries to enforce tenant/ownership isolation.
- **Extract repeated ownership-check boilerplate — split on the second occurrence, never the first** (same rule as Component Architecture → Don't Split Into Subcomponents Unless Actually Reused). Ownership checks (e.g. "does this flow belong to this user") are resource-specific and live in the owning feature's `services/`, not in `createSafeAction` — validation and identity are already handled generically before a service ever runs. Write the first service's ownership-check sequence inline. Once a second service in the same feature's `services/` file needs the identical sequence, extract a shared private helper (not exported, not itself an action or route handler) that returns the authenticated context instead of copy-pasting the block again. Shape the helper's return like the existing `{ data, error }` convention — e.g. `{ context: { supabase, user, input }, error }` — so callers narrow it with the same `if (error || !context)` idiom already used for `getUser()`, no manual `!` assertions needed.

**Endpoint Security & Route Protection (any Route Handler, anywhere in `src/app/`):**

- **Public endpoints** (auth handlers, public webhooks, a redirect route, etc.): must strictly validate incoming payloads with Zod.
- **Protected endpoints:** must verify user identity server-side before executing business logic, and strictly validate payloads with Zod.
- Every protected route handler verifies the user via the Supabase server client using `getUser()` — **never** `getSession()`. If no user is returned, abort immediately with `401 Unauthorized`:

```ts
const supabase = await createClient();
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

- **Authorization vs. authentication:** authentication verifies _who_ the user is; authorization verifies _what_ they can access. Always confirm the authenticated `user.id` owns the requested resource (or holds the required role) before any mutation (`POST`/`PATCH`/`DELETE`) or read (`GET`).

**Public & unauthenticated data access:**

- Any route reachable by an unauthenticated visitor (a public Route Handler, a redirect route, a webhook) must never query internal or user-owned tables directly via `.select()`/`.insert()`/etc. This applies whenever such a route exists in the app, regardless of which data-fetching pattern (Server Actions or API Routes) is selected for the rest of it — it's not scoped to either pattern.
- Instead, expose a narrow Postgres function (`security definer`) and call it via `supabase.rpc('function_name', { params })`. The function's own SQL is the sole author of what gets read or written — it enforces the boundary at the database level, so the caller can never widen the request, unlike a direct query where a loosened RLS policy or a client-crafted `.select()` could leak more than intended.
- Revoke `execute` on that function from any role that doesn't need it (e.g. `authenticated`, if only anonymous requests ever call it) — the function's grants are as much a part of the access boundary as its SQL body.
- This is separate from the already-authenticated case above: protected actions/services still just use `.eq('user_id', user.id)` + RLS. RPC is specifically for callers with no identity to filter by at all.

**Typing:**

- Arguments and return values are strongly typed end-to-end using domain interfaces from the owning feature's `types/` (or `src/shared/types/` for genuinely cross-cutting types), from DB model to UI (see Types & Zod Schemas for type-naming standards).

**Validation & error handling:**

- Zod validation is always required before any business logic or DB query runs — _where_ it happens differs by pattern (see below).
- Every catch block returns the same shape:

```ts
catch (error) {
  return { data: null, error: error instanceof Error ? error.message : 'Unknown server error' };
}
```

- **`'Unknown server error'` is the catch-all's last resort, never a first-class return value.** Use it only when the thrown value isn't an `Error` (or carries no usable message). Everywhere else — Supabase/Postgres errors, explicit early returns — surface the real message (`nodeError?.message`, `flowError?.message`, etc.) instead of writing a generic string by hand. A vague error is undebuggable for both the developer and (see Error Handling & Display) the support path back to the user.

### Server Actions Pattern

_Applies only when the Server Actions pattern is selected._

**Pipeline:**

```
Client Component (Form / useActionState / useTransition)
  └──> Server Action (features/<name>/actions/) — thin, built with createSafeAction
       └──> createSafeAction: Zod validation, then the getUser() auth check
            └──> Service Layer (features/<name>/services/)
                 └──> Server-side business logic, ownership checks & DB / Supabase
                      └──> Returns { data, error } directly to the client
```

**`createSafeAction`:** a single shared higher-order function, defined once in `src/shared/lib/create-safe-action.ts` (see Data Layer → Environment & Client Setup for why this is the one `shared/lib/` file allowed to call `getUser()`), that every feature's actions are built from — it's cross-cutting infrastructure, so it lives in `shared/`, never duplicated per feature:

```ts
function createSafeAction<TSchema extends z.ZodType, TOutput>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>, user: User) => Promise<ActionResponse<TOutput>>,
): (values: z.input<TSchema>) => Promise<ActionResponse<TOutput>>
```

- Runs `schema.safeParse(values)` first; on failure, returns `{ data: null, error: <first issue message> }` without calling `handler`.
- Then runs `getUser()`; on failure, returns `{ data: null, error: userError || 'Unauthorized' }` without calling `handler`.
- Only once both pass does it call `handler(parsedInput, user)` and return its result directly — `handler` is where each action delegates to its own feature's matching `services/` function.

**Key rules:**

- An action file only calls `createSafeAction(schema, handler)`, where `handler` is a thin delegation to the matching function in the same feature's `services/` — no Zod parsing, no `getUser()` call, no Supabase query, and no business logic directly inside `actions/` (see Code Style → Function Syntax for the resulting `export const` shape).
- `services/` — not `actions/` — is where the `try / catch` (see Shared Standards → Validation & Error Handling), ownership checks, and DB/Supabase calls live, mirroring how the API Routes pattern's `route.ts` delegates to `services/`.
- Every `services/` function still returns `Promise<ActionResponse<T>>`, matching `handler`'s return type in `createSafeAction`'s signature above — the `{ data, error }` shape is unchanged end-to-end.
- An action is exported through its feature's `index.ts` only if a second feature genuinely needs to call it directly (rare — most actions are only ever invoked from that feature's own client components); see Directory Structure → Cross-Feature Reuse.

### API Routes + TanStack Query Pattern

_Applies only when this pattern is selected._

**Pipeline:**

```
Client Component (TanStack Query)
  └──> HTTP request (GET/POST/PATCH/DELETE)
       └──> API Route Handler (src/app/api/) — stays in app/, like page.tsx/layout.tsx (Next.js routing constraint)
            └──> Zod validation, inside the route handler
                 └──> Service Layer (features/<name>/services/)
                      └──> Database / Supabase
                           └──> Returns { data, error } back up the chain
```

`route.ts` cannot move into `features/<name>/` — Next.js requires route handlers to live under `app/api/`, the same reason `page.tsx`/`layout.tsx` stay in `app/` (see Directory Structure → App Router Layout). It imports the feature's service the same way `page.tsx` imports a feature's components: through that feature's public API (`features/<name>/index.ts`), unless the service was written to be internal-only.

**Route handlers (`route.ts`):** thin HTTP adapters only — no DB calls, no business logic. Responsibilities:

1. Parse and validate the request via Zod `.safeParse()`.
2. Delegate execution to the matching feature's `services/` function.
3. Map the result to `NextResponse.json` with the right status code.

On validation failure, return 400 with the first issue message:

```ts
const errorMessage = parsed.error.issues[0]?.message || 'Validation error';
return NextResponse.json({ data: null, error: errorMessage }, { status: 400 });
```

Business logic and `try / catch` blocks live in the service function, not the route.

**Status codes:**

- `200 OK` — successful `GET` or non-creation action (login, logout, etc.)
- `201 Created` — successful `POST` (resource creation)
- `400 Bad Request` — validation failure, invalid JSON, or business error
- `401 Unauthorized` — service error message is exactly `'Unauthorized'`

Data endpoints respond `{ data, error }`; simple action endpoints (e.g. auth) respond `{ error }`.

**Client data fetching (TanStack Query):**

- `useQuery` for reads (`GET`) only; `useMutation` for creates/updates/deletes (`POST`/`PUT`/`DELETE`).
- Inside `queryFn`/`mutationFn`, check `response.ok`; if false, parse the JSON error and throw:

```ts
if (!response.ok) throw new Error(error || 'Default fallback message');
```

- Query keys are hierarchical arrays: `queryKey: ['resource-domain', dynamicParam]` (e.g. `['dashboard-stats', period]`).
- On successful mutations, invalidate affected keys in `onSuccess`: `queryClient.invalidateQueries({ queryKey: [...] })`.

---

## Error Handling & Display

The `error` string inside `ActionResponse`/`ServiceResponse` always carries the real, descriptive message (see Data Layer → Validation & Error Handling). What the client does with that string depends on who the error belongs to:

- **User-actionable errors** — the user's own input is what's wrong (failed field validation, a value that conflicts with something, a business rule like "This node is already connected to a destination"). Show the real message inline at the point of failure — under the relevant field via the element's own error state (see Component Architecture → Two Levels), or as the form's top-level error. The user needs this text to fix what they did.
- **System-level errors** — the failure is ours, not the user's (an unhandled exception, a Supabase/DB call that failed, a network error, anything landing in the generic catch-all). Never render this raw string to the user. Show a short, generic, human-readable message instead (e.g. "Something went wrong. Please try again.") and log the real error via `console.error` (or `console.warn` for non-fatal/degraded cases) so it's visible in devtools. The user is never responsible for reading a stack trace or a backend error string.
- When it's ambiguous which bucket an error falls into, default to treating it as system-level: generic message to the user, real message to the console.

---

## Types & Zod Schemas

### Type Inference from Zod

- Never manually duplicate a TypeScript `type`/`interface` alongside a Zod schema for form inputs, API payloads, or request params.
- **Merge duplicate schemas, don't duplicate rules:** when two schemas describe the same shape with identical validation rules, define one shared schema (and reuse its inferred type) instead of repeating the same `z.object` fields in two files. Keep them separate when the actions are semantically distinct and likely to diverge — e.g. a login schema typically only requires a password to be present (the real check happens server-side), while a registration schema enforces a minimum-length/strength policy; forcing those into one shared schema would make future tightening of one flow silently affect the other.
- Derive types directly with `z.infer<typeof schema>`:

```ts
export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type AuthInput = z.infer<typeof authSchema>;
```

### Domain Types vs. Built-in Auth Types

- Use standard SDK types for built-in Supabase systems (e.g. import `User` directly from `@supabase/supabase-js`).
- For custom application tables, don't rely on auto-generated database types — handcraft clean, dedicated interfaces inside the owning feature's `types/` (e.g. `features/links/types/links.types.ts`).

### Interface vs. Type

- Prefer `interface` over `type`. Use `type` only when an interface can't express it (union types, primitive aliases, utility mapping) or it meaningfully reduces boilerplate.

### Naming Standards

- **No Hungarian notation / generic suffixes:** never prefix with `I` (`IUser`) or suffix with `Interface`/`Type` (`UserInterface`, `UserType`). Use clean singular nouns (`User`, `Project`, `Invoice`).
- **No raw primitive returns:** Server Actions and service functions must not return raw primitives/nullables directly — always wrap in `Promise<ActionResponse<T>>` or `Promise<ServiceResponse<T>>`, whichever matches the selected pattern (see Data Layer → Standardized Response Format).
- **Contextual suffixes** for non-entity interfaces:
  - Component props: `<Name>Props` (`UserCardProps`, `SidebarProps`)
  - Forms/inputs: `<Name>FormValues` or `<Action><Entity>Input` (`CreateProjectInput`, `UserFormValues`)
  - API payloads/responses: `<Action><Entity>Payload` / `<Action><Entity>Response` (`UpdateUserPayload`, `FetchProjectsResponse`)
- **The extracted `<Name>Props` interface is for components only.** It exists because components (`shared/ui/` and each feature's `components/`) tend to accumulate many, often reused, props. `app/**/page.tsx` and `app/**/layout.tsx` don't get this treatment — their prop shape is small and fixed (`children`, route `params`, `searchParams`), so type it inline instead of naming a one-off interface: `export default function DashboardLayout({ children }: { children: React.ReactNode })`, not a separate `DashboardLayoutProps` declared above it.

---

## Code Style: Functions & Variable Naming

### Function Syntax

- **Components:** standard function declarations (`function ComponentName() {...}`).
- **Top-level exported functions** — services (`features/<name>/services/`), hooks (`features/<name>/hooks/`, `shared/hooks/`), and `shared/lib/`/`features/<name>/lib/` helpers — standard function declarations (`export async function loginUser() {...}`, `export function useAuth() {...}`, `export function formatDate() {...}`). Never `export const x = () => {...}` for these.
- **A feature's `actions/` is the one exception:** an exported action is the return value of `createSafeAction(schema, handler)` (see Data Layer → Server Actions Pattern), so it's necessarily declared as `export const addInputNode = createSafeAction(addInputNodeSchema, async (input, user) => {...})`, not a `function` declaration. `createSafeAction` itself, in `shared/lib/create-safe-action.ts`, is a `shared/lib/` helper, so it follows that row's rule and stays a standard function declaration.
- **Internal logic/handlers:** arrow functions for helpers, event handlers, callbacks defined _inside_ a component (`const handleClick = () => {...}`). Arrow functions are for this case only — not for standalone top-level functions.

### Variable Naming

- **Descriptive & self-explanatory:** e.g. `isUserAuthenticated` not `auth`, `activeProjectList` not `data`.
- **Booleans:** prefix with `is`, `has`, `should`, `can` (`isLoading`, `hasPermission`, `shouldRedirect`, `canEdit`).
- **Event handlers:** `handle` prefix internally, `on` prefix for props (prop: `onSave`, handler: `handleSave`).
- **No abbreviations:** spell names out fully (`userIndex` not `idx`, `request`/`response` not `req`/`res`, `element` not `el`, `button` not `btn`).

---

## Forms (React Hook Form + Zod)

- All forms must be managed with `react-hook-form` paired with Zod validation. Manual field state via `useState` is strictly prohibited.
- Never extract or keep `<Controller>` logic outside the input component or in parent wrappers — every custom input/select/checkbox/field component encapsulates its own `Controller` internally. Parent forms only pass `control`, `name`, and field-specific props down.

---

## Security & Environment Variables

### Secrets Management

- All API keys, connection strings, and service secrets live strictly in `.env.local`.
- `.env.local` must be declared in `.gitignore`.
- Never hardcode secrets, service roles, or API credentials in source code.

### Strict Server-Side Supabase Execution

- All Supabase interactions execute strictly on the server (server actions or service functions).
- Creating or using a browser/client-side Supabase instance (`createBrowserClient`, exposing the SDK to client components) is strictly forbidden.

---

## UI Copy Guidelines

### Language & Tone

- All interface text (labels, buttons, titles, messages) is in English. No localization/i18n at this stage.
- No generic onboarding greetings ("Welcome to platform...", "Hello user").
- Copy is rational, clear, concise, and undecorated.

### Headlines & Subtitles

- **Titles:** short enough for one line; never end with a period; no punctuation inside (`-`, `:`, `;`, `,`, `(`, `)`).
- **Subtitles:** a direct sentence continuation of the title; must end with a period.

### Controls & Labels

- Interactive controls (buttons, placeholders, field labels, nav) use Title Case with only the first letter capitalized (e.g. "New user").
- Never end control labels with a period.
- For creation actions, prefer "New [Entity]" over "Add new [Entity]" (e.g. "New location", "New user").

### Navigation & Menus

- Menu/navigation items are 1–3 words max; prefer single words ("Users", "Locations", "Dashboard").
