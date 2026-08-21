# AGENTS.md - Echo SH Labs Architecture & Agent Operating Standards

> **Organization:** [Echo SH Labs](https://echosh-labs.com) (`echosh-labs.com`)  
> **Project:** Mercury Dash Platform (Amra Core & Foundations Engine)  
> **Author & Architect:** Justin Andrew Wood  
> **Core Engine:** Axis Mundi (Zero-Token Google Workspace / Keep Ingestion & MCP Daemon)  
> **Repository:** `/home/justin/code/mercury-dasha`

---

## 🏛️ CORE ARCHITECTURAL LAWS (NON-NEGOTIABLE)

### 1. MANDATORY PLANNING MODE BY DEFAULT
- **Plan Before Code:** Every agent MUST formulate a detailed `implementation_plan.md` before making changes, creating migrations, or writing code.
- **Explicit Approval Required:** Stop and await user confirmation before executing any plan.
- **Organizational Governance:** Echo SH Labs is the primary operational and business entity. All forward-facing branding and documentation adhere to `echosh-labs.com`.

### 2. ZERO-CONTENT FRONTEND (PURE PRESENTATION SHELL)
- **No Hardcoded Domain Content:** The Next.js frontend is strictly an **infrastructure, layout, animation, and rendering shell**.
- **100% Backend-Driven:** Every statement, storyboard narrative, archetype, correspondence, dasha table, essay, transit, and directive MUST be fetched dynamically from PostgreSQL, BoltDB, or Axis Mundi APIs.
- **No Mock Fallbacks:** In loading/error states, use UI skeleton shimmers—NEVER hardcode domain copy or mock fallback text in frontend source files.

### 3. SERVER-SENT EVENTS (SSE) FOR FAST TRANSACTIONAL STREAMING
- **Native Go Event Stream:** Fast transactional, reactive, and live telemetry flows over **Server-Sent Events (`text/event-stream`)** via `/api/stream/events`.
- **Reactive Stream Distribution:** Real-time countdown ticks (`axismundi_tick`), ingest notifications (`axismundi_ingested`), execute alerts (`axismundi_execute_alert`), and state changes broadcast immediately to connected UI clients.
- **Frontend Reactive Hooks:** Frontend components subscribe to SSE streams via `useSSE` hooks for instant UI updates without client-side polling.

### 4. AXIS MUNDI ZERO-TOKEN OPERATIONAL ENGINE & MCP DAEMON
- **Zero-Token Passive Ingestion:** Axis Mundi runs in the background as a native Go daemon, polling Google Keep notes and Google Workspace APIs without consuming AI tokens.
- **Dual-Mode System Control:**
  - **`AUTO`:** Continuous background polling with dynamic intervals (`10s`, `30s`, `60s`, `120s`, `300s`) and live 1-second countdown ticks.
  - **`MANUAL`:** On-demand synchronization via REST/MCP or keyboard shortcut `[S]`.
- **Auto-Ingest Gatekeeper Policy:**
  - **`EXECUTE`:** Voice notes or directives tagged with `#amra-exec` or tagged intent are automatically triaged and queued for the agent (`QUEUED_FOR_AGENT`).
  - **`PENDING`:** Non-executable notes are stored as passive context (`PASSIVE_CONTEXT`).
- **Model Context Protocol (MCP):** JSON-RPC 2.0 endpoint at `/api/mcp` exposes tools (`axismundi_list_directives`, `axismundi_update_status`, `axismundi_sync_keep`, `axismundi_set_mode`, `axismundi_delete_directive`) to autonomous coding agents.

### 5. RIGOROUS DATA PERSISTENCE PIPELINE
- **PostgreSQL as Relational Backbone:** Core structured models, historical essays, and cycles reside in PostgreSQL via versioned SQL migrations (`migrations/*.up.sql`).
- **BoltDB for Context Graph & Ephemeris:** BoltDB (`bbolt`) manages dynamic non-relational graph traversal, fast in-memory caches, daily oracle states, and directives (`data/mercury_context.db` and `data/axismundi.db`).
- **Unified Single Binary:** Root `ui.go` and `embed.go` bundle the static UI and migrations into a singular, highly optimized Go binary (`./mercury-dasha-server`).

### 6. MANDATORY BUILD, TEST & TASK LIVENESS PROTOCOL (CRITICAL)
- **Standardized Script Suite:** All build, test, and dev actions MUST be executed through the unified `scripts/` suite and `Makefile`:
  - `make build` (or `bash scripts/build.sh`): Compiles static Next.js export and produces singular `./mercury-dasha-server`.
  - `make dev` (or `bash scripts/dev.sh`): Launches Go on `:8080` and Next.js hot-reloading dev server on `:3000`.
  - `make test` (or `bash scripts/test.sh`): Ephemeral test server on port `:3099`, asserts 22 core HTTP route contracts and lifecycle mutations, and terminates cleanly.
  - `make run`: Directly executes standalone single binary `./mercury-dasha-server -port 3000`.
  - `make clean` (or `bash scripts/clean.sh`): Force-terminates orphaned server processes and clears lockfiles.
- **Zero Lingering Tasks Mandate:** The agent MUST ensure that all background tasks and test servers are cleanly terminated (`kill`) before completing a turn.
- **Quiescence Before User Testing:** The user will wait until there are NO active background tasks prior to testing.

---

## 2. Core Technology Stack

| Layer | Technology | Role & Details |
| :--- | :--- | :--- |
| **Organization & Business** | **Echo SH Labs** | Entity stewarding platform, branding, and operations (`echosh-labs.com`). |
| **Unified Backend** | **Go 1.22 (`golang`)** | Root engine using Chi router, CORS, SSE Hub, and native `//go:embed`. |
| **Operational Engine** | **Axis Mundi Daemon** | Zero-token Google Keep API syncer, Google Workspace DWD, and MCP server. |
| **Context & Directives Store** | **BoltDB (`bbolt`)** | Embedded B+Tree key-value database for directives, knowledge graph, and oracle. |
| **Relational Store** | **PostgreSQL** | Authoritative relational backbone for structured entities and essays. |
| **Real-Time Streaming** | **Server-Sent Events (SSE)** | Go SSE Broadcast Hub (`/api/stream/events`) for transactional push to frontend. |
| **Frontend UI Shell** | **Next.js 14 (App Router)** | TypeScript, Tailwind CSS, Lucide icons, 3D Buckyball Wireframe, Web Audio 2.0 DSP. |
| **Terminal Route** | **`/terminal` TUI** | Dedicated Axis Mundi terminal user interface with keyboard shortcuts. |
| **Foundations Route** | **`/foundations` Storyboard** | Foundations 3-stage visual narrative (Intuition, Idealism, Illumination). |

---

## 3. Directory Structure & File Map

```
/home/justin/code/mercury-dasha/
├── AGENTS.md                          # [THIS FILE] Echo SH Labs operating standards & agent instructions
├── README.md                          # Comprehensive documentation & architecture specs
├── Makefile                           # Developer commands: dev, build, run, test, clean
├── scripts/                           # Standardized developer & agent script pipelines
│   ├── clean.sh                       # Process killer and lockfile releaser
│   ├── build.sh                       # Production Next.js static build & Go binary compilation
│   ├── dev.sh                         # Live hot-reloading development launcher
│   └── test.sh                        # Automated 22-route HTTP contract assertion test suite
├── embed.go                           # Root //go:embed for text statement & SQL migrations
├── ui.go                              # Root //go:embed for Next.js frontend/out distribution
├── main.go                            # HTTP server initialization, migration runner & graceful shutdown
├── migrations/                        # Versioned SQL migration files (.up.sql / .down.sql)
├── frontend/                          # Next.js 14 App Router UI (PURE RENDERING SHELL)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Echo SH Labs Mercury Dash Home Portal
│   │   │   ├── foundations/page.tsx   # Foundations Storyboard & Engine Architecture
│   │   │   └── terminal/page.tsx      # Axis Mundi Interactive TUI Console
│   │   ├── features/                  # Domain-driven features (portal, astrology, audio)
│   │   ├── components/layout/         # Navbar, Footer
│   │   ├── hooks/                     # useSSE, useAudioEngine
│   │   └── lib/                       # api.ts, utils.ts, audio/ (Web Audio 2.0 DSP)
│   └── out/                           # Static production export embedded via ui.go
├── internal/                          # High-cohesion Go packages
│   ├── api/                           # Chi router, REST handlers, SSE streaming & middleware
│   ├── axismundi/                     # Axis Mundi engine: Google Keep syncer, MCP server, models, store
│   │   ├── daemon.go                  # Daemon coordinator & lifecycle
│   │   ├── keep_syncer.go             # Google Keep background polling & 1s tick broadcaster
│   │   ├── mcp.go                     # Model Context Protocol JSON-RPC 2.0 tools
│   │   ├── models.go                  # Directive & control models
│   │   ├── store.go                   # BoltDB directives storage
│   │   ├── handlers.go                # REST handlers for directives & modes
│   │   └── workspace.go               # Google Workspace auth & DWD client
│   ├── sse/                           # Real-time Server-Sent Events Broadcast Hub
│   ├── postgres/                      # PostgreSQL client, migration engine & repository
│   ├── boltdb/                        # BoltDB store, oracle engine & associative graph
│   └── models/                        # Core domain models
└── data/                              # Runtime BoltDB database files
```

---

## 4. Developer & Operational Workflows

### A. Running Full Integration Tests
```bash
make test
```
Executes Go race tests, Vitest frontend tests, TypeScript typechecking, ESLint validation, and 22 ephemeral HTTP contract assertions.

### B. Building Singular Standalone Binary
```bash
make build
```
Outputs `./mercury-dasha-server` (self-contained executable with embedded Next.js assets).

### C. Running Standalone Binary
```bash
make run
# or: ./mercury-dasha-server -port 3000
```
- Both web UI, REST API, and SSE live streams are served on a single port (`:3000`) with zero external runtime dependencies.
