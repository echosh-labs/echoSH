'use client';

import React from "react";
import { Compass, Clock, Shield, Sparkles, Anchor, BookOpen, ArrowRight, Hourglass } from "lucide-react";
import { DashaTransition } from "@/types";

interface ThresholdPortalProps {
  transition: DashaTransition | null;
}

export function ThresholdPortalView({ transition }: ThresholdPortalProps) {
  if (!transition) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      {/* Header Badge & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs font-mono">
          <Hourglass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>DASHA CHIDRA THRESHOLD</span>
          <span className="text-amber-500/60">•</span>
          <span>SATURN–JUPITER (SHANI–GURU)</span>
          <span className="text-amber-500/60">➔</span>
          <span className="text-emerald-400 font-semibold">MERCURY ({transition.target_ingress_date})</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-silver-gradient tracking-tight">
          The Great Threshold Portal
        </h2>
        <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
          {transition.theme}
        </p>
      </div>

      {/* Tri-Planetary Alchemical Bridge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Saturn 🪐 Lead & Bedrock */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-[#07090e]/90 space-y-4 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 font-serif font-bold text-xl shadow-inner">
              🪐
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
              19-YEAR MAHADASHA
            </span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-200">
              Saturn (Shani) Bedrock
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              The Forge of Karmic Endurance & Structure
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {transition.saturnine_mastery.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <Anchor className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Jupiter ♃ Royal Gold & Synthesis */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 bg-[#0d0d08]/90 space-y-4 relative overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.1)]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 font-serif font-bold text-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              ♃
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold animate-pulse">
              ACTIVE SUB-PERIOD
            </span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-200">
              Jupiter (Guru) Synthesis
            </h3>
            <p className="text-xs text-amber-400/80 font-mono mt-0.5">
              The Culminating Grace & Wisdom Distillation
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-amber-500/20">
            {transition.jupiterian_synthesis.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-amber-100/90 leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mercury ☿ Quicksilver & Awakening */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-[#050c0a]/90 space-y-4 relative overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.1)]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-serif font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              ☿
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
              DAWN: {transition.target_ingress_date}
            </span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-emerald-200">
              Mercury (Budha) Horizon
            </h3>
            <p className="text-xs text-emerald-400/80 font-mono mt-0.5">
              17 Years of Quicksilver Intellect & Vak
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-emerald-500/20">
            {transition.mercurial_readiness.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-emerald-100/90 leading-relaxed">
                <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Horizon Trajectory Bar */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              TEMPORAL HORIZON TO BUDHA MAHADASHA
            </div>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              Preparing the Sanctuary for {transition.target_ingress_date}
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
                ~{transition.months_remaining}
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Months Left</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-400">
                17 Yrs
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Incoming Reign</div>
            </div>
          </div>
        </div>

        {/* Visual Progress Track */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 flex">
            <div className="h-full bg-gradient-to-r from-slate-700 via-amber-500 to-emerald-500 rounded-full w-4/5 animate-pulse" />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>Saturn (Shani) 19-Year Foundation</span>
            <span className="text-amber-400 font-semibold">Saturn–Jupiter (Guru) Synthesis</span>
            <span className="text-emerald-400 font-semibold">April 2028: Mercury Dawn</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono italic leading-relaxed border-t border-slate-800/80 pt-4">
          “This computational grimoire (Go + PostgreSQL + BoltDB + Next.js) serves not as a hurried deployment, but as an architectural vessel consecrated during the Guru transition, ready to receive the fluid light of Mercury.”
        </p>
      </div>
    </section>
  );
}
