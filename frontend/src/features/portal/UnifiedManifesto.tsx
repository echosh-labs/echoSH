'use client';

import React from "react";
import { Sparkles, Scroll, Play, ShieldAlert, Sun, BookOpen } from "lucide-react";
import { ManifestoSection } from "@/types";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { mercuryFundamentalBell, alchemicalTransmutationDrone } from "@/lib/audio/presets";

interface UnifiedManifestoProps {
  sections: ManifestoSection[];
}

export function UnifiedManifesto({ sections }: UnifiedManifestoProps) {
  const { playBlueprint } = useAudioEngine();

  if (!sections || sections.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-sm tracking-wider uppercase font-semibold">
              {"//"} Sacred Doctrine
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-hermetic-gold/10 text-hermetic-gold border border-hermetic-gold/30">
              Corpus Hermeticum & The Quicksilver Symphony
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mt-1">
            The Fundamental Manifesto
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-light">
            The philosophical doctrine uniting the Foundations trilogy, the 17-Year Mercury Mahadasha, and the synesthetic vibration of code.
          </p>
        </div>

        <button
          onClick={() => playBlueprint(alchemicalTransmutationDrone, "Manifesto Chime")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-hermetic-gold/40 text-hermetic-gold text-xs font-mono transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        >
          <Play className="w-3.5 h-3.5 fill-hermetic-gold text-hermetic-gold" />
          <span>Resonate Manifesto Chime</span>
        </button>
      </div>

      {/* Manifesto Sections as an Illuminated Digital Scroll */}
      <div className="space-y-6">
        {sections.map((sec) => (
          <div
            key={sec.id}
            className="rounded-3xl bg-mercury-900/40 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group hover:border-hermetic-gold/40 transition-all"
          >
            {/* Corner Decorative Accent */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Section 0{sec.section_number}
                </span>
                <span className="text-xs font-serif italic text-hermetic-gold font-semibold tracking-wider">
                  {sec.latin_maxim}
                </span>
              </div>
              <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-hermetic-gold transition-colors" />
            </div>

            <h3 className="text-xl font-serif font-bold text-slate-100 mb-3 group-hover:text-emerald-300 transition-colors">
              {sec.section_title}
            </h3>

            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              {sec.body_content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}