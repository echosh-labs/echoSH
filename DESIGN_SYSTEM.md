# Echo SH Labs // Mercury Dash Design System & Route Strategy

> **Organization:** [Echo SH Labs](https://echosh-labs.com) (`echosh-labs.com`)  
> **Author & Architect:** Justin Andrew Wood  
> **Repository:** `/home/justin/code/mercury-dasha`

---

## 🌌 1. Design System Philosophy & Core Laws

1. **Zero-Content Presentation Shell (Law #2):**
   - The frontend is strictly an infrastructure, layout, animation, and rendering shell.
   - 100% of domain narratives, astrological tables, and directives stream dynamically from backend APIs (Go, PostgreSQL, BoltDB, Axis Mundi).
   - In async loading states, **never** hardcode domain copy or mock fallback text—use `<Skeleton>`, `<SkeletonCard>`, `<SkeletonText>`, or `<SkeletonBadge>`.

2. **Unified Surface & Glow Hierarchy:**
   - Deep cosmic void base (`bg-mercury-950: #05070a` / `bg-mercury-900: #090d14`).
   - Refracted glass panels (`glass-panel`, `glass-panel-elevated`, `glass-panel-sunken`).
   - Distinct elemental accent glows:
     - **Quicksilver (`quicksilver` / `silver`):** `#e2e8f0`, `shadow-glow-silver` — Intellect, logic, metallic sheen.
     - **Emerald (`emerald`):** `#10b981`, `shadow-glow-emerald` — Vitality, Budha, active SSE telemetry, live states.
     - **Hermetic Gold (`hermetic` / `amber`):** `#f59e0b`, `shadow-glow-amber` — Solar wisdom, Jupiter transitions, execute alerts.
     - **Ether Violet (`ether` / `violet`):** `#a855f7`, `shadow-glow-violet` — 432 Hz ambient harmonic drone, intuition, notifications.
     - **Luna Cyan (`luna` / `cyan`):** `#06b6d4`, `shadow-glow-cyan` — 528 Hz Solfeggio, telemetry clarity, workspace items.

---

## 🎨 2. Design Tokens & Utilities

### Typography Scales & Gradients
```tsx
// Serif Headers (Cinzel / Classic Alchemy)
<h1 className="font-serif text-3xl sm:text-5xl font-bold text-silver-gradient">
  Title Here
</h1>

// Available Gradients:
// - text-silver-gradient
// - text-emerald-gradient
// - text-gold-gradient
// - text-cyan-gradient
// - text-violet-gradient
// - text-rose-gradient

// Monospace Badges & Data
<span className="font-mono text-xs text-emerald-400">STAGE 01</span>
```

### Glass Panels
```tsx
import { Panel, PanelHeader, PanelTitle, PanelContent, PanelFooter } from "@/components/ui/Panel";

<Panel variant="default" glow>
  <PanelHeader>
    <PanelTitle>Panel Heading</PanelTitle>
  </PanelHeader>
  <PanelContent>
    <p>Dynamic Content Stream</p>
  </PanelContent>
</Panel>

// Variants: default, elevated, sunken, emerald, violet, amber, cyan, silver, tui
```

---

## 🧩 3. Component Toolkit Reference (`@/components/ui`)

### Button (`Button.tsx`)
```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary" size="md">Save Directive</Button>
<Button variant="tui" size="xs">RUN [S]</Button>
<Button variant="ambient" size="sm">432 Hz Ambient</Button>
```

### Badge (`Badge.tsx`) & Keycap (`Keycap.tsx`)
```tsx
import { Badge } from "@/components/ui/Badge";
import { Keycap } from "@/components/ui/Keycap";

<Badge variant="emerald" size="sm" dot pulseDot>LIVE STREAM</Badge>
<Badge variant="violet" size="xs">STAGE 01</Badge>
<Keycap variant="amber">ESC</Keycap>
```

### Status Indicators (`StatusIndicator.tsx`)
```tsx
import { SSEStatusIndicator, ModeStatusBadge, PolicyStatusBadge } from "@/components/ui/StatusIndicator";

<SSEStatusIndicator isConnected={isSSEConnected} />
<ModeStatusBadge mode="AUTO" onClick={handleToggleMode} />
<PolicyStatusBadge policy="EXECUTE" onClick={handleTogglePolicy} />
```

### Skeleton Loading Shimmers (`Skeleton.tsx`)
```tsx
import { Skeleton, SkeletonCard, SkeletonText, SkeletonBadge } from "@/components/ui/Skeleton";

// While loading backend payload:
{isLoading ? (
  <SkeletonCard />
) : (
  <ActualDataView data={data} />
)}
```

### Dialog / Modal (`Dialog.tsx`)
```tsx
import { Dialog } from "@/components/ui/Dialog";

<Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Inspector" variant="tui">
  <div>Modal Content</div>
</Dialog>
```

### Tabs (`Tabs.tsx`)
```tsx
import { Tabs } from "@/components/ui/Tabs";

<Tabs
  tabs={[
    { id: "overview", label: "Overview", icon: LayersIcon },
    { id: "logs", label: "Logs", badgeCount: 4 },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

---

## 🧭 4. Strategy for Building Future Routes

Every future route (e.g. `/amra`, `/ephemeris`, `/archive`, `/oracle`) should adhere to the following architecture:

### Standard Route Structure Pattern:
```tsx
// src/app/your-route/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import { RouteHeader } from "@/components/layout/RouteHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Footer } from "@/components/layout/Footer";
import { Panel, SkeletonCard, Badge } from "@/components/ui";

export default function YourRoutePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/your-endpoint")
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-mercury-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20">
      <RouteHeader
        title="YOUR ROUTE"
        category="ECHO SH LABS"
        returnHref="/"
      />

      <main className="flex-1 flex flex-col justify-center">
        <PageContainer size="lg" glow="dual">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Dynamic Presentation Content */}
            </div>
          )}
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
}
```

---

## 🛠️ 5. Build, Test & Integration Validation

Always run the full test suite before committing changes:
```bash
make test # Ephemeral port 3099 contract test + Go race test + Vitest + Typecheck + ESLint
```
