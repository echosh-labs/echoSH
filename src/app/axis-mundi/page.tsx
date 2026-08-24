'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Terminal, 
  Cpu, 
  Database, 
  Workflow, 
  Radio, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  FileCode, 
  CheckCircle2, 
  ShieldAlert 
} from "lucide-react";
import { BuckyballCanvas } from "@/components/canvas/BuckyballCanvas";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function AxisMundiPage() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'mcp' | 'tui'>('architecture');

  return (
    <div className="min-h-screen bg-mercury-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 font-sans relative overflow-x-hidden">
      {/* 3D Geometric Buckyball Canvas Ambient Background */}
      <BuckyballCanvas opacity={0.28} />

      {/* Unified Top Navigation Header */}
      <Header />

      {/* Main Archival Stage */}
      <main className="flex-1 z-10 py-8">
        <PageContainer size="lg">
          <div className="space-y-12 animate-fadeIn">
            
            {/* Hero Section */}
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 font-mono text-xs text-violet-400">
                <Terminal className="w-4 h-4" />
                <span>SYSTEM ARCHIVE // ZERO-TOKEN INGESTION ENGINE</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
                Axis Mundi: A Personal Engine for Authentic Freedom
              </h1>
              <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
                Engineered to emancipate human consciousness from routine screen-time. Axis Mundi served as a high-speed, zero-token ingestion daemon in Go—passively capturing ambient voice notes from Google Keep, triaging intent into local SQLite/BoltDB registries, and exposing direct tool execution to autonomous coding agents over the Model Context Protocol (MCP).
              </p>

              {/* GitHub Link Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/echosh-labs/axis-mundi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-950/60 border border-violet-500/40 text-violet-300 hover:text-violet-100 hover:border-violet-400 hover:bg-violet-900/60 text-xs font-mono transition-all shadow-glow-violet"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>VIEW SOURCE ON GITHUB (echosh-labs/axis-mundi)</span>
                </a>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
              <button
                onClick={() => setActiveTab('architecture')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                01. Pipeline Architecture
              </button>
              <button
                onClick={() => setActiveTab('mcp')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'mcp'
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                02. MCP Tool Registry
              </button>
              <button
                onClick={() => setActiveTab('tui')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'tui'
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                03. Split-Pane Terminal TUI
              </button>
            </div>

            {/* TAB 1: ARCHITECTURE PIPELINE */}
            {activeTab === 'architecture' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Step 1 */}
                  <Panel variant="default" className="p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xs">
                        01
                      </div>
                      <h3 className="font-serif font-bold text-slate-200 text-sm">Voice Ingestion</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Ambient thoughts spoken on mobile are recorded via Gemini Mobile / Google Keep without firing high-latency LLM completions.
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
                      Zero-Token Ingest
                    </div>
                  </Panel>

                  {/* Step 2 */}
                  <Panel variant="default" className="p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs">
                        02
                      </div>
                      <h3 className="font-serif font-bold text-slate-200 text-sm">Background Daemon</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Native Go daemon polls Google Keep and Google Workspace APIs using Service Account Domain-Wide Delegation (DWD).
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40">
                      Go Poller (10s-300s)
                    </div>
                  </Panel>

                  {/* Step 3 */}
                  <Panel variant="default" className="p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-mono text-xs">
                        03
                      </div>
                      <h3 className="font-serif font-bold text-slate-200 text-sm">Gatekeeper Triage</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Actionable directives are triaged into <code className="text-emerald-300">QUEUED_FOR_AGENT</code>, while passive notes store conversational context.
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-violet-400 bg-violet-950/40 px-2 py-1 rounded border border-violet-800/40">
                      BoltDB / SQLite Core
                    </div>
                  </Panel>

                  {/* Step 4 */}
                  <Panel variant="default" className="p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs">
                        04
                      </div>
                      <h3 className="font-serif font-bold text-slate-200 text-sm">Agentic Execution</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Autonomous agents read triaged directives over JSON-RPC 2.0 MCP endpoints, compile code, and broadcast telemetry over SSE.
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/40">
                      MCP JSON-RPC Tools
                    </div>
                  </Panel>
                </div>

                {/* Conceptual Evolution Callout */}
                <Panel variant="default" className="p-6 border-slate-800">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-1">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif font-bold text-slate-100 text-base">
                        How This Evolved into Modern Antigravity Remote Interface
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
                        Axis Mundi proved that human thought could be translated directly into code actions without burning tokens in synchronous loops. Today, the direct remote AI pair-programming interface handles conversational memory, background execution, and tool coordination directly—allowing the Go daemon to be gracefully archived as a historical milestone.
                      </p>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* TAB 2: MCP TOOL REGISTRY */}
            {activeTab === 'mcp' && (
              <div className="space-y-6 animate-fadeIn">
                <p className="text-xs font-mono text-slate-400">
                  Axis Mundi exposed 5 native tools over JSON-RPC 2.0 at <code className="text-emerald-400">/api/mcp</code>, allowing any autonomous agent to query directives, update execution lifecycles, and sync Keep notes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Tool 1 */}
                  <Panel variant="default" className="p-5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold font-mono">axismundi_list_directives</span>
                      <Badge variant="slate" size="xs">READ</Badge>
                    </div>
                    <p className="text-slate-400 font-sans text-xs">
                      Returns all triaged directives filtered by status (<code className="text-slate-300">QUEUED_FOR_AGENT</code>, <code className="text-slate-300">IN_PROGRESS</code>, <code className="text-slate-300">COMPLETED</code>).
                    </p>
                    <pre className="bg-slate-950/80 p-3 rounded border border-slate-900 text-[11px] text-slate-300 overflow-x-auto">
{`{ "status": "QUEUED_FOR_AGENT", "limit": 20 }`}
                    </pre>
                  </Panel>

                  {/* Tool 2 */}
                  <Panel variant="default" className="p-5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold font-mono">axismundi_update_status</span>
                      <Badge variant="emerald" size="xs">WRITE</Badge>
                    </div>
                    <p className="text-slate-400 font-sans text-xs">
                      Mutates directive status, sets execution logs, and broadcasts live SSE notifications across the telemetry hub.
                    </p>
                    <pre className="bg-slate-950/80 p-3 rounded border border-slate-900 text-[11px] text-slate-300 overflow-x-auto">
{`{ "id": "dir-891", "status": "COMPLETED", "result": "OK" }`}
                    </pre>
                  </Panel>

                  {/* Tool 3 */}
                  <Panel variant="default" className="p-5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold font-mono">axismundi_sync_keep</span>
                      <Badge variant="cyan" size="xs">INGEST</Badge>
                    </div>
                    <p className="text-slate-400 font-sans text-xs">
                      Forces an on-demand synchronization pass against Google Keep notes without waiting for the background timer tick.
                    </p>
                    <pre className="bg-slate-950/80 p-3 rounded border border-slate-900 text-[11px] text-slate-300 overflow-x-auto">
{`{ "force_immediate": true }`}
                    </pre>
                  </Panel>

                  {/* Tool 4 */}
                  <Panel variant="default" className="p-5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold font-mono">axismundi_set_mode</span>
                      <Badge variant="violet" size="xs">CONTROL</Badge>
                    </div>
                    <p className="text-slate-400 font-sans text-xs">
                      Toggles daemon operating mode between <code className="text-violet-300">AUTO</code> (continuous background tick) and <code className="text-slate-300">MANUAL</code>.
                    </p>
                    <pre className="bg-slate-950/80 p-3 rounded border border-slate-900 text-[11px] text-slate-300 overflow-x-auto">
{`{ "mode": "AUTO", "interval_seconds": 30 }`}
                    </pre>
                  </Panel>
                </div>
              </div>
            )}

            {/* TAB 3: SPLIT-PANE TUI SIMULATOR */}
            {activeTab === 'tui' && (
              <div className="space-y-4 animate-fadeIn">
                <Panel variant="default" className="p-6 border-slate-800 bg-[#07090e] font-mono text-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Terminal className="w-4 h-4" />
                      <span className="font-bold">AXIS MUNDI TUI COMMAND CENTER</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>MODE: AUTO (30s)</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400">TICK: LIVE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left pane */}
                    <div className="border border-slate-800/80 rounded p-3 space-y-2 bg-black/40">
                      <div className="text-slate-400 font-bold text-[11px] border-b border-slate-800 pb-1">
                        TASK REGISTRY (SQLite / BoltDB)
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-slate-200">
                          <div className="flex items-center justify-between text-emerald-400">
                            <span>#directive // Storyboard Gen</span>
                            <Badge variant="emerald" size="xs">EXEC</Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Compile watercolor scenes for foundations storyline</p>
                        </div>
                        <div className="p-2 rounded bg-slate-900/40 border border-slate-800 text-slate-400">
                          <div className="flex items-center justify-between text-slate-300">
                            <span>#context // Harmonic Models</span>
                            <Badge variant="slate" size="xs">PASSIVE</Badge>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">Mercury synesthetic scale frequencies (432Hz root)</p>
                        </div>
                      </div>
                    </div>

                    {/* Right pane */}
                    <div className="border border-slate-800/80 rounded p-3 space-y-2 bg-black/40">
                      <div className="text-slate-400 font-bold text-[11px] border-b border-slate-800 pb-1">
                        TELEMETRY EVENT STREAM (SSE)
                      </div>
                      <div className="space-y-1 font-mono text-[10px] text-slate-400">
                        <p className="text-slate-500">2026-08-21 01:20:00 [POLLER] Keep sync pass executed (0 notes modified)</p>
                        <p className="text-emerald-400">2026-08-21 01:20:30 [BROADCAST] tick=29s next_pass in 1s</p>
                        <p className="text-violet-400">2026-08-21 01:20:31 [MCP_CALL] tools/list requested by autonomous agent</p>
                        <p className="text-slate-300">2026-08-21 01:20:32 [SSE_HUB] Dispatched state telemetry to 1 client</p>
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

          </div>
        </PageContainer>
      </main>

      {/* Clean Minimal Footer */}
      <Footer />
    </div>
  );
}

