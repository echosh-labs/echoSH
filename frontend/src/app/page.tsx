'use client';

import React, { useState, useEffect } from "react";
import { Navbar, Workspace } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Feature Components
import { UnifiedManifesto } from "@/features/portal/UnifiedManifesto";
import { FoundationsJourney } from "@/features/portal/FoundationsJourney";
import { ThresholdPortalView } from "@/features/portal/ThresholdPortal";
import { FoundationalHero } from "@/features/portal/FoundationalHero";
import { AlchemicalCrucible } from "@/features/portal/AlchemicalCrucible";
import { AuthorOpusView } from "@/features/portal/AuthorOpus";

import { DashaEngine } from "@/features/astrology/DashaEngine";
import { MercurialOracleView } from "@/features/astrology/MercurialOracle";
import { ContextGraphExplorer } from "@/features/astrology/ContextGraphExplorer";

import { SynestheticAudioConsole } from "@/features/audio/SynestheticAudioConsole";

import { useSSE } from "@/hooks/useSSE";
import { useAudioEngine } from "@/hooks/useAudioEngine";
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
  fetchFoundationsNarrative,
  fetchManifesto,
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
  FoundationsStage,
  ManifestoSection,
} from "@/types";

export default function HomePage() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>("portal");
  const [portalSection, setPortalSection] = useState<"manifesto" | "foundations" | "threshold" | "axiom" | "crucible" | "opus">("manifesto");
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
  const [stages, setStages] = useState<FoundationsStage[]>([]);
  const [manifestoSections, setManifestoSections] = useState<ManifestoSection[]>([]);

  // Audio Engine Hook for Pervasive Acoustic Modulation
  const { playUIClick, playUIChime, setAmbientFrequency } = useAudioEngine();

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
    fetchFoundationsNarrative().then(setStages);
    fetchManifesto().then(setManifestoSections);
  }, []);

  // Update ambient frequency when workspace shifts
  useEffect(() => {
    if (activeWorkspace === "portal") {
      setAmbientFrequency(432); // Violet Intuitive Bed
    } else if (activeWorkspace === "astrology") {
      setAmbientFrequency(141.27); // Mercury Planetary Frequency
    } else if (activeWorkspace === "audio") {
      setAmbientFrequency(528); // Solfeggio Ascent
    }
  }, [activeWorkspace, setAmbientFrequency]);

  // Reactive updates from live SSE stream + Audio Alerts
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "oracle_pulse" && lastEvent.payload) {
      setOracle(lastEvent.payload);
      playUIChime(741); // Epistemic chime on live oracle pulse
    }
  }, [lastEvent, playUIChime]);

  const handlePortalSectionChange = (sec: "manifesto" | "foundations" | "threshold" | "axiom" | "crucible" | "opus") => {
    playUIClick();
    setPortalSection(sec);
  };

  const handleAstroSectionChange = (sec: "dasha" | "oracle" | "graph") => {
    playUIClick();
    setAstroSection(sec);
  };

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
                onClick={() => handlePortalSectionChange("manifesto")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  portalSection === "manifesto"
                    ? "bg-slate-800 text-hermetic-gold border border-hermetic-gold/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                Fundamental Manifesto
              </button>
              <button
                onClick={() => handlePortalSectionChange("foundations")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  portalSection === "foundations"
                    ? "bg-slate-800 text-violet-300 border border-violet-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                Foundations Staircase
              </button>
              <button
                onClick={() => handlePortalSectionChange("threshold")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  portalSection === "threshold"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                2028 Threshold Portal
              </button>
              <button
                onClick={() => handlePortalSectionChange("axiom")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  portalSection === "axiom"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                Foundational Axiom
              </button>
              <button
                onClick={() => handlePortalSectionChange("crucible")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  portalSection === "crucible"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                Alchemical Crucible
              </button>
              <button
                onClick={() => handlePortalSectionChange("opus")}
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
            {portalSection === "manifesto" && (
              <UnifiedManifesto sections={manifestoSections} />
            )}
            {portalSection === "foundations" && (
              <FoundationsJourney stages={stages} />
            )}
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
                onClick={() => handleAstroSectionChange("dasha")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  astroSection === "dasha"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                17-Year Dasha Chronology
              </button>
              <button
                onClick={() => handleAstroSectionChange("oracle")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  astroSection === "oracle"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                Mercurial Oracle
              </button>
              <button
                onClick={() => handleAstroSectionChange("graph")}
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