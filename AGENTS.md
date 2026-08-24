# AGENTS.md - Echo SH Labs Architecture & Agent Operating Standards

> **Organization:** [Echo SH Labs](https://echosh-labs.com) (`echosh-labs.com`)  
> **Project:** Mercury Dash Dossier (Architect's Portfolio & Web Audio Synthesis)  
> **Author & Architect:** Justin Andrew Wood  
> **Repository:** `/home/justin/code/mercury-dasha`

---

## 🏛️ CORE ARCHITECTURAL LAWS (NON-NEGOTIABLE)

### 1. MANDATORY PLANNING MODE BY DEFAULT
- **Plan Before Code:** Every agent MUST formulate a detailed `implementation_plan.md` before making architectural changes or writing code.
- **Explicit Approval Required:** Stop and await user confirmation before executing any plan.
- **Organizational Governance:** Echo SH Labs is the primary operational and business entity. All forward-facing branding and documentation adhere to `echosh-labs.com`.

### 2. PURE STATIC ARCHITECTURE (NO BACKEND)
- **Zero Runtime Dependencies:** This repository is a 100% static Next.js frontend export. There is no Go backend, no PostgreSQL, and no BoltDB.
- **Static Asset Deployment:** The platform is compiled via `npm run build` and synced directly to Google Cloud Storage (`gs://echosh-labs.com`).
- **No Background Daemons:** Do not attempt to run background Go servers, SSE streams, or Axis Mundi daemons in this repository. They have been archived and removed from the active stack.

### 3. THE DOSSIER NARRATIVE
- **Purpose:** The platform serves as a high-level "Architect's Dossier" for Justin Andrew Wood. It is an experiential CV bridging zero-token enterprise infrastructure with sensory-rich web audio synthesis.
- **The Foundations:** The narrative follows a 3-stage visual and philosophical model: Intuition (The Void/Spark) ➔ Idealism (Structure/Architecture) ➔ Illumination (Autonomy/Action).

### 4. SYNESTHETIC AUDIO ENGINE
- **Core Mechanic:** The site heavily features procedural Web Audio 2.0 DSP synthesis.
- **Implementation:** React hooks (`useAudioEngine`) interact with low-level AudioContext oscillators, FM synthesis, and Karplus-Strong string models. Keep this code clean, performant, and free of memory leaks.

### 5. MANDATORY LOCAL DEV SERVER SPIN-UP & MANUAL TESTING PROTOCOL
- **Live Local Availability:** At the conclusion of every iterative development step, the agent MUST automatically launch the Next.js development server on port 3000 (`npm run dev -- -p 3000` as a background daemon process).
- **Manual Verification Step:** The user must be provided with direct localhost URLs to visually inspect and test the newly implemented features before proceeding to the next sequential step.

---

## 2. Core Technology Stack

| Layer | Technology | Role & Details |
| :--- | :--- | :--- |
| **Organization & Business** | **Echo SH Labs** | Entity stewarding platform, branding, and operations (`echosh-labs.com`). |
| **Frontend UI Shell** | **Next.js 14 (App Router)** | TypeScript, Tailwind CSS, Lucide icons, React Web Audio 2.0. |
| **Deployment & Hosting** | **Google Cloud Storage** | Pure static hosting via `gs://echosh-labs.com` synced with `gcloud storage rsync`. |
| **Styling & UI** | **Tailwind + Glassmorphism** | Deep space, minimalist glass aesthetics (`bg-mercury-950`, emerald accents). |

---

## 3. Directory Structure & File Map

```
/home/justin/code/mercury-dasha/
├── AGENTS.md                          # [THIS FILE] Echo SH Labs operating standards & agent instructions
├── README.md                          # Comprehensive documentation & architecture specs
├── scripts/                           # Standardized developer pipelines
│   └── deploy.sh                      # Production GCS baseline deployment sync
├── src/                               # Next.js 14 App Router Source
│   ├── app/
│   │   ├── page.tsx                   # The Architect's Dossier (Home Portal)
│   │   ├── foundations/page.tsx       # Static Foundations Storyboard
│   │   └── layout.tsx                 # Root layout & providers
│   ├── features/                      # Domain-driven features (e.g., audio studio)
│   ├── components/                    # Reusable UI primitives (Panel, Badge, Button)
│   ├── hooks/                         # React hooks (`useAudioEngine`)
│   └── lib/                           # Utility functions and audio synthesis engines
├── public/                            # Static images and SVGs
├── next.config.mjs                    # Next.js config (configured for `output: 'export'`)
├── tailwind.config.ts                 # Custom design system colors and animations
└── package.json                       # React/Next.js dependencies
```

---

## 4. Developer & Operational Workflows

### A. Local Development Server
```bash
npm run dev
```
Spins up the Next.js hot-reloading development server on `localhost:3000`.

### B. Building the Static Export
```bash
npm run build
```
Outputs the static HTML/CSS/JS bundles into the `./out` directory.

### C. Deploying to Production (Google Cloud Storage)
```bash
bash scripts/deploy.sh
```
Executes the Next.js build and aggressively syncs the `./out` directory to `gs://echosh-labs.com`, wiping any legacy unmatched files in the root bucket.
