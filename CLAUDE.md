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

---

## Ticket Interpretation

- Tickets are written by someone who doesn't know this codebase's architecture — treat a ticket as a statement of the required **outcome** (what must be true, what the user must be able to do), not as a literal implementation spec. How that outcome is achieved is an engineering decision, made using this file and the existing codebase — not by transcribing the ticket's wording into code or prose one line at a time.
- **Check for existing functionality before implementing.** A described behavior may already fall out of the current architecture (an existing form's validation mode, a shared schema, a redirect already wired elsewhere). If it does, don't add redundant code, don't duplicate logic to "cover" it a second time, and don't write filler text declaring it done — just recognize it's already satisfied and move on.
- Acceptance criteria describe what must hold true when the ticket is finished, not a one-for-one checklist of separate features to build — one existing mechanism can already satisfy several stated criteria at once.

---

## Tech Stack & Documentation

The project relies strictly on the technologies below. Refer to the official docs for syntax, features, and best practices — do not rely on legacy memory.

| Technology      | Purpose                                           | Docs                                                            |
| --------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| React           | Core UI library                                   | https://react.dev/reference/react                               |
| Next.js         | Routing, rendering, server-side functionality     | https://nextjs.org/docs                                         |
| TypeScript      | Static typing across the app                      | https://www.typescriptlang.org/docs/                            |
| TanStack Query  | Client-side async state, fetching, caching        | https://tanstack.com/query/latest/docs/framework/react/overview |
| Tailwind CSS    | Utility-first styling                             | https://tailwindcss.com/docs                                    |
| shadcn/ui       | Accessible UI primitives                          | https://ui.shadcn.com/docs/installation                         |
| Zod             | Schema validation (API payloads, forms, env vars) | https://zod.dev/                                                |
| React Hook Form | Form state & input handling                       | https://react-hook-form.com/docs                                |
| Supabase        | Database, auth, storage (BaaS)                    | https://supabase.com/docs                                       |

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
    ├── <feature_name>/
    │   └── page.tsx # Another unprotected section.
    ├── <feature_name>/ # Protected application section.
    │   ├── layout.tsx # Section layout
    │   ├── page.tsx # Main page of the protected section.
    │   └── <feature_name>/ # Another protected application section
    │       └── page.tsx
    └── api/ # API route handlers
        └── <resource_name>/ # Entity collection endpoint (e.g., movies, users)
            ├── route.ts
            └── [id]/ # Dynamic entity endpoint (e.g., movies/[id])
                └── route.ts
```

Placeholders (not literal folder names) — replace with names appropriate to the project:

- `<feature_name>` → an application section (`dashboard`, `users`, `projects`, `settings`, `billing`, `insights`, `reports`)
- `<resource_name>` → an API resource (`users`, `projects`, `posts`, `orders`)
- `[id]` → a dynamic resource identifier

### Extended `src/` Structure

```text
src/
├── components/   # UI Components
├── types/        # TypeScript interface & type definitions
├── schemas/      # Zod validation schemas
├── lib/          # Third-party client setups (e.g., Supabase client), constants, and utils
├── hooks/        # Custom React hooks
├── providers/    # Global React context providers
└── actions/  OR  services/   # Mutually exclusive — see Data Layer → Pattern Selection
```

`actions/` and `services/` are never both present in the same project — the chosen data-fetching pattern determines which one exists.

| Folder       | Present when                    | Responsibility                                                                                                                                                                                                  |
| ------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types/`     | always                          | Shared TypeScript interfaces, types, and database models. Keep modular, grouped by domain (`user.ts`, `links.ts`).                                                                                              |
| `schemas/`   | always                          | All Zod validation schemas for forms and API payloads.                                                                                                                                                          |
| `lib/`       | always                          | Third-party library initialization only (e.g. Supabase client creation in `lib/supabase/`), shared helpers, and global constants. Never DB queries or auth logic — see Data Layer → Environment & Client Setup. |
| `hooks/`     | always                          | Reusable custom React hooks (`useDebounce`, `useMediaQuery`, etc.).                                                                                                                                             |
| `providers/` | always                          | One global provider per file — see Providers & Root Layout below.                                                                                                                                               |
| `actions/`   | **Server Actions pattern only** | The entire pipeline for a mutation lives in one file: Zod validation, business logic, and DB/Supabase calls, all inside each `'use server'` action. No separate service layer exists in this pattern.           |
| `services/`  | **API Routes pattern only**     | The only place business logic and DB/Supabase queries live in this pattern. Called exclusively by `route.ts` handlers, which stay thin.                                                                         |

### Providers & Root Layout

- `src/providers/` is for providers that own actual setup/config code (e.g. TanStack Query Provider instantiating a `QueryClient`, a Theme Provider managing theme state) — each one lives in its own file, starting with `'use client'`.
- **Always wrap a provider in its own file, even a zero-config one.** A third-party client primitive (e.g. a UI library's `TooltipProvider`) used with no extra options still gets its own file in `src/providers/` rather than being imported raw into `src/app/layout.tsx` — this keeps the pattern consistent everywhere, even when today's wrapper is a thin pass-through with no config of its own.
- **One provider per file, always.** Never stack multiple providers in a single file — a zero-config provider is not an exception; it still gets its own dedicated file, not folded into another provider's.
- Global providers are wired up **only** in the root layout (`src/app/layout.tsx`) — never in nested/section/feature layouts.
- `src/app/layout.tsx` must remain a Server Component; never convert it to a Client Component to render providers.
- **Every layout (root and nested/section) is a Server Component.** No `layout.tsx` at any level ever carries `'use client'`. Layouts exist to wrap pages and route groups with shared structure — any interactivity belongs in the pages or components they render, not in the layout itself.

### File & Code Naming Conventions

- **Core philosophy:** avoid micro-files. Group all closely related operations for a feature into one file by domain/module (e.g. `auth.ts` covers `login`, `logout`, `refreshToken`; `links.ts`, `links-analytics.ts`).
- **File naming:** kebab-case only, everywhere. Pattern: `domain.ts` or `domain-submodule.ts`.

| Location                                       | File naming                                       | Symbol naming                                     | Example                                                                     |
| ---------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| `types/`                                       | kebab-case (`links.ts`, `auth-credentials.ts`)    | PascalCase types/interfaces                       | `export type DashboardStats = {...}`, `export interface UserProfile {...}`  |
| `services/` or `actions/` (mutually exclusive) | kebab-case (`auth.ts`, `links-management.ts`)     | camelCase functions                               | `export async function loginUser() {...}`                                   |
| `schemas/`                                     | kebab-case (`auth.ts`, `links.ts`)                | camelCase, suffixed `Schema`                      | `export const loginSchema = z.object({...})`                                |
| `lib/` / constants                             | kebab-case (`auth-constants.ts`, `api-routes.ts`) | UPPER_SNAKE_CASE (constants); camelCase functions | `export const MAX_RETRY_ATTEMPTS = 3;`, `export function maskEmail() {...}` |
| `hooks/`                                       | kebab-case, `use-` prefix (`use-auth.ts`)         | camelCase, `use` prefix                           | `export function useAuth() {...}`                                           |

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

### Pages

- Pages are Server Components by default. Only add `'use client'` to a page when one of the justifications below actually applies — default to server otherwise.
- **Keep a page server when:** it needs `generateMetadata` for SEO or social-preview cards; it reads data directly from the DB, an ORM, or an internal API; it relies on server-only context (`cookies()`, `headers()`); or its content is mostly static/read-only.
- **Make a page client only when:** it's fundamentally driven by browser-only APIs (`window`, `localStorage`, WebSockets); it needs interactivity spanning the entire page (drag-and-drop, a multi-step wizard, a rich text editor); or the interactive logic genuinely can't be isolated into separate Client Components rendered from a server page.
- **Protected pages get one more valid reason: a deliberate client-fetch-and-loading-state UX.** The server-first default exists largely for SEO and first-paint cost — neither applies behind auth (never indexed, no social-preview requirement, the visitor already paid the JS-bundle cost signing in). So on a page inside the Protected Section, the owner may deliberately choose a Client Component that fetches on mount (e.g. via `useEffect`) and shows a loading state, instead of an instant server-rendered result. This is a legitimate trade-off there, not a default — it must still be a deliberate choice: leave a short comment at the top of the file stating the reasoning, so a future reviewer doesn't mistake it for a missed split. A Server Action called this way is exactly as safe as one called from a Server Component — it still authorizes and executes entirely server-side regardless of where it's invoked from; only the fetch timing changes, not where it runs.
- **Best practice:** prefer a Server Component page that renders one or more Client Components for the interactive parts, rather than marking the whole page `'use client'`. This is better for performance, SEO, and maintainability — reach for a fully client page only when actually necessary.

### Components

- **Push `'use client'` down to the smallest subtree that actually needs it.** If only one piece of a component needs a client-only hook (`usePathname()`, `useState`), an event handler, or a browser API, extract just that piece into its own Client Component rather than marking the whole parent `'use client'`. Example: `layout/sidebar.tsx` renders a list of nav links; only the active-link highlight needs `usePathname()` — extract a `NavItem` Client Component for that, instead of making all of `Sidebar` client. At the moment of that split, both files move into `layout/sidebar/` (`layout/sidebar/sidebar.tsx` + `layout/sidebar/nav-item.tsx`) — see Component Architecture → Flat Files.
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

### Endpoint Security & Route Protection

- **Public endpoints** (auth handlers, public webhooks, etc.): must strictly validate incoming payloads with Zod.
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

_(The full API-route pipeline — Zod validation, delegation to the service layer, status codes, response shape — is standardized in Data Layer → API Routes + TanStack Query Pattern.)_

---

## Component Architecture

All basic UI elements (inputs, buttons, dialogs, dropdowns, forms, badges, etc.) must be built on `shadcn/ui`. Never use native HTML controls (`<input>`, `<button>`, `<select>`) or custom elements when a `shadcn/ui` equivalent exists. Search component analogs at https://ui.shadcn.com/docs/components.

Only primitives (buttons, fields, and similar controls) are used as building blocks — layout/container primitives like `VStack`/`HStack` or using `Card` as a layout shortcut are deliberately excluded because they rigidly constrain design. Layout is always plain `<div>`/`<section>` + Tailwind.

### Directory Structure (4 Layers)

```text
components/
├── ui/            # Raw shadcn/ui primitives (unmodified)
├── common/        # Basic UI controls built on shadcn primitives — flat by default
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── icon-button.tsx
│   ├── text-field.tsx
│   ├── bar-chart.tsx
│   └── ...
├── layout/        # App chrome mounted only from layout.tsx — flat by default
│   ├── app-shell.tsx
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── footer.tsx
│   ├── notification-center.tsx
│   └── ...
└── features/      # Compound components specific to one feature, grouped by feature
    ├── nodes/
    │   ├── node-properties-panel.tsx
    │   └── ...
    └── dashboard/
        ├── filter-bar.tsx
        └── ...
```

### Layer Definitions

1. **Primitives (`components/ui/`)** — installed via the shadcn/ui CLI only (never hand-copied from docs). Never edited for feature-specific logic, never used directly in pages, `layout/`, or `features/` components.
2. **Common (`components/common/`)** — domain-agnostic wrappers over shadcn primitives (`button.tsx`, `text-field.tsx`, `bar-chart.tsx`, etc.). Own internal styling, label positioning, validation error states, helper text. Usable from anywhere in the app — pages, `layout/`, and `features/` alike.
3. **Layout (`components/layout/`)** — app chrome: the app shell, header, sidebar, footer, and any other structural/compound UI mounted exclusively from `layout.tsx` (e.g. a notification center combining buttons + popovers, if it lives in the header). Never consumed directly from a page — see Layering, Assembly & Styling Rules → "Layout stays in layout."
4. **Features (`components/features/`)** — compound components tied to one specific feature/domain (e.g. node creation/editing, a dashboard's filter bar). Grouped in one subfolder per feature (`features/nodes/`, `features/dashboard/`) — not generic enough for `common/`, not app-chrome for `layout/`. Consumed from that feature's own pages.

### Flat Files — A Folder Appears Only Once a Component Has Genuinely Split

- **Default: one file per component, directly inside its layer folder** (or its feature subfolder, for `features/`). `sidebar.tsx` sits directly in `layout/`; `filter-bar.tsx` sits directly in `features/dashboard/`. This applies identically to `common/`, `layout/`, and each feature subfolder inside `features/` — `ui/` is never split this way, it's managed entirely by the shadcn CLI.
- **Never group by type.** No `buttons/`, `fields/`, `charts/` subfolders inside `common/` — a single `Alert` component doesn't need an `alerts/` folder just because "alert" sounds like a category to some. `button.tsx`, `text-field.tsx`, and `bar-chart.tsx` all sit flat in `common/`.
- **A component gets its own folder at the exact moment it splits into 2+ files that ship together — never before, never speculatively.** The trigger is a real split, for any of the reasons already documented elsewhere in this file: reuse on the second occurrence, render-cost isolation, or the server/client boundary (see Component Architecture → Don't Split Into Subcomponents Unless Actually Reused, and Server & Client Components → Components).
  - Concretely: `layout/sidebar.tsx` stays a single flat file until you extract `NavItem` out of it (e.g. for the client-boundary reason). At that exact point — and not a moment before — both files move together into `layout/sidebar/`: `layout/sidebar/sidebar.tsx` + `layout/sidebar/nav-item.tsx`.
  - Before that second file exists, giving `sidebar.tsx` a folder of its own is exactly the premature structuring this rule forbids — it stays flat as `layout/sidebar.tsx`.

### Don't Split Into Subcomponents Unless Actually Reused

- Default to one file per component, not a component tree. `Sidebar` holds its logo, nav list, and footer inline in one file — do not pre-emptively extract `sidebar-logo.tsx`, `nav-links.tsx`, `sidebar-footer.tsx`, etc. unless those pieces are actually rendered from more than one place.
- **Split on the second occurrence, never the first.** When building a component for the first time, write it as one file even if a piece of it looks reusable in principle. Extract a shared subcomponent only once you're implementing a second place that genuinely needs the same markup/logic, then reuse it in both. Splitting speculatively "just in case" is forbidden — over-fragmenting into files nothing ever imports twice is exactly what this rule prevents.
- Judge reuse the way it actually plays out in a SaaS product, not hypothetically: a `NavItem` may genuinely deserve extraction if the same links render in both a sidebar and a command palette or mobile drawer — extract it once that second usage exists, not in anticipation of it. A `Sidebar`, `Header`, `Footer`, or `AppShell` itself is normally mounted exactly once in the whole app (from the root/section `layout.tsx`) — it does not get split into subcomponents just because it has multiple visual sections.
- **Reuse isn't the only valid reason to extract on the first occurrence.** Two other reasons stand on their own, independent of reuse:
  - **Render-cost isolation:** if a piece has its own local, high-frequency state (hover, a local open/close toggle) and the parent is non-trivial (maps a sizeable list, renders an expensive tree), extract that piece so its state changes don't re-render the whole parent. Skip this for small parents — the cost of re-rendering a handful of children isn't worth a new file, and reaching for this on every `useState` is exactly the kind of speculative splitting this section otherwise forbids.
  - **Server/client boundary:** see Server & Client Components → Components.
- **Mixed responsibilities are a reason to split; size by itself isn't.** Split a component when it's doing two or more independent things (e.g. filtering logic + state management + list rendering + animation, all in one file). A file's length (300-400+ lines), difficulty locating code in it, or an oversized prop list (7-8+ props) aren't reasons on their own — they're symptoms that usually mean responsibilities have already mixed together, worth checking for exactly that before deciding whether or how to split.

### Layering, Assembly & Styling Rules

- **Directional imports:** hierarchy is `layout` / `features` → `common` → `ui`. A higher layer may import a lower one; a lower layer must never import a higher one. `layout/` and `features/` are peer top-tier layers — neither imports from the other.
- **Check before creating:** before adding any new `ui`, `common`, `layout`, or `features` component, check whether one already exists and reuse/extend it instead of duplicating.
- **Check the full shadcn registry, not just the handful already installed:** before hand-writing any markup/logic inside a `common/` component (error text, label wiring, prefix/suffix icons, show/hide toggles, etc.), check whether shadcn already ships a purpose-built primitive for it — run `npx shadcn@latest view <name>` or browse https://ui.shadcn.com/docs/components. The registry has ~65 components, most not yet pulled into this project (e.g. `field`/`field-label`/`field-error` for form-field composition, `input-group` for prefixed/suffixed inputs, `input-otp`, `combobox`) — don't assume the primitives already in `components/ui/` are the only ones available. A missed match means reinventing accessibility/state wiring (ARIA attributes, invalid/disabled propagation, error-list de-duplication, etc.) that's already solved upstream.
- **Never consume shadcn primitives raw:** each primitive (or small related group) must be wrapped in a dedicated `common/` component owning its domain logic, labels, state, and error handling (e.g. `ui/field.tsx` (`Field`/`FieldLabel`/`FieldError`) + `ui/input-group.tsx` (`InputGroup`/`InputGroupInput`) → `common/text-field.tsx`; the app uses `TextField`, never the raw parts).
- **Text-style field elements are built on `InputGroup`:** any `common/` component wrapping a text-style input (`text-field.tsx` and friends) uses `InputGroup` + `InputGroupInput`, never the bare `ui/input.tsx` directly — even when no affix is needed yet. Expose optional `prefix`/`suffix` props (rendered via `InputGroupAddon`) so icons, currency symbols, unit labels, or show/hide-password toggles can be added later through props alone, with no restructuring of the component or its call sites.
- **Split components by mechanism, not by label:** if two variants share the same underlying interaction mechanism and differ only in prop values (type, placeholder, validation, copy), they are one component configured via props — not separate files. A single `TextField` covers email, password, and any other text-style input; don't create `PasswordField`, `EmailField`, etc. as separate components. Split into genuinely separate components only when the underlying mechanism differs (e.g. a text field vs. a select/dropdown vs. a drag-and-drop dropzone) — those don't share internals and forcing them into one component would just be a conditional maze.
- **Name the discriminator, don't split on it:** any `common/` component with more than one semantic variant of the same mechanism exposes a single explicit discriminator prop — `variant` by default; reuse a more specific name only where it already carries that meaning in the DOM (e.g. input `type` for email/password/text). Define the prop even when only one call site exists today. Before creating a new component for what looks like a new case, check whether an existing component's discriminator prop can just take a new value instead.
- **Pages are orchestrators:** `page.tsx` assembles only `common` and `features` components — never raw HTML controls, raw shadcn primitives, or `layout/` components directly (those are consumed exclusively from `layout.tsx` — see "Layout stays in layout" below). If a combination of `common` components is used on one page only, assemble it inline in a plain `div`; extract it into a `features/<feature-name>/` component only once the same combination is actually duplicated across a second page within that feature (see Don't Split Into Subcomponents Unless Actually Reused above).
  - This reuse gate is specifically about compound UI assembled from `common/` pieces. It does not apply to a piece extracted purely for the server/client boundary or render-isolation (see Server & Client Components → Components) — that kind of split colocates with its parent immediately, even on the first occurrence: a page's client-only piece sits next to `page.tsx` in the same `app/` route folder (e.g. `app/login-form.tsx`), not in `components/features/`, until it's genuinely needed on a second page.
- **Layout stays in layout:** `Header`, `Sidebar`, `Footer`, `AppShell`, and other app-chrome are consumed only from the root/section `layout.tsx` — never reused inside feature pages.
- **No abstract layout primitives:** don't introduce `VStack`/`HStack`-style wrappers, and don't use shadcn's `Card` as a page-layout shortcut. Build page/section layout with plain `<div>`/`<section>` styled via Tailwind utilities (`flex`, `grid`, `gap-*`, `space-*`), placing your own `common`/`features` components inside.

---

## Data Layer

### Pattern Selection

Pick **exactly one** pattern for the entire application. Server Actions and API Routes/TanStack Query must never be mixed for standard internal CRUD.

**Default — Server Actions:**

- Use for all data fetching, mutations, and form handling by default.
- Applies whenever the user has **not** explicitly requested API routes, TanStack Query, or mobile-app compatibility requiring a shared backend.
- Action functions live in `actions/`. No `services/` folder exists in this pattern — validation, business logic, and DB calls all live inside the action.

**Alternative — API Routes + TanStack Query:**

- Use **only** when explicitly requested: REST endpoints, TanStack Query, or future mobile-app support needing a shared backend API.
- Server-side business logic and DB calls (what API routes delegate to) live in `services/`. No `actions/` folder exists in this pattern.

**Strict rules:**

- **No hybrid usage:** stick to the selected pattern across every feature.
- **Single source of truth:** Server Actions → all server logic through `actions/`. API Routes → client requests flow `services/` → `app/api/`, orchestrated by TanStack Query.

_(Full pipeline details for each pattern are below, in Server Actions Pattern and API Routes + TanStack Query Pattern.)_

### Shared Standards (both patterns)

These rules apply regardless of which pattern was selected above.

**Environment & client setup:**

- All code in `services/` or `actions/` (whichever exists — see Pattern Selection) runs strictly on the server.
- Every file in `actions/` must start with the `'use server'` directive.
- `src/lib/` (e.g. `lib/supabase/`, `lib/utils.ts`) contains **only** low-level infra: SDK initializers (`createClient()`) and static helpers. Never put DB queries, Supabase domain requests, or auth calls (`getUser()`, `getSession()`) in `lib/` — those belong in `services/` or `actions/`.

**Standardized response format:**

- Services/actions never throw unhandled errors — always return a result object.
- One generic result type per pattern, defined once and reused everywhere. Never write the response shape as an inline object-literal return type (e.g. `Promise<{ error: string | null }>` is forbidden) — always name it via the shared type below. If the type doesn't exist yet in `src/types/` (new project, or first action/service ever written), create it there first — an empty/missing `types/` file is never a reason to fall back to an inline literal.
  - Server Actions pattern → `src/types/action-response.ts`:
    ```ts
    export type ActionResponse<T = void> = T extends void
      ? { error: string | null }
      : { data: T | null; error: string | null };
    ```
  - API Routes pattern → `src/types/service-response.ts`:
    ```ts
    export type ServiceResponse<T = void> = T extends void
      ? { error: string | null }
      : { data: T | null; error: string | null };
    ```
- No `T` (defaults to `void`) → `{ error: string | null }` — this is the "simple action" shape (login, logout, register, etc.). Pass `T` (e.g. `ActionResponse<DashboardStats>`) → `{ data: T | null, error: string | null }` — this is the "data-returning" shape.
- This `{ data, error }` shape is preserved end-to-end, from the database up to the UI (and across API responses in the API-routes pattern).
- Never return raw primitives or bare nullable types from actions/services (e.g. `Promise<string | null>`, `Promise<boolean>`) — always wrap in `ActionResponse<T>` (Server Actions pattern) or `ServiceResponse<T>` (API Routes pattern), never both in the same project.

**Authentication & authorization:**

- Every protected service/action calls the reusable `getUser()` helper first and returns early on failure:

```ts
const { data: user, error: userError } = await getUser();
if (userError || !user)
  return { data: null, error: userError || 'Unauthorized' };
```

- Never trust a `user_id` passed from the client — always override it with the authenticated `user.id` from the session.
- Always chain `.eq('user_id', user.id)` on queries to enforce tenant/ownership isolation.
- **Extract repeated validate → auth → ownership boilerplate — split on the second occurrence, never the first** (same rule as Component Architecture → Don't Split Into Subcomponents Unless Actually Reused). Write the first action's/service's `schema.safeParse` → `getUser()` → ownership-check sequence inline. Once a second action/service in the same file needs the identical sequence, extract a shared private helper (not exported, not itself a Server Action/route handler) that returns the authenticated context instead of copy-pasting the block again. Shape the helper's return like the existing `{ data, error }` convention — e.g. `{ context: { supabase, user, input }, error }` — so callers narrow it with the same `if (error || !context)` idiom already used for `getUser()`, no manual `!` assertions needed.

_(For raw route-handler-level auth checks against `supabase.auth.getUser()` directly, see RESTful API Architecture → Endpoint Security & Route Protection.)_

**Typing:**

- Arguments and return values are strongly typed end-to-end using domain interfaces from `src/types/`, from DB model to UI (see Types & Zod Schemas for type-naming standards).

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
  └──> Server Action (src/actions/)
       └──> Zod validation, inside the action, before any DB/business logic
            └──> Server-side business logic & DB / Supabase
                 └──> Returns { data, error } directly to the client
```

**Key rules:**

- Validation happens directly inside the action, before any query executes.
- The action's entire body is wrapped in a single `try / catch` (see Shared Standards → Validation & Error Handling), with early returns on validation or Supabase errors.
- Every protected action performs an explicit session check (`await supabase.auth.getUser()`) at the very start, before any other logic.
- There is no `services/` layer — the action itself is the full pipeline.

### API Routes + TanStack Query Pattern

_Applies only when this pattern is selected._

**Pipeline:**

```
Client Component (TanStack Query)
  └──> HTTP request (GET/POST/PATCH/DELETE)
       └──> API Route Handler (src/app/api/)
            └──> Zod validation, inside the route handler
                 └──> Service Layer (src/services/)
                      └──> Database / Supabase
                           └──> Returns { data, error } back up the chain
```

**Route handlers (`route.ts`):** thin HTTP adapters only — no DB calls, no business logic. Responsibilities:

1. Parse and validate the request via Zod `.safeParse()`.
2. Delegate execution to the matching `src/services/` function.
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

**Supabase security & public data isolation:**

- Unauthenticated/public users must never query internal tables or private records directly.
- For any public/unauthenticated access to restricted data, use a Postgres function via `supabase.rpc('function_name', { params })` instead of a direct `.select()` on sensitive tables — this enforces DB-level access control and exposes only the allowed fields.
- Protected service operations must explicitly filter by `user_id` (see Shared Standards → Authentication & Authorization).

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

- **User-actionable errors** — the user's own input is what's wrong (failed field validation, a value that conflicts with something, a business rule like "This node is already connected to a destination"). Show the real message inline at the point of failure — under the relevant field via the element's own error state (see Component Architecture → Layer Definitions), or as the form's top-level error. The user needs this text to fix what they did.
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
- For custom application tables, don't rely on auto-generated database types — handcraft clean, dedicated interfaces inside `src/types/` (e.g. `src/types/links.ts`).

### Interface vs. Type

- Prefer `interface` over `type`. Use `type` only when an interface can't express it (union types, primitive aliases, utility mapping) or it meaningfully reduces boilerplate.

### Naming Standards

- **No Hungarian notation / generic suffixes:** never prefix with `I` (`IUser`) or suffix with `Interface`/`Type` (`UserInterface`, `UserType`). Use clean singular nouns (`User`, `Project`, `Invoice`).
- **No raw primitive returns:** Server Actions and service functions must not return raw primitives/nullables directly — always wrap in `Promise<ActionResponse<T>>` or `Promise<ServiceResponse<T>>`, whichever matches the selected pattern (see Data Layer → Standardized Response Format).
- **Contextual suffixes** for non-entity interfaces:
  - Component props: `<Name>Props` (`UserCardProps`, `SidebarProps`)
  - Forms/inputs: `<Name>FormValues` or `<Action><Entity>Input` (`CreateProjectInput`, `UserFormValues`)
  - API payloads/responses: `<Action><Entity>Payload` / `<Action><Entity>Response` (`UpdateUserPayload`, `FetchProjectsResponse`)
- **The extracted `<Name>Props` interface is for `components/` only.** It exists because components (`ui`/`common`/`layout`/`features`) tend to accumulate many, often reused, props. `app/**/page.tsx` and `app/**/layout.tsx` don't get this treatment — their prop shape is small and fixed (`children`, route `params`, `searchParams`), so type it inline instead of naming a one-off interface: `export default function DashboardLayout({ children }: { children: React.ReactNode })`, not a separate `DashboardLayoutProps` declared above it.

---

## Code Style: Functions & Variable Naming

### Function Syntax

- **Components:** standard function declarations (`function ComponentName() {...}`).
- **Top-level exported functions** — actions (`src/actions/`), services (`src/services/`), hooks (`src/hooks/`), and `lib/` helpers — standard function declarations (`export async function loginUser() {...}`, `export function useAuth() {...}`, `export function maskEmail() {...}`). Never `export const x = () => {...}` for these.
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
