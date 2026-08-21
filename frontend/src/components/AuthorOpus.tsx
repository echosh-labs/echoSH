'use client';

import React, { useState } from "react";
import { Feather, BookOpen, Clock, Code2, Sparkles, CheckCircle2 } from "lucide-react";
import { AuthorOpus } from "@/types";

interface AuthorOpusProps {
  opus: AuthorOpus | null;
}

export function AuthorOpusView({ opus }: AuthorOpusProps) {
  const [selectedEssay, setSelectedEssay] = useState(0);

  if (!opus) return null;

  const essay = opus.essays?.[selectedEssay];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      {/* Header & Bio */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-3">
          <Feather className="w-3.5 h-3.5 text-emerald-400" />
          <span>AUTHOR & LIVING OPUS</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-silver-gradient mb-3">
          Justin Andrew Wood
        </h2>
        <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-light">
          {opus.bio}
        </p>
      </div>

      {/* Essays Reader */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Authored Treatises & Essays
          </h3>
        </div>

        {/* Essay Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {opus.essays?.map((e, idx) => (
            <button
              key={e.slug}
              onClick={() => setSelectedEssay(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                selectedEssay === idx
                  ? "bg-slate-800 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {e.title}
            </button>
          ))}
        </div>

        {/* Active Essay Container */}
        {essay && (
          <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-slate-700/60 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <span>{essay.theme}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{essay.date}</span>
              </div>
              <h4 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">{essay.title}</h4>
              <p className="text-xs sm:text-sm text-emerald-300/90 font-light mt-2 italic">
                “{essay.abstract}”
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-200 font-light">
              <p>{essay.content}</p>
            </div>

            {/* Key Insights */}
            <div>
              <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Key Axiomatic Insights
              </h5>
              <div className="space-y-2">
                {essay.key_insights?.map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chronological Planetary Resonance Timeline */}
      <div className="space-y-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          Chronological Planetary Milestones
        </h3>

        <div className="space-y-4">
          {opus.chronology?.map((event, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4 justify-between sm:items-center"
            >
              <div>
                <div className="text-xs font-mono text-emerald-400 font-semibold">{event.period}</div>
                <h4 className="font-serif text-lg font-bold text-slate-100 mt-0.5">{event.title}</h4>
                <p className="text-xs text-slate-300 mt-1 font-light">{event.description}</p>
              </div>
              <div className="sm:text-right shrink-0 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
                <div className="text-slate-400">Planetary Cycle</div>
                <div className="text-emerald-300 font-medium">{event.cycle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
