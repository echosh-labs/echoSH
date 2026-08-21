# Mercury Dasha (Budha Mahadasha & The Quicksilver Principle)

> **Author:** Justin Andrew Wood  
> **Tech Stack:** Next.js (App Router), Go 1.22 (`bbolt`, `pgx`, `chi`), PostgreSQL, BoltDB Key-Value Context Engine

A full-stack esoteric digital compendium, interactive astrological engine, and lived chronicle celebrating the archetype, alchemy, and 17-year planetary period of **Mercury (Budha / Hermes / Quicksilver)**.

---

## The Singular Foundational Statement on Mercury

> *"Mercury is the universal principle of mediation, volatility, and discernment—the divine quicksilver (Hydrargyrum) that bridges soul and substance, cosmos and consciousness. Embodying Budha in the celestial court, Hermes Trismegistus in the esoteric tradition, and Thoth in the primordial script, Mercury governs Buddhi (the discriminating intellect), Vak (the sacred potency of speech), trade, synthesis, and the transmutation of raw perception into living wisdom. As the fluid middle term of the Tria Prima reconciling sulfurous fire with saline earth, Mercury transits effortlessly between realms as the eternal psychopomp—unbound by fixed form, master of boundary-crossing, and catalyst of perpetual awakening. In the 17-year crucible of the Mahadasha and throughout the life and opus of Justin Andrew Wood, Mercury manifests as the relentless drive to decode the architecture of reality: an alchemy of mind where language becomes talisman, thought becomes structure, and experience is distilled into the enduring light of truth."*

---

## Architecture & Data Stores

1. **Foundational Text File (`mercury_foundational_statement.txt`)**:
   - The singular definitional axiom stored as readable plaintext and bundled for static inspection.
2. **BoltDB (`backend/data/mercury_context.db`)**:
   - High-performance embedded B+Tree key-value database storing the contextual knowledge graph, dynamic relative context relationships, 17-year Dasha cycles, and the author's opus.
3. **PostgreSQL (`docker-compose.yml`)**:
   - Relational infrastructure layer for transits, ephemeris logs, and chronological persistence.
4. **Go Backend (`backend/`)**:
   - High-concurrency REST API built with Chi router, BoltDB engine, and pgx client.
5. **Next.js Frontend (`frontend/`)**:
   - Modern esoteric user interface with Tailwind CSS, Lucide icons, interactive Quicksilver fluid canvas, and speech synthesis recitation.

---

## Quick Start

### 1. Start Infrastructure (Postgres)
```bash
docker compose up -d
```

### 2. Start Go Backend
```bash
cd backend
go run cmd/server/main.go
# API runs on http://localhost:8080
```

### 3. Start Next.js Frontend
```bash
cd frontend
pnpm dev
# Web app runs on http://localhost:3000
```

---

## REST API Endpoints

- `GET /api/health`: Health check and datastore status (BoltDB + Postgres).
- `GET /api/statement`: Returns the singular foundational statement, archetypes, and correspondences.
- `GET /api/statement/raw`: Returns the raw plain text file content.
- `GET /api/context`: Lists all contextual knowledge nodes from BoltDB.
- `GET /api/context/{key}`: Returns a specific node and resolves its relative context graph.
- `GET /api/dasha`: Returns the 17-year Mercury Mahadasha and 9 Antardashas.
- `GET /api/nakshatras`: Returns the 3 Mercurial Nakshatras (*Ashlesha*, *Jyeshtha*, *Revati*).
- `GET /api/alchemical`: Returns the Tria Prima and Quicksilver alchemical properties.
- `GET /api/author`: Returns Justin Andrew Wood's bio, treatises, and chronological milestones.

---

© 2026 Justin Andrew Wood. “As above, so below; as within, so without.”
