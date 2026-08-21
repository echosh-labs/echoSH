'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Activity, Archive, Waves, Volume2, VolumeX, ArrowUpRight, Music2 } from "lucide-react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { SynestheticAudioConsole } from "@/features/audio/SynestheticAudioConsole";

export default function HomePage() {
  const [showAudioStudio, setShowAudioStudio] = useState<boolean>(false);
  const {
    isMuted,
    toggleMute,
    isAmbientActive,
    toggleAmbient,
    playUIClick,
  } = useAudioEngine();

  const handleToggleStudio = () => {
    playUIClick();
    setShowAudioStudio(!showAudioStudio);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20">
      {/* Top Quiet Minimal Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-serif font-bold text-sm">
            ☿
          </div>
          <div>
            <span className="font-serif tracking-widest font-bold text-slate-200 text-sm">
              FOUNDATIONS
            </span>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">ECHO SH • JUSTIN ANDREW WOOD</p>
          </div>
        </div>

        {/* Minimal Audio Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toggleAmbient(432)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all ${
              isAmbientActive
                ? "bg-violet-950/80 border-violet-500/60 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)] animate-pulse"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Continuous Generative Ambient Drone (432 Hz)"
          >
            <Waves className={`w-3 h-3 ${isAmbientActive ? "text-violet-400" : "text-slate-500"}`} />
            <span>{isAmbientActive ? "AMBIENT: 432 HZ" : "AMBIENT"}</span>
          </button>

          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-full border transition-all ${
              isMuted
                ? "bg-rose-950/80 border-rose-500/50 text-rose-400"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-emerald-300"
            }`}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Minimalist Center Stage */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
        {!showAudioStudio ? (
          <div className="space-y-12 animate-fadeIn">
            {/* Minimal Typographic Hero */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-emerald-400">
                <Sparkles className="w-3 h-3" />
                <span>TRI-PARTITE CONSCIOUSNESS & ACOUSTIC SYNTHESIS</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
                The Architecture of Intuition & Sound.
              </h1>
              <p className="text-slate-400 text-base sm:text-lg font-light max-w-2xl leading-relaxed">
                A contemplative exploration of cognitive evolution, procedural Web Audio 2.0 synthesis, and visual narrative architecture.
              </p>
            </div>

            {/* Clean Navigation Menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {/* Option 01: Foundations Route */}
              <Link
                href="/foundations"
                onClick={playUIClick}
                className="group p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-medium">01 / STORY & ARTWORK</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  Foundations Journey
                </h2>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Enter the upgraded visual story engine. Experience high-resolution scene artwork with tuned harmonic frequencies (432 Hz, 528 Hz, 141.27 Hz).
                </p>
              </Link>

              {/* Option 02: Synesthetic Audio Studio */}
              <button
                onClick={handleToggleStudio}
                className="group p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all text-left space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-medium">02 / DSP SYNTHESIS</span>
                  <Music2 className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  Synesthetic Studio
                </h2>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Explore FM synthesis, physical Karplus-Strong plucked strings, planetary celestial octaves, and interactive keyboard synesthesia.
                </p>
              </button>

              {/* Option 03: Axis Mundi TUI Console */}
              <Link
                href="/terminal"
                onClick={playUIClick}
                className="group p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-medium">03 / AMRA CORE TUI</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  Axis Mundi Terminal
                </h2>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Interactive TUI command center. Monitor zero-token background Keep ingestion, live SSE telemetry streams, and 3D Buckyball dynamics.
                </p>
              </Link>

              {/* Option 04: Legacy Archives */}
              <a
                href="/archive/axis-mundi/"
                className="group p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">04 / PRESERVED ARCHIVES</span>
                  <Archive className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
                  Historical Archives
                </h2>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Access the original 2025 Axis Mundi workspace research archive and standalone Foundations story engine.
                </p>
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">{"//"} ACOUSTIC LABORATORY</span>
                <h2 className="text-2xl font-serif font-bold text-slate-100">Synesthetic Audio Console</h2>
              </div>
              <button
                onClick={handleToggleStudio}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-all"
              >
                Close Studio
              </button>
            </div>

            <SynestheticAudioConsole />
          </div>
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div>© 2026 Justin Andrew Wood • echoSH Labs</div>
        <div className="flex items-center gap-4">
          <Link href="/foundations" className="hover:text-emerald-400 transition-colors">Foundations</Link>
          <a href="/archive/axis-mundi/" className="hover:text-emerald-400 transition-colors">Axis Mundi</a>
          <a href="/archive/foundations/" className="hover:text-emerald-400 transition-colors">Archive</a>
        </div>
      </footer>
    </div>
  );
}