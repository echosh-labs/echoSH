'use client';

import React, { useState, useEffect } from "react";
import { Navbar, Workspace } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Feature Components
import { ThresholdPortalView } from "@/features/portal/ThresholdPortal";
import { FoundationalHero } from "@/features/portal/FoundationalHero";
import { AlchemicalCrucible } from "@/features/portal/AlchemicalCrucible";
import { AuthorOpusView } from "@/features/portal/AuthorOpus";

import { DashaEngine } from "@/features/astrology/DashaEngine";
import { MercurialOracleView } from "@/features/astrology/MercurialOracle";
import { ContextGraphExplorer } from "@/features/astrology/ContextGraphExplorer";

import { SynestheticAudioConsole } from "@/features/audio/SynestheticAudioConsole";

import { useSSE } from "@/hooks/useSSE";
import {
  fetchHealth,
  fetchFoundationalStatement,
  fetchContextNodes,
  fetchDashaOverview,
  fetchNakshatras,
  fetchAlchemicalPrinciples,
  fetchAuthorOpus,
  fetchDailyOracle,
  fetchTransitionPortal,
} from "@/lib/api";
import {
  HealthStatus,
  FoundationalStatement,
  ContextNode,
  DashaOverview,
  Nakshatra,
  AlchemicalPrinciple,
  AuthorOpus,
  OracleContemplation,
  DashaTransition,
} from "@/types";

export default function HomePage() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>("portal");
  const [portalSection, setPortalSection] = useState<"threshold" | "axiom" | "crucible" | "opus">("threshold");
  const [astroSection, setAstroSection] = useState<"dasha" | "oracle" | "graph">("dasha");

  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [statement, setStatement] = useState<FoundationalStatement | null>(null);
  const [transition, setTransition] = useState<DashaTransition | null>(null);
  const [contextNodes, setContextNodes] = useState<ContextNode[]>([]);
  const [dasha, setDasha] = useState<DashaOverview | null>(null);
  const [nakshatras, setNakshatras] = useState<Nakshatra[]>([]);
  const [principles, setPrinciples] = useState<AlchemicalPrinciple[]>([]);
  const [authorOpus, setAuthorOpus] = useState<AuthorOpus | null>(null);
  const [oracle, setOracle] = useState<OracleContemplation | null>(null);

  // Real-time Server-Sent Events stream hook
  const { isConnected: isSSEConnected, lastEvent } = useSSE("/api/stream/events");

  // Initial dynamic data fetch
  useEffect(() => {
    fetchHealth().then(setHealth);
    fetchFoundationalStatement().then(setStatement);
    fetchTransitionPortal().then(setTransition);
    fetchContextNodes().then(setContextNodes);
    fetchDashaOverview().then(setDasha);
    fetchNakshatras().then(setNakshatras);
    fetchAlchemicalPrinciples().then(setPrinciples);
    fetchAuthorOpus().then(setAuthorOpus);
    fetchDailyOracle().then(setOracle);
  }, []);

  // Reactive updates from live SSE stream
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "oracle_pulse" && lastEvent.payload) {
      setOracle(lastEvent.payload);
    }
  }, [lastEvent]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar
        health={health}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        isSSEConnected={isSSEConnected}
      />

      <main className="flex-1 pb-16 space-y-8">
        {/* Workspace 1: Portal & Philosophy */}
        {activeWorkspace === "portal" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Sub-Navigation Pills */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                onClick={() => setPortalSection("threshold")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  portalSection === "threshold"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                2028 Threshold Portal
              </button>
              <button
                onClick={() => setPortalSection("axiom")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  portalSection === "axiom"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                Foundational Axiom
              </button>
              <button
                onClick={() => setPortalSection("crucible")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  portalSection === "crucible"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                Alchemical Crucible
              </button>
              <button
                onClick={() => setPortalSection("opus")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  portalSection === "opus"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                Justin Andrew Wood (Opus)
              </button>
            </div>

            {/* Sub-Section Content */}
            {portalSection === "threshold" && transition && (
              <ThresholdPortalView transition={transition} />
            )}
            {portalSection === "axiom" && statement && (
              <FoundationalHero statement={statement} />
            )}
            {portalSection === "crucible" && (
              <AlchemicalCrucible principles={principles} />
            )}
            {portalSection === "opus" && authorOpus && (
              <AuthorOpusView opus={authorOpus} />
            )}
          </div>
        )}

        {/* Workspace 2: Mercurial Engine */}
        {activeWorkspace === "astrology" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Sub-Navigation Pills */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                onClick={() => setAstroSection("dasha")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  astroSection === "dasha"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                17-Year Dasha Chronology
              </button>
              <button
                onClick={() => setAstroSection("oracle")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  astroSection === "oracle"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                Mercurial Oracle
              </button>
              <button
                onClick={() => setAstroSection("graph")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  astroSection === "graph"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                BoltDB Context Graph
              </button>
            </div>

            {/* Sub-Section Content */}
            {astroSection === "dasha" && dasha && (
              <DashaEngine dasha={dasha} nakshatras={nakshatras} />
            )}
            {astroSection === "oracle" && oracle && (
              <MercurialOracleView oracle={oracle} />
            )}
            {astroSection === "graph" && (
              <ContextGraphExplorer initialNodes={contextNodes} />
            )}
          </div>
        )}

        {/* Workspace 3: Synesthetic Sound Studio */}
        {activeWorkspace === "audio" && (
          <div className="pt-4">
            <SynestheticAudioConsole />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}