'use client';

import React, { useState } from "react";
import { Sparkles, ArrowRight, Play, Compass, Eye, ShieldCheck } from "lucide-react";
import { FoundationsStage } from "@/types";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { intuitionVioletDrone, idealismCyanArpeggio, mercuryFundamentalBell } from "@/lib/audio/presets";

interface FoundationsJourneyProps {
  stages: FoundationsStage[];
}

export function FoundationsJourney({ stages }: FoundationsJourneyProps) {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const { playBlueprint } = useAudioEngine();

  if (!stages || stages.length === 0) return null;

  const activeStage = stages[activeStageIndex] || stages[0];

  const handleStageSelect = (index: number) => {
    setActiveStageIndex(index);
    const selected = stages[index];
    if (selected.stage_number === 1) {
      playBlueprint(intuitionVioletDrone, selected.title);
    } else if (selected.stage_number === 2) {
      playBlueprint(idealismCyanArpeggio, selected.title);
    } else {
      playBlueprint(mercuryFundamentalBell, selected.title);
    }
  };

  const handlePlayActiveFrequency = () => {
    if (activeStage.stage_number === 1) {
      playBlueprint(intuitionVioletDrone, activeStage.title);
    } else if (activeStage.stage_number === 2) {
      playBlueprint(idealismCyanArpeggio, activeStage.title);
    } else {
      playBlueprint(mercuryFundamentalBell, activeStage.title);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-sm tracking-wider uppercase font-semibold">
              // The Mythos of Foundations
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/30">
              Tripartite Consciousness Staircase
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mt-1">
            The Ascending Staircase of Consciousness
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-light">
            Ascend the tripartite pathway of cognitive evolution: from subtle inner guidance (Intuition), through soaring philosophical will (Idealism), to radiant quicksilver awareness (Illumination).
          </p>
        </div>

        <button
          onClick={handlePlayActiveFrequency}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 text-xs font-mono transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        >
          <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
          <span>Resonate Harmonic ({activeStage.frequency_hz} Hz)</span>
        </button>
      </div>

      {/* 3-Stage Interactive Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stages.map((stage, idx) => {
          const isActive = activeStageIndex === idx;
          return (
            <button
              key={stage.id}
              onClick={() => handleStageSelect(idx)}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                isActive
                  ? "bg-slate-900/90 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                  : "bg-mercury-900/30 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Top Accent Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all"
                style={{ backgroundColor: stage.chakra_color }}
              />

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Stage 0{stage.stage_number}
                </span>
                <span
                  className="text-xs font-mono font-semibold"
                  style={{ color: stage.chakra_color }}
                >
                  {stage.frequency_hz} Hz
                </span>
              </div>

              <h3 className="text-base font-serif font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                {stage.title.split(":")[0]}
              </h3>
              <p className="text-xs text-slate-400 font-light mt-1 line-clamp-1">
                {stage.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Stage Deep Display */}
      <div className="rounded-3xl bg-mercury-900/40 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        {/* Glowing Background Chakra Aura */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20 transition-all duration-700"
          style={{ backgroundColor: activeStage.chakra_color }}
        />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                // Stage 0{activeStage.stage_number} Manifestation
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-100 mt-0.5">
                {activeStage.title}
              </h3>
              <p className="text-sm font-serif italic text-emerald-300/90 mt-0.5">
                {activeStage.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acoustic Key: {activeStage.frequency_hz} Hz Harmonic</span>
            </div>
          </div>

          {/* Narrative Prose */}
          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            {activeStage.narrative}
          </p>

          {/* Aesthetic Cybernetic Atmosphere */}
          <div className="p-4 rounded-xl bg-mercury-950/80 border border-slate-800/80 font-mono text-xs text-slate-400 flex items-start gap-3">
            <Eye className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-300 font-semibold block mb-0.5">Aesthetic Atmosphere & Prompt:</span>
              <span className="text-slate-400 font-light">{activeStage.aesthetic_theme}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}