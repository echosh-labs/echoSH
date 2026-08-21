'use client';

import React, { useState } from "react";
import { Orbit, Clock, ShieldAlert, Sparkles, Moon, Sun, Flame, Zap } from "lucide-react";
import { DashaOverview, Nakshatra } from "@/types";

interface DashaEngineProps {
  dasha: DashaOverview | null;
  nakshatras: Nakshatra[];
}

export function DashaEngine({ dasha, nakshatras }: DashaEngineProps) {
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [selectedNakshatra, setSelectedNakshatra] = useState(0);

  const activeSub = dasha?.sub_periods?.[selectedSubIndex];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-3">
          <Orbit className="w-3.5 h-3.5 text-emerald-400" />
          <span>VEDIC JYOTISH & PLANETARY PERIODS</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-silver-gradient">
          The 17-Year Mercury Mahadasha
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mt-2">
          Under the Vimshottari Dasha system, Budha commands a 17-year cycle of intellectual mastery, speech cultivation, and alchemical synthesis.
        </p>
      </div>

      {/* Overview Card */}
      {dasha && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-100">
              The Planetary Reign of Budha
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {dasha.description}
            </p>
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
              <span className="font-bold">Mantra:</span> {dasha.mantra}
            </div>
          </div>
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Total Span</span>
              <span className="text-emerald-400 font-bold">{dasha.total_years} Solar Years</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Presiding Deity</span>
              <span className="text-slate-200">{dasha.seed_deity}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Talisman Gem</span>
              <span className="text-emerald-300 font-medium">{dasha.gemstone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sub-Periods</span>
              <span className="text-slate-200">9 Antardashas (Bhuktis)</span>
            </div>
          </div>
        </div>
      )}

      {/* 9 Antardasha Selector & Detail */}
      <div className="space-y-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          The 9 Antardashas (Sub-Periods of Mercury)
        </h3>

        {/* Antardasha Tab Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {dasha?.sub_periods?.map((sub, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSubIndex(idx)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedSubIndex === idx
                  ? "bg-slate-800 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)] font-semibold"
                  : "bg-slate-900/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="text-[10px] font-mono text-emerald-400">Phase {idx + 1}</div>
              <div className="text-xs font-medium truncate mt-0.5">{sub.sub_lord.split(" - ")[1]?.split(" ")[0]}</div>
              <div className="text-[9px] text-slate-500 mt-1">{sub.duration_months}m</div>
            </button>
          ))}
        </div>

        {/* Active Antardasha Card */}
        {activeSub && (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                  Antardasha Sub-Period
                </span>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                  {activeSub.sub_lord}
                </h4>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                Duration: <span className="text-emerald-400 font-bold">{activeSub.duration_months} Months, {activeSub.duration_days} Days</span> ({activeSub.duration_years} Years)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  Core Qualities & Manifestation
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                  {activeSub.qualities}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Psychological & Intellectual Shift
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                  {activeSub.psychological}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Material & Professional Expression
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                  {activeSub.material}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="text-xs font-mono text-emerald-300 uppercase tracking-wider font-semibold">
                  Esoteric Insight & Remedial Talisman
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                  {activeSub.esoteric} <span className="text-emerald-400 font-mono block mt-1">Remedy: {activeSub.talismanic}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* The 3 Mercurial Nakshatras */}
      <div className="space-y-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Moon className="w-4 h-4 text-emerald-400" />
          The 3 Mercurial Nakshatras (Lunar Mansions)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nakshatras.map((nak, idx) => (
            <div
              key={nak.name}
              className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-emerald-400">{nak.zodiac_span}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    Ruled by ☿
                  </span>
                </div>
                <h4 className="font-serif text-xl font-bold text-slate-100">{nak.name}</h4>
                <p className="text-xs font-serif italic text-emerald-300 mb-3">{nak.sanskrit}</p>

                <p className="text-xs text-slate-300 leading-relaxed font-light mb-4">
                  {nak.esoteric_meaning}
                </p>

                <div className="space-y-1.5 text-xs font-mono text-slate-400 border-t border-slate-800 pt-3 mb-4">
                  <div><span className="text-slate-500">Symbol:</span> {nak.symbol}</div>
                  <div><span className="text-slate-500">Deity:</span> {nak.deity}</div>
                  <div><span className="text-slate-500">Shakti:</span> {nak.shakti}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {nak.qualities?.map((q, qIdx) => (
                  <span
                    key={qIdx}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-300"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
