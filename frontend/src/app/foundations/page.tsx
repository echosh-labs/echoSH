/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  Terminal,
  ArrowUpRight,
  Cpu,
  Layers,
  Zap,
  Cloud,
  ShieldCheck,
  Archive,
  Compass,
  HeartHandshake
} from "lucide-react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import {
  intuitionVioletDrone,
  idealismCyanArpeggio,
  mercuryFundamentalBell,
} from "@/lib/audio/presets";
import { SoundBlueprint } from "@/lib/audio/types";

interface FoundationScene {
  id: number;
  stageNumber: string;
  title: string;
  subtitle: string;
  narrative: string;
  imageSrc: string;
  frequency: number;
  frequencyLabel: string;
  chakraColor: string;
  blueprint: SoundBlueprint;
}

const FOUNDATION_SCENES: FoundationScene[] = [
  {
    id: 1,
    stageNumber: "01",
    title: "Intuition",
    subtitle: "The Inner Staircase",
    narrative:
      "Our intuition helps us to form a series of steps to climb, a deep inner guidance satisfying our highest psychic self. In the stillness of inner awareness, the first harmonic resonates, opening the path of perception.",
    imageSrc: "/assets/scene1.png",
    frequency: 432,
    frequencyLabel: "432 Hz Harmonic (Violet)",
    chakraColor: "#a855f7",
    blueprint: intuitionVioletDrone,
  },
  {
    id: 2,
    stageNumber: "02",
    title: "Idealism",
    subtitle: "The Ascent of Aspiration",
    narrative:
      "Each step in turn is an ideal, ever more advanced, broadening our consciousness and preparing it for the final breakthrough. Aspiration ascends through sacred geometry, transforming raw thought into architectural purpose.",
    imageSrc: "/assets/scene2.png",
    frequency: 528,
    frequencyLabel: "528 Hz Solfeggio (Cyan)",
    chakraColor: "#06b6d4",
    blueprint: idealismCyanArpeggio,
  },
  {
    id: 3,
    stageNumber: "03",
    title: "Illumination",
    subtitle: "Radiant Consciousness",
    narrative:
      "The summit of understanding. Idealism prepares the consciousness, and Illumination follows as a radiant, unified state of being. The quicksilver mind dissolves duality into pure cosmic clarity.",
    imageSrc: "/assets/scene3.png",
    frequency: 141.27,
    frequencyLabel: "141.27 Hz Mercury Quicksilver",
    chakraColor: "#10b981",
    blueprint: mercuryFundamentalBell,
  },
];

export default function FoundationsPage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlayingHarmonic, setIsPlayingHarmonic] = useState<boolean>(false);

  const { playBlueprint, setAmbientFrequency, playUIClick } = useAudioEngine();
  const currentScene = FOUNDATION_SCENES[currentIndex];

  // Set ambient drone frequency to match active scene
  useEffect(() => {
    setAmbientFrequency(currentScene.frequency);
  }, [currentIndex, currentScene.frequency, setAmbientFrequency]);

  const handleNext = useCallback(() => {
    playUIClick();
    setCurrentIndex((prev) => (prev + 1) % FOUNDATION_SCENES.length);
  }, [playUIClick]);

  const handlePrev = useCallback(() => {
    playUIClick();
    setCurrentIndex((prev) => (prev - 1 + FOUNDATION_SCENES.length) % FOUNDATION_SCENES.length);
  }, [playUIClick]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleResonateHarmonic = () => {
    setIsPlayingHarmonic(true);
    playBlueprint(currentScene.blueprint);
    setTimeout(() => setIsPlayingHarmonic(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20">
      {/* Top Minimal Navigation Bar */}
      <header className="w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <Link
          href="/"
          onClick={playUIClick}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Portal</span>
        </Link>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>FOUNDATIONS</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400">STAGE {currentScene.stageNumber}</span>
        </div>

        <button
          onClick={handleResonateHarmonic}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono transition-all ${
            isPlayingHarmonic
              ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
              : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
          }`}
          title="Play scene tuned harmonic frequency"
        >
          <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />
          <span>Resonate ({currentScene.frequency} Hz)</span>
        </button>
      </header>

      {/* Main Cinematic Gallery Display */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Artwork Image Frame */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-md rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl group">
              <img
                src={currentScene.imageSrc}
                alt={currentScene.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Glowing Ambient Radial Glow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 blur-xl transition-all duration-700"
                style={{
                  background: `radial-gradient(circle at center, ${currentScene.chakraColor} 0%, transparent 70%)`,
                }}
              />

              {/* Stage Badge */}
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono font-medium text-slate-300">
                Stage {currentScene.stageNumber}
              </div>

              {/* Frequency Badge */}
              <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono" style={{ color: currentScene.chakraColor }}>
                {currentScene.frequencyLabel}
              </div>
            </div>
          </div>

          {/* Narrative & Editorial Story Text */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono tracking-wider uppercase text-emerald-400 font-semibold">
                  Stage {currentScene.stageNumber}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-400">
                  {currentScene.frequency} Hz
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
                {currentScene.title}
              </h1>
              <p className="text-sm font-serif italic text-slate-400 mt-1">
                {currentScene.subtitle}
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
              {currentScene.narrative}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleResonateHarmonic}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 text-xs font-mono transition-all shadow-sm"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Resonate {currentScene.title} Harmonic</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clean Step Navigation Strip */}
        <div className="mt-12 w-full max-w-md flex items-center justify-between gap-4 border-t border-slate-900 pt-6">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-2">
            {FOUNDATION_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  playUIClick();
                  setCurrentIndex(idx);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all ${
                  currentIndex === idx
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                }`}
              >
                0{scene.id}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Comprehensive Foundations & Axis Mundi Architectural Matrix */}
        <section className="mt-20 w-full max-w-5xl border-t border-slate-900 pt-16 space-y-12">
          {/* Header */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <Compass className="w-3.5 h-3.5" />
              <span>ECHO SH LABS // FOUNDATIONS & AXIS MUNDI ENGINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
              Foundations Storyboard & Engine Architecture
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-light max-w-3xl leading-relaxed">
              Operated by Echo SH Labs (echosh-labs.com). The Foundations layer serves as the narrative and philosophical core of the Mercury Dash platform, while the Axis Mundi engine forms the foundational operational infrastructure.
            </p>
          </div>

          {/* Architecture Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Storyboard Architecture */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-mono text-xs font-bold">
                    01
                  </div>
                  <h3 className="font-serif font-bold text-slate-100 text-base">
                    Storyboard Architecture
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-violet-300">
                  Tri-Partite
                </span>
              </div>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                The Foundations model establishes the three-stage ascent of conscious discernment:
              </p>
              <ul className="space-y-2 text-xs font-mono text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold">&bull;</span>
                  <span><strong className="text-slate-200">Intuition (432 Hz):</strong> The inner staircase; perception grounded in stillness.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">&bull;</span>
                  <span><strong className="text-slate-200">Idealism (528 Hz):</strong> The ascent of aspiration; structural purpose and sacred geometry.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong className="text-slate-200">Illumination (141.27 Hz):</strong> Radiant cosmic clarity; the quicksilver mind in unity.</span>
                </li>
              </ul>
            </div>

            {/* Axis Mundi Operational Engine */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                    02
                  </div>
                  <h3 className="font-serif font-bold text-slate-100 text-base">
                    Axis Mundi Core Engine
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  Zero AI Tokens
                </span>
              </div>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Axis Mundi is the autonomous background daemon driving real-time synchronization between the physical author and the agent:
              </p>
              <ul className="space-y-2 text-xs font-mono text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong className="text-slate-200">Zero-Token Ingestion:</strong> Continuous background polling of Google Keep notes using native Go routines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong className="text-slate-200">Workspace API Bridge:</strong> Domain-Wide Delegation (Keep, Docs, Sheets, Drive).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong className="text-slate-200">Dual-Mode Control:</strong> AUTO vs MANUAL mode with EXECUTE vs PENDING policy gatekeeping.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Amra Core & Technical Links Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/90 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-100 text-lg">
                    Amra Core // The Mechanics of Giving
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Future Expansion Layer &bull; Universal Value Flow
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  BoltDB Persisted
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-light leading-relaxed">
              While Mercury Dasha maintains the contextual astrological chronology and ephemeris within BoltDB for future expansions, <strong className="text-emerald-300">Amra Core</strong> defines the overarching mechanics of giving, value distribution, and reciprocal energy exchange. Together with the Foundations narrative and the Axis Mundi execution spine, the platform unifies philosophy with deterministic computation.
            </p>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/terminal"
                onClick={playUIClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono transition-all shadow-sm group"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Launch Axis Terminal</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <a
                href="/archive/axis-mundi/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono transition-all"
              >
                <Archive className="w-4 h-4 text-slate-400" />
                <span>View Axis Mundi Archive</span>
              </a>

              <a
                href="/archive/foundations/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono transition-all"
              >
                <Archive className="w-4 h-4 text-slate-400" />
                <span>View Foundations Archive</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Subtle Minimal Footer */}
      <footer className="w-full border-t border-slate-900/80 px-6 py-4 text-center text-slate-500 text-[11px] font-mono">
        Foundations Trilogy &bull; Echo SH Labs (<a href="https://echosh-labs.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline underline-offset-2">echosh-labs.com</a>) &bull; Justin Andrew Wood
      </footer>
    </div>
  );
}