# AGENTS.md - Mercury Dasha System Architecture & Agent Instructions

> **Project:** Mercury Dasha (Budha Mahadasha & The Quicksilver Principle)  
> **Author & Architect:** Justin Andrew Wood  
> **Temporal Context:** Navigating the final **Saturn–Jupiter (*Shani–Guru*)** Antardasha through **April 2028**.  
> **Target Dawn:** April 2028 (Inception of the 17-Year Mercury Mahadasha).  
> **Repository:** `/home/justin/code/mercury-dasha`

---

## 🏛️ CORE ARCHITECTURAL LAWS (NON-NEGOTIABLE)

### 1. MANDATORY PLANNING MODE BY DEFAULT
- **Plan Before Code:** Every agent MUST formulate a detailed `implementation_plan.md` before making changes, creating migrations, or writing code.
- **Explicit Approval Required:** Stop and await user confirmation before executing any plan.
- **Temporal Reverence:** Pacing is deliberate, dignified, and anticipatory for the April 2028 horizon.

### 2. ZERO-CONTENT FRONTEND (PURE PRESENTATION SHELL)
- **No Hardcoded Domain Content:** The Next.js frontend is strictly an **infrastructure, layout, animation, and rendering shell**.
- **100% Backend-Driven:** Every statement, archetype, correspondence, dasha table, nakshatra description, essay, transit, and reflection MUST be fetched dynamically from PostgreSQL or BoltDB.
- **No Mock Fallbacks:** In loading/error states, use UI skeleton shimmers—NEVER hardcode domain copy or mock fallback text in frontend source files.

### 3. SERVER-SENT EVENTS (SSE) FOR FAST TRANSACTIONAL STREAMING
- **Native Go Event Stream:** Fast transactional, reactive, and live data must flow over **Server-Sent Events (`text/event-stream`)** via `/api/stream/events`.
- **BoltDB & Postgres Reactive Pipeline:** BoltDB updates (oracle aphorisms, associative graph discoveries, thought streams) publish to the Go SSE Hub (`internal/sse/hub.go`) for real-time distribution.
- **Frontend Reactive Hooks:** Frontend components subscribe to SSE streams via `useSSE` hooks for instant transactional UI updates without client-side polling.

### 4. RIGOROUS & EVOLVING BACKEND DATA PIPELINE
- **PostgreSQL as Source of Truth:** Core structured models, histories, essays, and cycles reside in PostgreSQL via versioned SQL migrations (`migrations/*.up.sql`).
- **BoltDB for High-Velocity & Associative Context:** BoltDB (`bbolt`) manages dynamic non-relational graph traversal, fast in-memory caches, daily oracle states, and stream buffers.
- **Unified Single Binary:** Root `ui.go` and `embed.go` bundle the static UI and migrations into a singular, highly optimized 11MB Go binary (`./mercury-dasha-server`).

### 5. MANDATORY BUILD, TEST & TASK LIVENESS PROTOCOL (CRITICAL)
- **Standardized Script Suite:** All build, test, and dev actions MUST be executed through the unified `scripts/` suite and `Makefile`:
  - `make build` (or `bash scripts/build.sh`): Runs clean, compiles static Next.js export, and produces `./mercury-dasha-server`.
  - `make dev` (or `bash scripts/dev.sh`): Launches Go on `:8080` and Next.js hot-reloading dev server on `:3000` with signal traps.
  - `make test` (or `bash scripts/test.sh`): Ephemeral test server on port `:3099`, asserts 11 core HTTP route contracts, and terminates cleanly.
  - `make run`: Directly executes standalone single binary `./mercury-dasha-server -port 3000`.
  - `make clean` (or `bash scripts/clean.sh`): Force-terminates orphaned server processes and clears lockfiles.
- **Zero Lingering Tasks Mandate:** The agent MUST ensure that all background tasks and test servers are cleanly terminated (`kill`) before completing a turn.
- **Quiescence Before User Testing:** The user will wait until there are NO active tasks in the Antigravity container prior to testing. The agent must never leave rogue processes holding the BoltDB (`data/mercury_context.db`) file lock or network ports.

---

## 2. Core Technology Stack

| Layer | Technology | Role & Details |
| :--- | :--- | :--- |
| **Primary Relational Store** | **PostgreSQL (OS Service)** | Authoritative relational backbone for all structured entities, transits, timelines, and essays. |
| **Database Migrations** | **Standard SQL Migrations** | Embedded via `//go:embed migrations/*.sql` and applied sequentially via `internal/postgres/migrator.go`. |
| **Unified Backend** | **Go 1.22 (`golang`)** | Root engine using Chi router, CORS, and native `//go:embed`. Serves both API and UI on a single port (`:3000`). |
| **Embedded Frontend** | **`ui.go` (Root)** | Embeds `frontend/out/*` via `//go:embed` with SPA fallback. |
| **Contextual & Oracle Store** | **BoltDB (`bbolt`)** | Embedded B+Tree key-value database for "The Fun Stuff": dynamic associative graph, daily oracle, and reflections (`data/mercury_context.db`). |
| **Real-Time Streaming** | **Server-Sent Events (SSE)** | Go SSE Broadcast Hub (`/api/stream/events`) for transactional push to frontend. |
| **Frontend UI Shell** | **Next.js 14 (App Router)** | TypeScript, Tailwind CSS, Lucide icons, HTML5 Canvas physics, Audio synthesis. Pure presentation shell. |
| **Infrastructure** | **Makefile & Shell** | Zero Python in infrastructure builds. Pure Go, Node/pnpm, and PostgreSQL. |

---

## 3. Directory Structure & File Map

```
/home/justin/code/mercury-dasha/
├── AGENTS.md                          # [THIS FILE] Core stack, planning mandate & agent instructions
├── README.md                          # User-facing overview & specs
├── Makefile                           # Developer commands: dev, build, run, test, clean
├── scripts/                           # Standardized developer & agent script pipelines
│   ├── clean.sh                       # Process killer and lockfile releaser
│   ├── build.sh                       # Production Next.js static build & Go binary compilation
│   ├── dev.sh                         # Live hot-reloading development launcher
│   └── test.sh                        # Automated 11-route HTTP contract assertion test suite
├── docker-compose.yml                 # Standby PostgreSQL container definition
├── mercury_foundational_statement.txt # Plaintext foundational axiom
├── embed.go                           # Root //go:embed for text statement & SQL migrations
├── ui.go                              # Root //go:embed for Next.js frontend/out distribution
├── main.go                            # HTTP server initialization, migration runner & graceful shutdown
├── migrations/                        # Versioned SQL migration files (.up.sql / .down.sql)
│   ├── 000001_create_foundations.up.sql
│   ├── 000002_create_dashas_and_nakshatras.up.sql
│   ├── 000003_create_alchemical_and_opus.up.sql
│   ├── 000004_seed_foundational_data.up.sql
│   ├── 000005_create_transitional_portal.up.sql
│   └── 000006_unify_foundations_manifesto.up.sql
├── frontend/                          # Next.js 14 App Router UI (PURE RENDERING SHELL)
│   ├── package.json
│   ├── next.config.mjs                # Static export configuration (`output: 'export'`)
│   ├── tailwind.config.ts             # Custom esoteric theme (Emerald, Quicksilver, Gold, Lead)
│   ├── src/
│   │   ├── app/page.tsx               # Master workspace coordinator
│   │   ├── features/                  # Domain-driven features (portal, astrology, audio)
│   │   ├── components/layout/         # Navbar, Footer
│   │   ├── hooks/                     # useSSE, useAudioEngine
│   │   ├── lib/                       # api.ts, utils.ts, audio/ (Web Audio 2.0 DSP)
│   │   └── types/index.ts             # Shared domain interfaces
│   └── out/                           # Static production export embedded via ui.go
├── internal/                          # High-cohesion Go packages
│   ├── api/                           # Chi router, REST handlers, SSE streaming & middleware
│   │   ├── routes.go
│   │   ├── handlers.go
│   │   └── sse_handler.go
│   ├── sse/                           # Real-time Server-Sent Events Broadcast Hub
│   │   └── hub.go
│   ├── postgres/                      # PostgreSQL client, migration engine & repository
│   │   ├── client.go
│   │   ├── migrator.go
│   │   └── repo.go
│   ├── boltdb/                        # BoltDB store, oracle engine & associative graph
│   │   ├── store.go
│   │   ├── seed.go
│   │   └── oracle.go
│   ├── models/                        # Core domain models
│   │   └── models.go
│   └── config/                        # Configuration loader (CLI flags & env vars)
│       └── config.go
└── data/
    └── mercury_context.db             # BoltDB runtime database file
```

---

## 4. Developer & Operational Workflows

### A. Building Singular Standalone Binary
```bash
make build
```
1. Builds Next.js static production export into `frontend/out/`.
2. Compiles root Go engine embedding `frontend/out/*` via `ui.go` and `migrations/*.sql` via `embed.go`.
3. Outputs **`./mercury-dasha-server`** (11MB self-contained executable).

### B. Running Standalone Binary
```bash
make run
# or: ./mercury-dasha-server -port 3000
```
- Both web UI, REST API, and SSE live streams are served on a single port (`:3000`) with zero external runtime dependencies.
