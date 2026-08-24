'use client';

import React, { useState } from "react";
import { 
  Orbit, 
  Sparkles, 
  Flame, 
  Network, 
  ScrollText, 
  ArrowLeft, 
  Layers, 
  Cpu, 
  ShieldCheck,
  Disc3
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { DashaEngine } from "@/features/astrology/DashaEngine";
import { ContextGraphExplorer } from "@/features/astrology/ContextGraphExplorer";
import { AlchemicalCrucible } from "@/features/portal/AlchemicalCrucible";
import {
  dashaOverviewData,
  nakshatrasData,
  alchemicalPrinciplesData,
  contextNodesData,
  foundationalStatementData,
} from "@/lib/data/compendium";
import { useAudioEngine } from "@/hooks/useAudioEngine";

type CompendiumTab = "dasha" | "graph" | "crucible" | "axiom";

export default function CompendiumPage() {
  const [activeTab, setActiveTab] = useState<CompendiumTab>("dasha");
  const { playUIClick } = useAudioEngine();

  const handleTabChange = (tab: CompendiumTab) => {
    playUIClick();
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-mercury-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 font-sans relative overflow-x-hidden">
      {/* Unified Top Navigation Header */}
      <Header />

      {/* Main Compendium Showcase */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 z-10 space-y-8 animate-fadeIn">
        
        {/* Hero Section */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <Orbit className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span>ESOTERIC BLUEPRINT // ASTROLOGICAL & ALCHEMICAL COMPENDIUM</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
            The Astrological & Alchemical Compendium
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
            The underlying esoteric matrix powering the Mercury Dash architecture: the 17-Year Vimshottari Mahadasha planetary transit engine, relational context graphs, real-time quicksilver fluid simulation, and the foundational Hermetic axioms.
          </p>
        </div>

        {/* Interactive Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 font-mono text-xs">
          <button
            onClick={() => handleTabChange("dasha")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "dasha"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>01. Vimshottari Dasha Engine</span>
          </button>

          <button
            onClick={() => handleTabChange("graph")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "graph"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>02. Context Knowledge Graph</span>
          </button>

          <button
            onClick={() => handleTabChange("crucible")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "crucible"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-glow-violet"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>03. Alchemical Crucible (Fluid Sim)</span>
          </button>

          <button
            onClick={() => handleTabChange("axiom")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "axiom"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>04. Foundational Axiom</span>
          </button>
        </div>

        {/* Tab Viewport */}
        <div className="min-h-[480px]">
          {activeTab === "dasha" && (
            <div className="animate-fadeIn">
              <DashaEngine
                dasha={dashaOverviewData}
                nakshatras={nakshatrasData}
              />
            </div>
          )}

          {activeTab === "graph" && (
            <div className="animate-fadeIn">
              <ContextGraphExplorer initialNodes={contextNodesData} />
            </div>
          )}

          {activeTab === "crucible" && (
            <div className="animate-fadeIn">
              <AlchemicalCrucible principles={alchemicalPrinciplesData} />
            </div>
          )}

          {activeTab === "axiom" && (
            <div className="animate-fadeIn space-y-6">
              <Panel variant="default" className="p-6 sm:p-8 space-y-6 border-slate-800">
                <div className="space-y-2 border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-400 font-semibold">{"//"} THE FOUNDATIONAL AXIOM</span>
                    <Badge variant="amber" size="xs">SEALED IN PERPETUITY</Badge>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
                    {foundationalStatementData.title}
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    Author: <span className="text-slate-200">{foundationalStatementData.author}</span>
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 font-serif text-slate-200 text-sm sm:text-base leading-relaxed italic border-l-4 border-l-amber-500">
                  &ldquo;{foundationalStatementData.statement}&rdquo;
                </div>

                {/* Archetype Tags */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono text-slate-400 tracking-wider uppercase">Archetypal Manifestations:</h3>
                  <div className="flex flex-wrap gap-2">
                    {foundationalStatementData.archetypes.map((arch, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
                        {arch}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Correspondence Grid */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-mono text-slate-400 tracking-wider uppercase">Astrological & Alchemical Correspondences:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                    {Object.entries(foundationalStatementData.correspondences).map(([key, val], idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between space-y-1">
                        <span className="text-slate-500 text-[11px]">{key}</span>
                        <span className="text-slate-200 font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>
          )}
        </div>

      </main>

      {/* Clean Minimal Footer */}
      <Footer />
    </div>
  );
}

