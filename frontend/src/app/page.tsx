'use client';

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { FoundationalHero } from "@/components/FoundationalHero";
import { ThresholdPortalView } from "@/components/ThresholdPortal";
import { MercurialOracleView } from "@/components/MercurialOracle";
import { ContextGraphExplorer } from "@/components/ContextGraphExplorer";
import { DashaEngine } from "@/components/DashaEngine";
import { AlchemicalCrucible } from "@/components/AlchemicalCrucible";
import { AuthorOpusView } from "@/components/AuthorOpus";
import { SynestheticAudioConsole } from "@/components/SynestheticAudioConsole";
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
  fetchTransitionPortal
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
  DashaTransition
} from "@/types";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string>("threshold");
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

  // Initial dynamic fetch
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
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isSSEConnected={isSSEConnected} 
      />

      <main className="flex-1 pb-16 space-y-12">
        {activeSection === "threshold" && transition && (
          <ThresholdPortalView transition={transition} />
        )}

        {activeSection === "foundational" && statement && (
          <FoundationalHero statement={statement} />
        )}

        {activeSection === "synesthetic-audio" && (
          <SynestheticAudioConsole />
        )}

        {activeSection === "oracle" && oracle && (
          <MercurialOracleView oracle={oracle} />
        )}

        {activeSection === "context-graph" && (
          <ContextGraphExplorer initialNodes={contextNodes} />
        )}

        {activeSection === "dasha-engine" && dasha && (
          <DashaEngine dasha={dasha} nakshatras={nakshatras} />
        )}

        {activeSection === "alchemical" && (
          <AlchemicalCrucible principles={principles} />
        )}

        {activeSection === "author-opus" && authorOpus && (
          <AuthorOpusView opus={authorOpus} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-mercury-950/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-slate-300 font-semibold">Mercury Dasha</span> • Authored by{" "}
            <span className="text-emerald-400">Justin Andrew Wood</span>
          </div>
          <div>
            Current Cycle: <span className="text-amber-400 font-semibold">Saturn–Jupiter</span> ➔ Target: <span className="text-emerald-400 font-semibold">April 2028 (Mercury Dawn)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600">“As above, so below”</span>
            <span className="text-slate-700">•</span>
            <a 
              href="/archive/axis-mundi/" 
              className="text-slate-400 hover:text-emerald-400 transition-colors underline decoration-slate-800 hover:decoration-emerald-500/50"
              title="Preserved Axis Mundi & Foundations Archives"
            >
              echoSH Archive
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
