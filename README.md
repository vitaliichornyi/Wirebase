# Wirebase

A SaaS platform for traffic tracking, analytics, and flexible traffic distribution through a node-based interface.

**Live Demo:** [Demo link](#)

The core goal of Wirebase is to rethink traditional link-tracking and URL-shortening systems. Instead of standard tables and static UTM-tag settings, the project offers a visual node system that lets you build flexible custom scenarios (flows) to manage and deeply analyze traffic.

## About the Project

Wirebase lets you chain input and output points into a single flow, collect detailed click analytics, and manage redirects in real time.

Key features and concepts:

- **Node-based architecture:** create incoming links (Input) and destination endpoints (Output), visually wiring up redirect logic.
- **Analytics collection:** full tracking of clicks, visits, UTM parameters, and browser request data.
- **Flexible routing (in progress):**
  - **Geo nodes:** redirect users to different Output nodes based on their country or region.
  - **Conditional nodes (If/Else):** filter and branch traffic by browser language, device type, date, and other parameters.
  - **Split nodes:** split traffic by percentage for A/B testing.

## Development Process & AI Integration

One of the key goals while building Wirebase was establishing an effective development process powered by AI. The aim was to speed up coding while still:

- **Keeping full control over the architecture:** not outsourcing code generation to AI entirely, but reviewing every decision.
- **Deepening the learning process:** using the generated code as a way to learn new concepts, rather than just copying finished solutions.
- **Applying relevant patterns:** introducing the architectural approaches and technologies best suited to the project's specific needs.

### Building a Rule Base (`CLAUDE.md`)

To keep the AI writing code in a consistent style and following my architectural standards, I introduced a `CLAUDE.md` file — a systematized rule base for the model:

1. **Carrying over proven experience:** based on a previous project (Movie App), I compiled a set of conventions and patterns that had already proven effective.
2. **Codifying architectural standards:** set clear rules for the stack. For example, a mandatory response format for Server Actions — a `{ data, error }` object, guaranteeing predictable error handling.
3. **Iterative rule updates:** the process works as a closed loop:
   - The AI generates code based on the current `CLAUDE.md`.
   - I review the code and logic.
   - If a good new solution emerges, or a gap is found, I immediately ask the AI to update the rules according to the new convention.

This keeps the rule file continuously up to date, while code quality stays fully under control.

### Specification & Task Planning: the `Grill with Docs` Skill

The next step was introducing a dedicated skill, `Grill with Docs`, which acts as a systems analyst:

- **Interactive specifications:** the skill asks clarifying questions about business logic and user scenarios, then produces clear project specifications.
- **Breakdown into tickets:** based on my answers, the AI automatically splits the task into structured tickets and subtasks.
- **Deep context:** this allows every function and node to be described in detail before any code is written, eliminating hallucinations and misinterpretations of the application's logic.

### End-to-End Development Workflow

Building on the prepared rules and skills, a full development cycle emerged for each ticket:

1. **Specification:** the `Grill with Docs` skill interviews me about task details and produces a spec together with a ticket.
2. **Code generation:** the AI implements the feature, strictly following the constraints and patterns from `CLAUDE.md`.
3. **Manual review & pattern study:** I go through the generated code in detail. If I come across an unfamiliar or questionable piece, I ask the AI to explain the logic and the pattern used (best practices).
4. **Fine-tuning & token savings:**
   - Small fixes, layout, and styling I handle manually — it's faster and saves a significant number of tokens.
   - For larger architectural changes, I send the task back to the AI for rework.
5. **Updating the rules:** if a better solution is found along the way, it's immediately added to `CLAUDE.md`.

## Tech Stack & Tooling Choices

Every technology in this project was chosen deliberately, with an emphasis on development speed, ease of customization, and deepening practical skills.

### AI Tools & Environment

- **Claude (VS Code extension):** used as the primary AI assistant directly in the editor for fast, context-aware coding.
- **`Grill Me with Docs` skill:** chosen for its convenient approach to automatically generating specs, tickets, and tests, removing the routine of writing documentation by hand.

### Frontend & Backend

- **React & TypeScript:** the core stack, chosen for deep, hands-on learning.
- **Next.js (App Router):** used for its convenient folder-based routing and server-side logic.
- **Supabase:** chosen as the database — a proven, battle-tested, and convenient standard for quickly spinning up backend infrastructure.

### UI & Styling

- **Shadcn UI:** in the previous project (Movie App), components were built from scratch, which turned out to be inefficient. Among ready-made libraries, Shadcn was chosen for its flexible composition-based customization (an element assembled from separate `Label`, `Input Group`, `Input Field` pieces). This gives full freedom to build custom selectors and complex fields without any workarounds.
- **Tailwind CSS:** the sole, unchanging standard. All styles are encapsulated within the component itself — no need to search through a pile of external CSS files for a single tweak.
- **Recharts:** used for building charts and analytics, since it ships out of the box as Shadcn UI's charting layer (no point pulling in another third-party library).

### Specialized Libraries & Validation

- **React Flow:** the key choice for building the node system. Selected as the industry standard with the lowest barrier to entry and easy customization.
- **Zod:** chosen for strict input and type validation.
- **React Hook Form:** used on the login and registration pages to learn the standard approach to complex forms in the React ecosystem.

## Project Architecture & Folder Structure (Feature-First Architecture)

The codebase is organized using a **Feature-First** approach (modular, feature-based architecture). All entities in the project are clearly split into two main layers: **Shared** and **Features**.

Separation principle:

- **`shared/`:** reusable UI components (Shadcn UI atomic elements), global Server Actions, common utilities, types, and configuration.
- **`features/`:** each feature is an isolated module with its own internal logic, forms, types, and Server Actions.
  - Example, `features/auth`: contains all authentication logic — login, registration — plus its specific UI forms and actions.
  - Example, `features/flows`: contains the visual editor, React Flow integration, and creating, editing, and deleting node chains and their processing.

### Why Feature-First Is Key to an AI-Driven Process

This structure was chosen not just for scalability, but for the control it gives over AI-generated code:

1. **Transparent, convenient code review (Git & IDE):**
   Since development relies on regularly reviewing AI-generated code, being able to quickly understand what actually changed was a key requirement. With a Feature-First structure, all changes for a given task or ticket are localized to a single feature folder. The IDE's and Git's built-in diff tools let you instantly gauge the scope of a change and see exactly which files the AI touched, without losing focus.
2. **No jumping around the project:**
   In traditional (layered) architectures, where all Server Actions live in one shared `actions/` folder and all types in one `types/` folder, you end up constantly scanning huge file lists or scrolling through hundreds of lines looking for a specific function. With Feature-First, everything is right at hand: opening a feature's folder immediately shows the full context — from the UI to its related Server Actions and specific types.
3. **Lower risk of side effects:**
   Isolating logic within a feature ensures that when the AI generates or refactors code for one module, it doesn't accidentally touch or break neighboring parts of the system.

### 1. Auth Feature (`features/auth`)

Handles the full authentication and identity flow (login and registration forms, and link-confirmation screens).

- **Supabase Auth:** uses Supabase's built-in auth functionality without custom user tables, ensuring a high level of security and speeding up session handling.
- **React Hook Form:** manages the full client-side form state, error handling, and user input.
- **Double Zod validation:** data is validated on the client as it's entered, and re-validated on the server inside Server Actions before calling Supabase logic.

### 2. Flows Feature (`features/flows`)

The central module of the application, responsible for creating, configuring, and managing visual traffic-redirect chains. It includes two key screens:

**Screens & components:**

- **Flows table view:**
  - **Status management:** switching between active and archived flows, plus quickly toggling `Active` / `Inactive` states. When a flow is set to `Inactive`, redirects through its generated link stop working (the user lands on a 404/rejection page).
  - **Filtering & search:** search by flow name or parameters.
  - **Actions:** quickly creating a new flow, editing an existing one, archiving, and jumping to its personal analytics dashboard.
- **Canvas flow view:**
  - Built on top of the React Flow library.
  - **Automatic initialization:** creating a new flow automatically generates a starting Input node with a ready-made unique link for receiving traffic.
  - **Connection concept:** a working flow requires a chain from an entry point (Input) to an exit point (Output), where the user specifies the final target URL.
  - **Architectural groundwork for the node system (roadmap):**
    - **Implemented so far:** the standard `Input Node` ➔ `Output Node` connection.
    - **In progress:**
      - **Geo Node:** branching traffic across multiple Output links based on the user's country (e.g. showing different landing pages per region from a single incoming link).
      - **Split Node:** distributing traffic by percentage (e.g. 50/50 or 33/33/rest) for A/B testing and comparing conversions.
      - **Conditional Node (If/Else):** checking data from the browser request (language, device type — desktop/mobile, current date) and routing the user down the matching branch.

### 3. Dashboard Feature (`features/dashboard`)

The analytics and metrics visualization module. Handles aggregating click data and presenting clear reports.

- **Visualization & charts (Shadcn UI + Recharts):**
  - **Overall metrics (`StatTile`):** displays the total click count (`Total Clicks`) with number formatting.
  - **Ranked charts (`RankedBarChart`):** horizontal bar charts for top metrics:
    - **Clicks by Country:** click distribution and top user geo-locations.
    - **Clicks by Link:** comparing the performance of specific links.
    - **Clicks by Referrer:** traffic sources and referrers.
    - **Clicks by Campaign:** traffic breakdown by marketing campaign (UTM tags).
- **Deep filtering & interactivity (`DashboardToolbar`):**
  - **Flexible filtering:** sampling data by specific flow, link, and country.
  - **Time ranges:** quickly switching analytics periods (last 24 hours, 7 days, 30 days, or all time).

## Roadmap

- [x] Basic node system (Input ➔ Output)
- [x] Supabase Auth integration and end-to-end Zod validation
- [x] Analytics dashboard with filtering and Recharts charts
- [ ] Geo Node: branch traffic by user country
- [ ] Split Node: percentage-based traffic splitting for A/B testing (50/50, 33/33/rest)
- [ ] Conditional Node: branch scenarios by browser language, device type, and date
