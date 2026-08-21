'use client';

import React from "react";
import { Sparkles, Compass, Sun, Moon, Feather, BookOpen, CheckCircle2 } from "lucide-react";
import { OracleContemplation } from "@/types";

interface MercurialOracleProps {
  oracle: OracleContemplation | null;
}

export function MercurialOracleView({ oracle }: MercurialOracleProps) {
  if (!oracle) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>BOLTDB CONTEXTUAL ORACLE & APHORISMS</span>
          <span className="text-emerald-500/60">•</span>
          <span className="text-slate-400">{oracle.day_of_week}, {oracle.date}</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-silver-gradient">
          Daily Mercurial Contemplation
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          Seeded dynamically in BoltDB: algorithmic daily aphorisms and meditative exercises aligned with Mercury's volatile intellect.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Theme Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
              Hermetic Axiom of the Day
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              {oracle.theme}
            </h3>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            Deity Alignment: <span className="text-emerald-300 font-semibold">{oracle.presiding_deity}</span>
          </div>
        </div>

        {/* The Aphorism */}
        <div className="p-6 sm:p-8 rounded-xl bg-slate-950/80 border border-emerald-500/20 shadow-inner relative">
          <span className="font-serif text-5xl text-emerald-500/20 absolute top-2 left-3 select-none">“</span>
          <p className="font-serif text-base sm:text-xl text-slate-200 indent-6 leading-relaxed italic">
            {oracle.aphorism}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-emerald-400">{oracle.hermetic_key}</span>
            <span className="text-slate-500">BoltDB [oracle_daily] Bucket</span>
          </div>
        </div>

        {/* Daily Exercise & Harmonic Tuning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Daily Practical Contemplation Exercise
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {oracle.daily_exercise}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Mercurial Harmonic Frequencies
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {oracle.mercurial_tune?.map((tune, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300"
                >
                  ⚡ {tune}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
