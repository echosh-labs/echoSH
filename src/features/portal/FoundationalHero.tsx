'use client';

import React, { useState } from "react";
import { 
  Sparkles, Copy, Check, FileText, Database, Code2, 
  Volume2, VolumeX, Shield, Feather, Orbit, Layers 
} from "lucide-react";
import { FoundationalStatement } from "@/types";

interface FoundationalHeroProps {
  statement: FoundationalStatement;
}

export function FoundationalHero({ statement }: FoundationalHeroProps) {
  const [viewMode, setViewMode] = useState<"rendered" | "raw" | "boltdb">("rendered");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(statement.statement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(statement.statement);
      utterance.rate = 0.92;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>THE SINGULAR FOUNDATIONAL AXIOM</span>
          <span className="text-emerald-500/60">•</span>
          <span className="text-slate-400">HYDRARGYRUM & BUDHA</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-silver-gradient mb-3">
          The Principle of Mercury
        </h1>
        <p className="text-slate-400 text-sm sm:text-base font-light max-w-2xl mx-auto">
          Authored by <span className="text-emerald-400 font-medium">Justin Andrew Wood</span>. Stored as raw text & indexed in <span className="text-emerald-300 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">BoltDB</span>.
        </p>
      </div>

      {/* Main Glass Parchment Card */}
      <div className="relative rounded-2xl overflow-hidden glass-panel border border-slate-700/60 shadow-2xl p-6 sm:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-8">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode("rendered")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "rendered"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              Parchment View
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                viewMode === "raw"
                  ? "bg-slate-800 text-slate-100 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              .txt File View
            </button>
            <button
              onClick={() => setViewMode("boltdb")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                viewMode === "boltdb"
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              BoltDB B+Tree Record
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSpeaking
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 animate-pulse"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
              title="Listen to recitation"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-emerald-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              {isSpeaking ? "Pause Voice" : "Recite Axiom"}
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Statement"}
            </button>
          </div>
        </div>

        {/* Content View */}
        {viewMode === "rendered" && (
          <div className="space-y-8">
            {/* The Statement Block */}
            <div className="relative p-6 sm:p-8 rounded-xl bg-slate-950/60 border border-emerald-500/20 shadow-inner">
              <span className="font-serif text-5xl sm:text-6xl text-emerald-500/20 absolute top-2 left-3 select-none">
                “
              </span>
              <p className="font-serif text-base sm:text-xl lg:text-2xl leading-relaxed text-slate-200 indent-6 font-normal tracking-wide">
                {statement.statement}
              </p>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
                <span className="text-emerald-400 font-semibold">— Justin Andrew Wood</span>
                <span className="text-slate-500">Root Node: mercury-foundational-root</span>
              </div>
            </div>

            {/* Archetypes Bar */}
            <div>
              <h3 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Presiding Archetypes & Forms
              </h3>
              <div className="flex flex-wrap gap-2">
                {statement.archetypes?.map((arch, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-all cursor-default"
                  >
                    {arch}
                  </span>
                ))}
              </div>
            </div>

            {/* Correspondences Grid */}
            <div>
              <h3 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Orbit className="w-3.5 h-3.5 text-emerald-400" />
                Mercurial Correspondences & Matrices
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {statement.correspondences &&
                  Object.entries(statement.correspondences).map(([key, value], idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                    >
                      <div className="text-[11px] font-mono text-emerald-400/90 uppercase tracking-wider">{key}</div>
                      <div className="text-xs font-medium text-slate-200 mt-1 leading-snug">{value}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === "raw" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>Source File: /home/justin/code/mercury-dasha/mercury_foundational_statement.txt</span>
              <span>Encoding: UTF-8 Plaintext</span>
            </div>
            <pre className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-emerald-800">
              {statement.statement}
            </pre>
          </div>
        )}

        {viewMode === "boltdb" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>BoltDB Bucket: [foundational] | Key: [root]</span>
              <span>Data Engine: bbolt B+Tree Key-Value</span>
            </div>
            <pre className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-normal">
              {JSON.stringify(statement, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
