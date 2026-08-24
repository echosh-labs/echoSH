/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Mic,
  Music2,
  Code2,
  Compass,
  Layers,
  Palette
} from "lucide-react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import {
  intuitionVioletDrone,
  idealismCyanArpeggio,
  mercuryFundamentalBell,
  alchemicalTransmutationDrone
} from "@/lib/audio/presets";
import { SoundBlueprint } from "@/lib/audio/types";
import { FoundationsStage } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function getSoundBlueprintForStage(stageNum: number, blueprintId?: string): SoundBlueprint {
  if (stageNum === 1 || blueprintId === "intuition-violet-drone") {
    return intuitionVioletDrone;
  }
  if (stageNum === 2 || blueprintId === "idealism-cyan-arpeggio") {
    return idealismCyanArpeggio;
  }
  if (stageNum === 3 || blueprintId === "mercury-fundamental-bell") {
    return mercuryFundamentalBell;
  }
  return alchemicalTransmutationDrone;
}

const staticStages: (FoundationsStage & { imageSrc: string; prompt: string })[] = [
  {
    id: "stage-1",
    stage_number: 1,
    title: "Intuition: The Inner Staircase",
    subtitle: "The Void & Psychic Guidance",
    narrative: "Our intuition forms a series of subtle steps to climb—a deep inner guidance satisfying our highest psychic self. Before form or code exists, the uncreated spark resonates as raw potential, waiting for the architect to give it shape.",
    prompt: "Sleek cybernetic figure standing at the base of a glowing neon staircase, soft neon violet aura, projecting faint holographic glyphs into deep moody indigo space.",
    aesthetic_theme: "minimalist-violet",
    chakra_color: "#a855f7",
    frequency_hz: 432,
    harmonic_blueprint_id: "intuition-violet-drone",
    imageSrc: "/assets/scene1.png"
  },
  {
    id: "stage-2",
    stage_number: 2,
    title: "Idealism: The Ascent of Aspiration",
    subtitle: "Architecture & Frameworks",
    narrative: "Each step in turn becomes an ideal—ever more advanced, broadening our consciousness and preparing it for breakthrough. Here, the Architect converts ephemeral voice directives into rigid structures, enterprise chassis, and resilient pipelines.",
    prompt: "Sleek cybernetic figure climbing a high glowing neon staircase towards a soaring futuristic light architecture, bright cyan lines, glowing orange ember shadows.",
    aesthetic_theme: "structured-cyan",
    chakra_color: "#06b6d4",
    frequency_hz: 528,
    harmonic_blueprint_id: "idealism-cyan-arpeggio",
    imageSrc: "/assets/scene2.png"
  },
  {
    id: "stage-3",
    stage_number: 3,
    title: "Illumination: Radiant Consciousness",
    subtitle: "Autonomy & Cosmic Alignment",
    narrative: "The summit of understanding. Idealism prepares the consciousness, and Illumination follows as a radiant, unified state of being. The system awakens into complete autonomy—executing workflows seamlessly without continuous human drag.",
    prompt: "A figure at the summit of a high neon structure, consciousness expanding as a brilliant golden and peach watercolor nebula in deep space-age cosmic harmony.",
    aesthetic_theme: "radiant-gold",
    chakra_color: "#f59e0b",
    frequency_hz: 639,
    harmonic_blueprint_id: "mercury-fundamental-bell",
    imageSrc: "/assets/scene3.png"
  },
  {
    id: "stage-4",
    stage_number: 4,
    title: "Genesis Workshop: Grounded Action",
    subtitle: "Physical Craftsmanship & Tangible Reality",
    narrative: "Ethereal architecture is meaningless without physical grounding. In the physical workshop—sorting parts, clearing workspaces, and building tangible chassis—the ethereal concepts of AI, astrology, and code become real-world artifacts.",
    prompt: "A grounded workshop environment bathed in warm ambient emerald lighting, tools organized, workbench cleared for creative execution and physical fabrication.",
    aesthetic_theme: "grounded-emerald",
    chakra_color: "#10b981",
    frequency_hz: 741,
    harmonic_blueprint_id: "alchemical-drone",
    imageSrc: "/assets/garage_cleanup.png"
  }
];

export default function FoundationsPage() {
  const stages = staticStages;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlayingHarmonic, setIsPlayingHarmonic] = useState<boolean>(false);

  const { playBlueprint, setAmbientFrequency, playUIClick } = useAudioEngine();

  const currentStage = stages[currentIndex];
  const blueprint = currentStage
    ? getSoundBlueprintForStage(currentStage.stage_number, currentStage.harmonic_blueprint_id)
    : intuitionVioletDrone;

  // Set ambient drone frequency to match active scene
  useEffect(() => {
    if (currentStage?.frequency_hz) {
      setAmbientFrequency(currentStage.frequency_hz);
    }
  }, [currentIndex, currentStage?.frequency_hz, setAmbientFrequency]);

  const handleNext = useCallback(() => {
    playUIClick();
    setCurrentIndex((prev) => (prev + 1) % stages.length);
  }, [playUIClick, stages.length]);

  const handlePrev = useCallback(() => {
    playUIClick();
    setCurrentIndex((prev) => (prev - 1 + stages.length) % stages.length);
  }, [playUIClick, stages.length]);

  const handleSelectStage = useCallback((index: number) => {
    playUIClick();
    setCurrentIndex(index);
  }, [playUIClick]);

  // Keyboard navigation: Arrows + Numbers 1-4 + Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "1") handleSelectStage(0);
      if (e.key === "2") handleSelectStage(1);
      if (e.key === "3") handleSelectStage(2);
      if (e.key === "4") handleSelectStage(3);
      if (e.key === " ") {
        e.preventDefault();
        handleResonateHarmonic();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleSelectStage]);

  const handleResonateHarmonic = () => {
    if (!currentStage) return;
    setIsPlayingHarmonic(true);
    playBlueprint(blueprint, currentStage.title);
    setTimeout(() => setIsPlayingHarmonic(false), 2000);
  };

  return (
    <div className="min-h-screen bg-mercury-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 font-sans relative overflow-x-hidden">
      {/* Unified Top Navigation Header */}
      <Header />

      {/* Main Storyboard Showcase */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-center items-center z-10 space-y-12">
        
        {/* Gallery Display Frame */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
          
          {/* Left Column: Artwork Image with Dynamic Chakra Glow */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-lg rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl group">
              <img
                src={currentStage.imageSrc}
                alt={currentStage.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Dynamic Chromatic Radial Ambient Glow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25 blur-2xl transition-all duration-700"
                style={{
                  background: `radial-gradient(circle at center, ${currentStage.chakra_color} 0%, transparent 70%)`,
                }}
              />

              {/* Stage Number Badge */}
              <div className="absolute top-4 left-4">
                <Badge variant="slate" size="sm" className="backdrop-blur-md bg-slate-950/80 border-slate-700/60">
                  Stage 0{currentStage.stage_number} of 04
                </Badge>
              </div>

              {/* Frequency Harmonic Badge */}
              <div
                className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-mono font-bold tracking-wider"
                style={{ color: currentStage.chakra_color }}
              >
                {currentStage.frequency_hz} Hz Harmonic
              </div>
            </div>

            {/* Stage Selector Thumbnails Strip */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-lg mt-4">
              {stages.map((stage, idx) => (
                <button
                  key={stage.id}
                  onClick={() => handleSelectStage(idx)}
                  className={`relative rounded-xl overflow-hidden border transition-all aspect-video group ${
                    idx === currentIndex
                      ? "border-emerald-400 ring-2 ring-emerald-500/30 scale-[1.02] shadow-lg"
                      : "border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600"
                  }`}
                >
                  <img
                    src={stage.imageSrc}
                    alt={stage.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-1 left-1.5 text-[9px] font-mono text-slate-200 font-bold drop-shadow">
                    0{stage.stage_number}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Editorial & Narrative Text */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono tracking-wider uppercase font-semibold" style={{ color: currentStage.chakra_color }}>
                  {"//"} STAGE 0{currentStage.stage_number}
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-xs font-mono text-slate-400">{currentStage.subtitle}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 leading-tight">
                {currentStage.title}
              </h1>
            </div>

            {/* Narrative Body */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm space-y-3">
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                Narrative Intent
              </span>
              <p className="text-slate-300 text-sm font-light leading-relaxed">
                {currentStage.narrative}
              </p>
            </div>

            {/* Prompt & Audio Blueprint Info */}
            <div className="p-4 rounded-xl bg-black/40 border border-slate-800/60 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  <span>VISUAL MOTIF</span>
                </span>
                <span className="text-slate-500">{currentStage.aesthetic_theme}</span>
              </div>
              <p className="text-[11px] text-slate-400 italic font-sans border-l-2 border-slate-700 pl-2.5 py-0.5">
                &ldquo;{currentStage.prompt}&rdquo;
              </p>
            </div>

            {/* Interactive Navigation & Resonate Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleResonateHarmonic}
                variant={isPlayingHarmonic ? "primary" : "secondary"}
                size="sm"
                className={`font-mono text-xs flex-1 ${isPlayingHarmonic ? "animate-pulse shadow-glow-emerald" : ""}`}
                iconLeft={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                {isPlayingHarmonic ? "Resonating..." : `Resonate (${currentStage.frequency_hz} Hz)`}
              </Button>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all"
                  title="Previous Stage [Left Arrow]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all"
                  title="Next Stage [Right Arrow]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Keyboard Hint */}
            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
              <span>KEYS:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">←</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">→</kbd>
              <span>Browse</span>
              <span>&bull;</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">1-4</kbd>
              <span>Jump</span>
              <span>&bull;</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Space</kbd>
              <span>Resonate</span>
            </div>
          </div>
        </div>

        {/* The Voice-to-Structure Storytelling Thesis */}
        <div className="w-full space-y-6 pt-8 border-t border-slate-900">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Mic className="w-4 h-4" />
              <span>THE ARCHITECTURAL THESIS // VOICE-TO-STRUCTURE ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              How Spoken Intent Transforms into Living Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
              Foundations was created on a radical premise: human speech is the highest-bandwidth medium for creative intent. By capturing voice without token fatigue, we translate raw words into watercolor storyboards, harmonic frequencies, and compiled software systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Pillar 1 */}
            <Panel variant="default" className="p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Mic className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-slate-200 text-sm">01. Voice Capture & Triage</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Ambient speech recorded naturally on mobile is parsed without friction, extracting creative story concepts, architectural schemas, and systemic directives.
              </p>
            </Panel>

            {/* Pillar 2 */}
            <Panel variant="default" className="p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Music2 className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-slate-200 text-sm">02. Harmonic Synesthesia</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Every narrative chapter is tuned to an exact mathematical frequency (432 Hz, 528 Hz, 639 Hz, 741 Hz), bridging visual art with procedural Web Audio DSP synthesis.
              </p>
            </Panel>

            {/* Pillar 3 */}
            <Panel variant="default" className="p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-slate-200 text-sm">03. Software Construction</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Narrative stages do not remain static drawings—they compile directly into production-ready web pages, telemetry streams, and autonomous software structures.
              </p>
            </Panel>
          </div>

          {/* GitHub Link Card */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-300">
                Explore the Foundations Orchestration Hub on GitHub
              </span>
            </div>
            <a
              href="https://github.com/echosh-labs/foundations"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
            >
              <span>echosh-labs/foundations</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </main>

      {/* Clean Minimal Footer */}
      <Footer />
    </div>
  );
}

