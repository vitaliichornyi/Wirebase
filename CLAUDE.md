@AGENTS.md

Directly respect negative rules: if the prompt or guidelines prohibit a specific file, term, or pattern (e.g., "do not use middleware"), you MUST NOT include it anywhere in the response or code.

# Tech Stack & Documentation References

The project relies strictly on the following technologies and standards. Refer to the official documentation links below for syntax, features, and best practices:

1. **React:** Core UI library.
   - Docs: https://react.dev/reference/react

2. **Next.js:** Core framework for routing, rendering, and server side functionality.
   - Docs: https://nextjs.org/docs

3. **TypeScript:** Static typing system across the entire application.
   - Docs: https://www.typescriptlang.org/docs/

4. **TanStack Query (React Query):** Client-side asynchronous state management, data fetching, and caching.
   - Docs: https://tanstack.com/query/latest/docs/framework/react/overview

5. **Tailwind CSS:** Utility-first CSS framework for styling components via utility classes.
   - Docs: https://tailwindcss.com/docs

6. **shadcn/ui:** Accessible, customizable UI component primitive foundation.
   - Docs: https://ui.shadcn.com/docs/installation

7. **Zod:** Schema validation library for API payloads, forms, and environment variables.
   - Docs: https://zod.dev/

8. **React Hook Form:** Lightweight form state management and input handling.
   - Docs: https://react-hook-form.com/docs

9. **Supabase:** Backend-as-a-Service for database management, authentication, and storage.
   - Docs: https://supabase.com/docs

BEFORE proposing architectural structures, file names, or framework conventions: verify if the convention is valid for the current/latest target version. - If you are unsure whether a file naming convention or API method still exists in Next.js, explicitly state your uncertainty or search the official documentation instead of relying on legacy memory. - DO NOT hallucinate migration tools, codemods, or API exports (e.g., `export function proxy`) without absolute certainty.

## Rules for Forward-Thinking & Scalable Architecture

1. **Anticipate Related Features (Predictive Design):**
   - NEVER design a feature as a standalone, isolated entity.
   - Always anticipate logical pairs and upcoming workflows (e.g., if creating Registration -> predict Login, Reset Password, and Profile; if creating a Cart -> predict Checkout).
   - Structure folders, functions, and state to accommodate these upcoming features without needing a complete refactoring later.

2. **Generic & Reusable Contracts over Specific Models:**
   - DO NOT create single-purpose data structures or tight-coupling types for specific features (e.g., DO NOT name types `AuthResult` or `LoginResponse`).
   - Use generic, reusable data abstractions (e.g., `ActionResponse<T>`, `ApiResponse<T>`, `Result<T, E>`) that accept generic payloads.
   - Separate infrastructure/network types from domain-specific payloads.

## Dependency Management & Documentation Verification

1. **Pre-installation Check:** Before installing or configuring any library, ALWAYS inspect `package.json` to verify if the package is already installed.
2. **Version-Specific Docs:** Do not guess API usages. Always inspect the exact package version in `package.json` and reference the official documentation corresponding to that specific version.
3. **Conflict & Outdated Knowledge Resolution:** If a requested task, syntax, or user prompt conflicts with your training data or modern package practices, check the official library documentation to verify the current correct implementation before providing code.

# Application & Routing Architecture

## Directory Structure Pattern

All source code must strictly reside inside `src/`. All application routing is built strictly on Next.js App Router conventions (inside `src/app/`). File placement directly dictates URL routing, layout inheritance, and access control. Below is an example of folder and routing structure:

```text
src/
├── proxy.ts # Proxy / Access control (https://nextjs.org/docs/app/getting-started/proxy)
└── app/
    ├── layout.tsx # Root layout
    ├── page.tsx # The public entry page.
    ├── {feature}/
    │   └── page.tsx # Another unprotected sections.
    ├── {feature}/ # Protected application section.
    │   ├── layout.tsx # Section layout (Sidebar, Header, App Shell)
    │   ├── page.tsx # Main page of the protected section.
    │   ├── new/
    │   │   └── page.tsx # Entity creation page belonging to a parent section.
    │   └── {feature}/ # Other protected application sections (e.g., insights, settings, billing)
    │       └── page.tsx
    └── api/ # API route handlers
        └── {resource}/ # Entity collection endpoint (e.g., insights, users)
            ├── route.ts
            └── [id]/ # Dynamic entity endpoint (e.g., users/[id])
                └── route.ts
```

## Routing & Layout Rules

### Template Placeholders

This document describes a reusable application architecture.
The following names are **placeholders**, not literal folder names:

- `{feature}` → any application section (e.g. `dashboard`, `users`, `projects`, `settings`, `billing`, `insights`, `reports`)

Replace these placeholders with the appropriate names for the current project.

### Public & Protected Sections

The application is divided into two logical areas:

- **Public (Unprotected) Section**
  - Accessible without authentication.
  - May contain the landing page, login page, register page, marketing pages, documentation, etc.
  - The root page (`app/page.tsx`) may represent any public entry point depending on the project.

- **Protected Section**
  - Accessible only to authenticated users.
  - Contains the main application.
  - Has its own shared layout (`layout.tsx`) responsible for the application shell (Sidebar, Header, Navigation, etc.).
  - All authenticated pages should be placed inside this section.

### Authentication Routing

Access control MUST be handled in `src/proxy.ts` according to the Next.js Proxy documentation.
The routing behavior is:

- **Unauthenticated users**
  - May freely access any page in the Public Section.
  - Any attempt to access the Protected Section MUST be redirected to the Public root page (`/`).

- **Authenticated users**
  - May freely access any page in the Protected Section.
  - Any attempt to access pages in the Public Section MUST be redirected to the main page of the Protected Section.

- **No Outdated Conventions (Zero Tolerance):**
  - NEVER suggest or write `middleware.ts` / `middleware.js` in Next.js. This convention is deprecated/removed in favor of `proxy.ts`.
  - If a request involves request interception, rewrite, routing, or pre-processing, ALWAYS use `proxy.ts`.

### Protected Section Structure

The protected section should follow this pattern:

- A shared `layout.tsx` provides the application shell.
- `page.tsx` represents the main entry page after authentication.
- Additional sections (e.g. `{feature}`) are placed inside the protected area.
- Resource creation pages (e.g. `new/page.tsx`) belong to their parent feature.
- Additional nested features may have their own layouts when necessary.

### Dynamic Routes & URL Prefixing Architecture

- **Forbidden Root Dynamic Routes:** Dynamic parameters MUST NOT be placed directly at the root level of the `app/` directory (e.g., `src/app/[slug]/page.tsx` is strictly FORBIDDEN). Dynamic routes at the root collision-course with global pages, auth routes, and standard 404 fallbacks.

- **Mandatory Entity Prefixes for Dynamic Segments:** All dynamic URL segments must be encapsulated within a clear, explicit parent directory prefix that isolates the entity type:
  - **Catch-all / Redirection Shortcodes:** Use a dedicated short-prefix directory (e.g., `src/app/c/[shortCode]/page.tsx` for `/c/abc123`).
  - **Domain Entities:** Use the plural entity name directory (e.g., `src/app/movies/[id]/page.tsx` or `src/app/users/[userId]/page.tsx`).

- **Isolated Routing Context:** Never mix generic root-level routing with dynamic pattern matching. If a feature serves shortlinks, deep links, or user handles, it must explicitly live inside its own scoped namespace directory.

## RESTful API Architecture (`app/api/`)

API routes should follow standard REST conventions and be organized by resource.

### Resource Structure

The following names are placeholders:

- `{resource}` → any API resource (e.g. `users`, `projects`, `posts`, `orders`)
- `[id]` → a dynamic resource identifier.

Each resource should follow this structure:

```text
app/api/
└── {resource}/
    ├── route.ts
    └── [id]/
        └── route.ts
```

### Endpoint Responsibilities

- `app/api/{resource}/route.ts`
  - Handles collection-level operations.
  - Typical methods include `GET` (list resources) and `POST` (create a resource).

- `app/api/{resource}/[id]/route.ts`
  - Handles operations on a single resource.
  - Typical methods include `GET`, `PATCH`, `PUT`, and `DELETE`.

### Design Principles

- Organize endpoints by business domain rather than HTTP methods.
- Group all handlers for the same endpoint inside a single `route.ts` file.
- Follow standard REST semantics whenever practical.
- Resource names are project-specific and should be replaced with the appropriate entity names.

### API Endpoint Security and Route Protection

#### Route Classification

- **Public Endpoints:** Routes accessible without authentication (e.g., auth handlers, public webhooks). Must strictly validate incoming payloads with Zod.
- **Protected Endpoints:** Routes requiring an active user session. Must verify user identity on the server before executing business logic and strictly validate incoming payloads with Zod.

#### Server-Side Authentication Check

- Every protected route handler inside `route.ts` MUST verify the user via the Supabase server client using `getUser()` (not `getSession()` for security reasons).
- If no user is returned, immediately abort the execution and return a `401 Unauthorized` response.

Example pattern inside handler:

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

#### Authorization and Resource Ownership

- Authentication verifies _who_ the user is; authorization verifies _what_ they can access.
- Always check if the authenticated `user.id` owns the requested resource or possesses the required role before performing mutation (`POST`, `PATCH`, `DELETE`) or data retrieval (`GET`).

# Extended Directory Structure (`src/`)

Inside the `src/` directory, besides `app/`, the following folders must be used strictly according to their purposes:

```text
src/
├── components/ # UI Components
├── types/ # TypeScript interface & type definitions
├── actions/ # Next.js Server Actions (Optional: used when TanStack Query is not applied)
├── schemas/ # Zod validation schemas
├── lib/ # Third-party client setups (e.g., Supabase client), constants, and utils
├── hooks/ # Custom React hooks
└── services/ # Data fetching & business logic for server side
```

## Directory Responsibilities

1. `types/`
   - Holds all shared TypeScript interfaces, types, and database models.
   - Keep types modular and grouped by domain (e.g., `user.ts`, `links.ts`).

2. `services/`
   - Server-side data fetching and database query functions called by API routes.
   - Encapsulates direct database/Supabase logic away from API route handlers.

3. `schemas/`
   - All Zod validation schemas for forms and API payload validation.

4. `lib/`
   - Third-party library initializations (e.g., Supabase client creation inside `lib/supabase/`).
   - Shared helper utilities (e.g., `cn` utility for Tailwind) and global app constants.

5. `hooks/`
   - Reusable custom React hooks (`useDebounce`, `useMediaQuery`, etc.).

6. `actions/`
   - Next.js Server Actions for server-side mutations.
   - Do NOT use Server Actions if data fetching and mutations are handled via TanStack Query and API routes. Use API routes with TanStack Query as the sole standard for data handling.

# Server Actions vs. API Routes Strategy

## Approach Selection Rule

Before starting development, determine the data architecture pattern. Choose **ONLY ONE** pattern for the entire application. Do NOT mix Server Actions and API Routes / TanStack Query within the same project.

1. **Default Pattern (Server Actions):**
   - Use **Server Actions** for all data fetching, mutations, and form handling by default.
   - Applies when the user has **NOT** explicitly requested API routes, TanStack Query, or mobile app compatibility.
   - **Directory Naming:** Place all action functions inside an `actions/` directory.

2. **API Routes & TanStack Query Pattern:**
   - Use **API Routes (`app/api/`) combined with TanStack Query** ONLY IF the user explicitly specifies the need for REST API endpoints, TanStack Query, or future mobile application support requiring a shared backend API.
   - **Directory Naming:** Place all API request functions / fetchers inside a `services/` directory.

## Strict Rules

- **No Hybrid Usage:** Stick strictly to the selected strategy across all features. Never use Server Actions alongside API routes for standard internal CRUD operations.
- **Single Source of Truth:** If Server Actions are chosen, execute all server-side logic via actions in `actions/`. If API Routes are chosen, route all client-side data requests through `services/` to `app/api/` with TanStack Query.

# Component Architecture Guidelines

ALL basic UI elements (inputs, buttons, dialogs, dropdowns, forms, badges, etc.) MUST be built on top of `shadcn/ui`.
NEVER use native HTML form controls (e.g., `<input>`, `<button>`, `<select>`) or custom elements if an equivalent `shadcn/ui` component exists.

## Directory Structure

Components are strictly organized into 4 logical layers inside the `components/` directory:

```text
components/
├── ui/                 # Raw shadcn/ui primitives (Unmodified)
├── elements/           # Basic UI controls built on top of shadcn primitives
│   ├── buttons/        # Custom buttons (e.g., button.tsx, icon-button.tsx)
│   ├── fields/         # Form inputs, date pickers, select fields (e.g., text-field.tsx)
│   ├── charts/         # Data visualization elements (e.g., bar-chart.tsx)
│   └── ...
├── composites/         # UI blocks built from elements
│   ├── filters-panel/
│   ├── notification-center/
│   └── ...
└── layout/             # Structural components that define app shell & navigation
    ├── app-shell/
    ├── header/
    ├── sidebar/
    ├── footer/
    └── ...
```

## Layer Definitions & Rules

1. **Primitives (`components/ui/`)**

- Base components copied directly from `shadcn/ui` (e.g., `button.tsx`, `input.tsx`, `dialog.tsx`).
- **Do NOT** edit these files directly for feature-specific logic.
- **Do NOT** use primitives directly in pages, composites, or layouts.

2. **Elements (`components/elements/`)**

- Domain-specific wrappers built on top of `shadcn/ui` primitives.
- Grouped into subfolders by domain type (`buttons/`, `fields/`, `charts/`, etc.).
- Encapsulate internal styling, label positioning, validation error states, helper text, and project UI patterns.
- Example: custom `text-field.tsx` built from `ui/input.tsx` with built-in label and error handling.

3. **Composites (`components/composites/`)**

- Compound UI components constructed by combining multiple `elements`.
- Examples: `notification-center/` (combines buttons, popovers), `filters-panel/`, or complete reusable forms (`user-form/`).

4. **Layout (`components/layout/`)**

- Structural components responsible solely for application layout and navigation structure.
- Includes `app-shell/`, `sidebar/`, and `navigation/`.
- Assembled using components from `elements/` and `composites/`.

## Rules for Component Creation & Page Assembly

### 1. Component Layering & Directional Imports

- **Layer Hierarchy:** `layout` → `composites` → `elements` → `ui`.
- **Strict Directional Imports:** Higher layers can import from lower layers. Lower layers MUST NEVER import from higher layers.
- **Check Existing:** Before creating a new UI control, check if a primitive exists in `components/ui/`. If so, wrap it in `components/elements/`.
- **No Duplication:** Never duplicate primitive or element logic inside feature folders. Always prefer higher-level wrappers from `components/elements/` over raw primitives from `components/ui/`.

### 2. Custom Encapsulation over Direct Primitives

- Do NOT use raw Shadcn primitives directly without domain context.
- Before using a UI control (e.g., input, select, modal), encapsulate Shadcn primitives with their associated logic, labels, and state into dedicated wrapper components (e.g., combining Shadcn `Input`, `Label`, and `FormMessage` into a single reusable field component).

### 3. Page Assembly Rules

- Pages (`page.tsx`) must strictly act as orchestrators of feature components.
- Do NOT place raw HTML elements (e.g., `<input>`, `<button>`) or unencapsulated Shadcn primitives directly inside page files. Assemble pages using high-level feature components and elements only.

### 4. Layout Structure & Styling

- Do NOT use abstract layout components like `VStack`, `HStack`, or custom layout primitives.
- Use standard HTML `div` elements styled strictly with Tailwind CSS (`flex`, `grid`, `gap-*`, `space-*`) for page and section layouts.

# Domain-Driven File Organization & Naming Rules

## Core Modular Philosophy

- Avoid Micro-Files: Do NOT create separate files for every single function or entity. Group related logic by module/domain into unified files (e.g., auth.ts, links.ts).
- Module Coverage: A single file must contain all closely related operations for that feature (e.g., auth.ts inside services/ contains login, logout, refreshToken, etc.).

## File Naming Standard

- kebab-case ONLY: All files and folders across the project must strictly use lower-case letters with hyphens.
- Pattern: domain.ts or domain-submodule.ts (e.g., auth.ts, auth-oauth.ts, links-analytics.ts).

## Code Naming Conventions

### 1. Types & Interfaces (types/)

- File Naming: kebab-case (e.g., links.ts, auth-credentials.ts).
- Type/Interface Names: PascalCase (Capitalize every word).
  Example:
  ```ts
  export type DashboardStats = { ... };
  export interface UserProfile { ... }
  ```

### 2. Services & Actions (services/, actions/)

- File Naming: kebab-case (e.g., auth.ts, links-management.ts).
- Function Names: camelCase.
  Example:
  ```ts
  export const loginUser = async () => { ... };
  export const generateShortLink = async () => { ... };
  ```

### 3. Zod Schemas (schemas/)

- File Naming: kebab-case (e.g., auth.ts, links.ts).
- Schema Object Names: camelCase (usually ending with Schema).
  Example:
  ```ts
  export const loginSchema = z.object({ ... });
  export const createLinkSchema = z.object({ ... });
  ```

### 4. Constants (lib/ or modular files)

- File Naming: kebab-case (e.g., auth-constants.ts, api-routes.ts).
- Constant Names: UPPER_SNAKE_CASE (All capital letters with underscores).
  Example:
  ```ts
  export const MAX_RETRY_ATTEMPTS = 3;
  export const AUTH_COOKIE_NAME = 'session_token';
  ```

### 5. Custom Hooks (hooks/)

- File Naming: kebab-case with use- prefix (e.g., use-auth.ts, use-debounce.ts).
- Hook Function Names: camelCase starting with use.
  Example:
  ```ts
  export const useAuth = () => { ... };
  ```

# Interface & UI Copy Guidelines

## Language & General Tone

- All user interface texts (labels, buttons, titles, messages) MUST be written in English.
- Never use generic onboarding greetings like "Welcome to platform...", "Hello user", etc.
- Keep copy rational, clear, concise, and without decorative embellishments.

## Headlines & Subtitles

- **Titles:** Short enough to fit on a single line. Never end titles with a period. Do NOT use punctuation inside titles (`-`, `:`, `;`, `,`, `(`, `)`).
- **Subtitles:** Act as a direct sentence continuation of the title. Must end with a period.

## Controls & Labels

- All interactive controls (buttons, placeholders, field labels, navigation) use Title Case with only the first letter capitalized (e.g., "New user").
- Never end control labels with periods.
- For creation actions, prefer "New [Entity]" over "Add new [Entity]" (e.g., "New location", "New user").

## Navigation & Menus

- Keep menu and navigation items strictly 1 to 3 words maximum (prefer single-word items like "Users", "Locations", "Dashboard").

# Server Services/Actions Standards

All server-side business logic and database interactions must strictly adhere to the following conventions:

## 1. Environment & Client Setup

- All functions inside `services/`, `actions/` execute strictly on the server.
- All `actions/` files MUST include the `'use server'` directive at the top of the file to execute strictly on the server.
- Files inside `src/lib/` (e.g., `lib/supabase/`, `lib/utils.ts`) MUST ONLY contain low-level infrastructure setup, SDK initializers (e.g., `createClient()`), and static helpers.
- NEVER put database queries, Supabase domain requests, or auth logic (e.g., `getUser()`, `getSession()`) inside `lib/`. Any function that interacts with application data or auth state MUST reside strictly inside `services/` or `actions/`.

## 2. Standardized Response Format

- Services MUST NEVER throw unhandled errors. Always return a result object.
- Functions returning data MUST use: `Promise<ServiceResponse<T>>`.
  - Success: `{ data: T, error: null }`
  - Failure: `{ data: null, error: string }`
- Simple action functions (e.g., login, logout) MUST return:
  - Success: `{ error: null }`
  - Failure: `{ error: string }`

## 3. User Authentication & Security

- To protect sensitive data, protected service/action functions MUST call the reusable `getUser()` helper to verify authorization before executing queries.
- Perform an early return if authentication fails:

```ts
const { data: user, error: userError } = await getUser();
if (userError || !user)
  return { data: null, error: userError || 'Unauthorized' };
```

- Explicitly chain `.eq('user_id', user.id)` on database queries to ensure strict tenant data isolation.

## 4. Input Handling & Typing

- Input validation (e.g., Zod) MUST be performed at the route level before reaching the service layer.
- Input validation (e.g., Zod) MUST be performed directly inside the action before proceeding with any business logic.
- All returned data structures and arguments must be strongly typed using domain types from `src/types/`.

## 5. Defensive Flow & Error Handling

- **Error Handling & Flow Control:**
  - Prevent crashes by explicitly checking for missing data or query errors using early returns (e.g., `if (error) return ...`).
  - **API Routes Architecture:** Route handlers (`route.ts`) act purely as data validators (e.g., Zod) and HTTP response adapters. The actual business logic and `try / catch` blocks MUST reside inside the service functions (`services/`).
  - **Server Actions Architecture:** Every Server Action inside `actions/` MUST wrap its entire logic within a `try / catch` block directly inside the action function itself.

```ts
catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown server error' };};
```

# API Route Handlers Standards (`src/app/api/`)

All API routes (`route.ts`) must act strictly as thin entry points that map HTTP requests to service layer calls:

## 1. Responsibilities

- Route handlers MUST NOT contain database calls or complex business logic.
- They are strictly responsible for:
  1. Parsing and validating the incoming HTTP request.
  2. Delegating execution to the appropriate service function from `src/services/`.
  3. Formatting and returning standard `NextResponse.json` responses with appropriate HTTP status codes.

## 2. Request Parsing & Zod Validation

- Always validate incoming payloads using Zod schemas via `.safeParse()`:
- On validation failure, extract the first clear error message and return HTTP `400`:
  `const errorMessage = parsed.error.issues[0]?.message || 'Validation error';`
  `return NextResponse.json({ data: null, error: errorMessage }, { status: 400 });`

## 3. Standardized Status Codes & Responses

- Map service layer results to proper HTTP status codes:
  - **200 OK:** Successful `GET` or non-creation action (e.g., login, logout).
  - **201 Created:** Successful resource creation (`POST`).
  - **400 Bad Request:** Validation failure, invalid JSON, or standard business error.
  - **401 Unauthorized:** If the service error message explicitly equals `'Unauthorized'`.

## 4. Consistent Response Payload Structure

- Endpoints returning data MUST respond with: `{ data, error }`.
- Simple action endpoints (e.g., auth actions) respond with: `{ error }`.

# Client Data Fetching Standards (`TanStack Query`)

If the **API Routes & TanStack Query** architecture pattern is selected, all client-side async operations, caching, and state updates must strictly follow these TanStack Query standards:

## 1. Query vs Mutation Division

- **Use `useQuery`** exclusively for fetching and reading data (`GET` requests).
- **Use `useMutation`** for actions, data creation, updates, or deletions (`POST`, `PUT`, `DELETE`).

## 2. Error Handling & Throw Pattern

- Inside `queryFn` and `mutationFn`, always verify `response.ok`.
- If `!response.ok`, parse the JSON error and explicitly throw a Javascript `Error`:
  `if (!response.ok) throw new Error(error || 'Default fallback message');`

## 3. Query Keys Architecture

- Structure `queryKey` as an array with clear hierarchical parameters:
  `queryKey: ['resource-domain', dynamicParam]` (e.g., `['dashboard-stats', period]`).

## 4. Cache Invalidation & Post-Mutation Actions (`onSuccess`)

- Upon successful mutations (`onSuccess`), invalidate impacted query keys using `queryClient.invalidateQueries({ queryKey: [...] })` to trigger an automatic UI refresh..

# API Routes & TanStack Query Data Architecture

> **Applicability:** Follow this architecture ONLY when the **API Routes & TanStack Query** pattern is selected for the project.

## 1. Unified Data Flow Pipeline

All data requests and mutations across the application must strictly flow through this multi-layered pipeline:

Client Component (TanStack Query)
└──> HTTP Request (GET/POST/PATCH/DELETE with payload or params)
└──> API Route Handler (`src/app/api/`)
└──> Validation Layer (Zod schema parse inside route handler)
└──> Service Layer (`src/services/`)
└──> Database / Supabase
└──> Returns `{ data, error }` payload back up the chain

### Key Rules of the Pipeline

- **Strict Validation:** Every incoming parameter, query string, or body payload MUST be validated via Zod schemas inside the API route handler BEFORE calling the service layer.
- **Service Isolation:** Route handlers (`route.ts`) only handle HTTP protocol concerns (request parsing, validation, HTTP status codes). Business logic, `try / catch` blocks, and database queries MUST reside inside `src/services/`.
- **End-to-End Typing:** Data contracts must remain fully typed from the database model to the UI using domain interfaces from `src/types/`.
- **Consistent Response Schema:** Data passes through all layers wrapped in the standardized `{ data, error }` structure.

## 2. Security & Public Data Isolation (Supabase)

- **Tenant Data Leak Protection:** Be extremely cautious when handling endpoints accessible to unauthenticated or public users. Unauthenticated users must NEVER be able to query internal application tables directly or access private user records.
- **RPC / Stored Procedures for Public Access:**
  - For operations where non-authenticated users need restricted data access, DO NOT perform direct `.select()` queries on sensitive tables.
  - Use custom PostgreSQL functions via Supabase RPC (`supabase.rpc('function_name', { params })`) to encapsulate access logic, enforce database-level security policies, and expose ONLY the exact properties allowed for public consumption.
- **Explicit Authorization Checks:** Any protected service operating on behalf of a user MUST explicitly filter queries by `user_id` (`.eq('user_id', user.id)`).

# Server Actions Data Architecture

> **Applicability:** Follow this architecture ONLY when the **Default (Server Actions)** pattern is selected for the project.

## 1. Unified Data Flow Pipeline

All mutations and server-side data requests across the application must strictly flow through this pipeline:

Client Component (Form / `useActionState` / `useTransition`)
└──> Server Action Call (`src/actions/`)
└──> Validation Layer (Zod schema parse inside action)
└──> Server-Side Business Logic & Database / Supabase
└──> Returns `{ data, error }` payload directly to the client

### Key Rules of the Pipeline

- **Mandatory Directive:** Every action file in `src/actions/` MUST include the `'use server'` directive at the very top.
- **In-Action Validation:** Input parameters MUST be validated using Zod schemas directly inside the Server Action BEFORE executing any database queries or business logic.
- **Error Handling:** Every Server Action MUST wrap its entire logic in a `try / catch` block directly inside the action function and return early on validation or Supabase errors.
- **End-to-End Typing:** Arguments and return values must be strictly typed using domain interfaces from `src/types/`.
- **Consistent Response Schema:** All actions MUST return a standardized result object formatted as `{ data: T | null, error: string | null }`.

## 2. Security & Authorization in Actions

- **Server-Side Identity Check:** Every protected Server Action MUST perform an explicit session check via Supabase server client (`await supabase.auth.getUser()`) at the very beginning of execution.
- **Tenant Data Leak Protection:** Never trust arguments passed from the client; always override `user_id` with the authenticated `user.id` retrieved from the server session.
- **Explicit Ownership Filtering:** Always enforce resource ownership at the database query level using `.eq('user_id', user.id)`.

# Types Architecture & Zod Integration (`src/types/` & `src/schemas/`)

## 1. Type Inference from Zod Schemas

- **Avoid Type Duplication:** For form inputs, API payload interfaces, and request parameters, NEVER manually define a separate TypeScript `type` or `interface` alongside a Zod schema.
- **Use `z.infer`:** Derive TypeScript types directly from Zod schemas using `z.infer<typeof schema>`.
  Example:
  ```ts
  export const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  export type AuthInput = z.infer<typeof authSchema>;
  ```

## 2. Domain Types & Built-in Auth Types

- **Built-in System Types:** Use standard SDK types for built-in Supabase systems (e.g., import `User` directly from `@supabase/supabase-js`).
- **Custom Application Tables:** For custom user-created database tables, DO NOT rely on auto-generated database types. Handcraft clean, dedicated interfaces inside `src/types/` (e.g., `src/types/links.ts`).

## 3. Interface Preference

- Prefer `interface` over `type`. Use `type` ONLY when explicit typing cannot be achieved with an interface (e.g., union types, primitive aliases, utility mapping) or when it significantly reduces code boilerplate.

## 4 Interface & Type Naming Standards

- **No Hungarian Notation & Generic Suffixes:** Never prefix interfaces with `I` (e.g., `IUser`) or attach redundant suffixes like `Interface` or `Type` (e.g., `UserInterface`, `UserType`). Use clean, singular nouns representing the domain model (e.g., `User`, `Project`, `Invoice`).

- **No Direct Primitive Return Types:** Server Actions and Service layer functions MUST NOT return raw primitives or nullable types directly (e.g., `Promise<string | null>`, `Promise<boolean>`). Always wrap return types in the standardized generic response structure (`Promise<ServiceResponse<T>>` or `Promise<ServiceResult<T>>`).

- **Contextual & Intent-Driven Suffixes:** When an interface represents a specific context rather than a raw database entity, append a clear functional suffix:
  - **Component Props:** `<Name>Props` (e.g., `UserCardProps`, `SidebarProps`).
  - **Forms & Inputs:** `<Name>FormValues` or `<Action><Entity>Input` (e.g., `CreateProjectInput`, `UserFormValues`).
  - **API Payloads & Responses:** `<Action><Entity>Payload` or `<Action><Entity>Response` (e.g., `UpdateUserPayload`, `FetchProjectsResponse`).

# Security, Environment Variables & Supabase Server Isolation

## 1. Environment Secrets Management (`.env.local`)

- All API keys, connection strings, and service secrets MUST reside strictly in `.env.local`.
- `.env.local` MUST be declared inside `.gitignore` to prevent secret leaks to version control repositories.
- NEVER hardcode secrets, service roles, or API credentials directly into source code.

## 2. Strict Server-Side Supabase Execution

- All Supabase interactions MUST execute strictly on the server (inside server actions or service functions).
- **Browser Client Explicitly Banned:** Creation or usage of a browser/client-side Supabase instance (e.g., `createBrowserClient` or exposing supabase SDK to client components) is STRICTLY FORBIDDEN.
- Keeping Supabase logic strictly on the server guarantees that database operations and private keys remain completely isolated from the user's browser runtime.

# Global Architecture: Providers & Layout Setup (`src/providers/` & `src/app/layout.tsx`)

## 1. Modular Providers Architecture (`src/providers/`)

- Each global provider (e.g., TanStack Query Provider, Theme Provider, Toast Provider) MUST be placed in its own separate file inside `src/providers/`.
- All provider files MUST explicitly include the `'use client'` directive at the top.
- DO NOT stack or declare multiple providers inside a single file.

## 2. Root Layout Integration (`src/app/layout.tsx`)

- Import and wrap the application tree with global providers strictly inside the **root layout** (`src/app/layout.tsx`). Global providers MUST NEVER be placed inside nested layouts (e.g., section-level, route group, or feature layouts).
- `src/app/layout.tsx` MUST remain a Server Component. DO NOT convert the root layout into a Client Component to render providers.

# Function Syntax & Variable Naming Standards

### 1. Function Syntax Conventions

- **Component Definitions:** Use standard function declarations for all React component definitions (`function ComponentName() { ... }`).
- **Internal Logic & Handlers:** Use arrow functions for helper functions, event handlers, and callbacks defined inside components (`const handleClick = () => { ... }`).

### 2. Variable Naming Conventions

- **Self-Explanatory & Descriptive:** Variable names must clearly convey their intent and content without needing comments (e.g., `isUserAuthenticated` instead of `auth`, `activeProjectList` instead of `data`).
- **Boolean Variables:** Prefix boolean variables and flags with clear modal or state verbs (`is`, `has`, `should`, `can`):
  - `isLoading`, `hasPermission`, `shouldRedirect`, `canEdit`
- **Event Handlers:** Name event handler functions with the `handle` prefix, and props accepting handlers with the `on` prefix:
  - Component prop: `onSave`
  - Internal handler: `handleSave`
- **No Abbreviations:** Avoid cryptical abbreviations, shortcuts, or single-letter names in variables, arguments, and function definitions. Variable names must be spelled out fully to clearly explain their purpose (e.g., `userIndex` instead of `idx`, `request` instead of `req`, `response` instead of `res`, `element` instead of `el`, `button` instead of `btn`).

# Strict Form Architecture Rules (React Hook Form & Controller)

1. **Mandatory React Hook Form Standard:**
   - ALL forms MUST be managed strictly using `react-hook-form` paired with `zod` schema validation.
   - Direct manual state management (`useState` for form fields) is STRICTLY PROHIBITED.

2. **Self-Contained Encapsulated Controllers:**
   - NEVER extract or keep `<Controller>` logic outside of the input component or in parent wrapper components.
   - EVERY custom UI input, select, checkbox, or field component MUST encapsulate its own `Controller` inside itself.
   - The parent form component should only pass the `control` object, `name`, and field-specific props down to the child component.
