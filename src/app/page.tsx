'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowUpRight, Music2, Waves, Volume2, VolumeX, Code2, Network } from "lucide-react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { SynestheticAudioConsole } from "@/features/audio/SynestheticAudioConsole";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  const [showAudioStudio, setShowAudioStudio] = useState<boolean>(false);
  const { playUIClick } = useAudioEngine();

  const handleToggleStudio = () => {
    playUIClick();
    setShowAudioStudio(!showAudioStudio);
  };

  return (
    <div className="min-h-screen bg-mercury-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 font-sans">
      {/* Unified Top Navigation Header */}
      <Header />

      {/* Main Minimalist Center Stage */}
      <main className="flex-1 flex flex-col justify-center py-10">
        <PageContainer size="md" glow="dual">
          {!showAudioStudio ? (
            <div className="space-y-12 animate-fadeIn">
              {/* Minimal Typographic Hero */}
              <div className="space-y-4">
                <Badge variant="slate" size="sm" className="gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>THE UNCREATED SPARK // CREATIVITY IN ACTION</span>
                </Badge>
                <h1 className="text-4xl sm:text-6xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
                  I build autonomous, enterprise-grade systems that resonate.
                </h1>
                <p className="text-slate-400 text-base sm:text-lg font-light max-w-2xl leading-relaxed">
                  Welcome to my dossier. I am a Systems Architect specializing in bridging the gap between rigorous, zero-token infrastructure (like the Axis Mundi engine) and deeply creative, sensory-rich human interfaces. I architect systems that do more than execute—they tell a story.
                </p>
              </div>

              {/* The Dossier Navigation (Capabilities) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                
                {/* 01 / Synesthetic Audio */}
                <button
                  onClick={handleToggleStudio}
                  className="group block text-left h-full"
                >
                  <Panel variant="default" interactive className="p-6 h-full flex flex-col space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-emerald-400 font-medium tracking-wider">01 / CORE MECHANIC</span>
                      <Music2 className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <h2 className="text-lg font-serif font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      Synesthetic Audio Engine
                    </h2>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      Launch the interactive Web Audio DSP synthesizer. A foundational storytelling mechanism exploring algorithmic harmonics.
                    </p>
                  </Panel>
                </button>

                {/* 02 / Axis Mundi */}
                <Link
                  href="/axis-mundi"
                  onClick={playUIClick}
                  className="group block h-full"
                >
                  <Panel variant="default" interactive className="p-6 h-full flex flex-col space-y-4 hover:border-violet-500/50 hover:shadow-glow-violet">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-violet-400 font-medium tracking-wider">02 / INFRASTRUCTURE</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <h2 className="text-lg font-serif font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                      Axis Mundi Engine
                    </h2>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      A robust, zero-token autonomous orchestrator driving Google Workspace telemetrics. (Archived Architecture).
                    </p>
                  </Panel>
                </Link>

                {/* 03 / Foundations Narrative */}
                <Link
                  href="/foundations"
                  onClick={playUIClick}
                  className="group block h-full"
                >
                  <Panel variant="default" interactive className="p-6 h-full flex flex-col space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-emerald-400 font-medium tracking-wider">03 / PHILOSOPHY</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <h2 className="text-lg font-serif font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      Foundations Storyline
                    </h2>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      The philosophical model underpinning the architecture: Intuition, Idealism, and Illumination mapped to astrological timelines.
                    </p>
                  </Panel>
                </Link>

                {/* 04 / echoSH Progenitor */}
                <Link
                  href="/echosh"
                  onClick={playUIClick}
                  className="group block h-full"
                >
                  <Panel variant="default" interactive className="p-6 h-full flex flex-col space-y-4 hover:border-cyan-500/50 hover:shadow-glow-cyan">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-cyan-400 font-medium tracking-wider">04 / ORIGIN ARCHIVE</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <h2 className="text-lg font-serif font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      echoSH Progenitor
                    </h2>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      The original 2025 Electron.js synesthetic terminal environment that birthed the procedural audio architecture.
                    </p>
                  </Panel>
                </Link>

              </div>

              {/* 05 / Featured Astrological & Alchemical Compendium */}
              <Link
                href="/compendium"
                onClick={playUIClick}
                className="group block"
              >
                <Panel variant="default" interactive className="p-6 border-amber-500/30 hover:border-amber-400/60 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-amber-950/20 shadow-glow-amber/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-medium tracking-wider">05 / ESOTERIC MATRIX</span>
                        <Badge variant="amber" size="xs">INTERACTIVE ENGINES</Badge>
                      </div>
                      <h2 className="text-xl font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        The Astrological & Alchemical Compendium
                      </h2>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Explore the 17-Year Vimshottari Mahadasha planetary transit engine, Nakshatras, relational context knowledge graphs, and real-time quicksilver fluid dynamics.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform self-end sm:self-center">
                      <span>ENTER COMPENDIUM</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Panel>
              </Link>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{"//"} ACOUSTIC LABORATORY</span>
                  <h2 className="text-2xl font-serif font-bold text-slate-100">Synesthetic Audio Console</h2>
                </div>
                <Button
                  onClick={handleToggleStudio}
                  variant="secondary"
                  size="sm"
                >
                  Close Studio
                </Button>
              </div>

              <SynestheticAudioConsole />
            </div>
          )}
        </PageContainer>
      </main>

      {/* Clean Minimal Footer */}
      <Footer />
    </div>
  );
}