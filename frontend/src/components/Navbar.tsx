'use client';

import React from "react";
import { Sparkles, Database, Terminal, ShieldCheck, Radio } from "lucide-react";
import { HealthStatus } from "@/types";

interface NavbarProps {
  health: HealthStatus | null;
  activeSection: string;
  setActiveSection: (s: string) => void;
  isSSEConnected: boolean;
}

export function Navbar({ health, activeSection, setActiveSection, isSSEConnected }: NavbarProps) {
  const navItems = [
    { id: "threshold", label: "2028 Threshold Portal" },
    { id: "foundational", label: "Foundational Axiom" },
    { id: "synesthetic-audio", label: "Synesthetic Audio DSP" },
    { id: "oracle", label: "Mercurial Oracle" },
    { id: "context-graph", label: "BoltDB Context Graph" },
    { id: "dasha-engine", label: "17-Yr Dasha Engine" },
    { id: "alchemical", label: "Alchemical Crucible" },
    { id: "author-opus", label: "Justin Andrew Wood" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-mercury-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection("threshold")}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-slate-700/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-serif font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            ☿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-wider font-bold text-slate-100 text-sm sm:text-base">
                MERCURY DASHA
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium">
                BUDHA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">By Justin Andrew Wood</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === item.id
                  ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Real-time Status Badges */}
        <div className="flex items-center gap-2">
          {/* SSE Live Stream Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono">
            <Radio className={`w-3 h-3 ${isSSEConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
            <span className={isSSEConnected ? "text-emerald-300 font-medium" : "text-slate-500"}>
              {isSSEConnected ? "SSE LIVE" : "CONNECTING"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-300">PostgreSQL</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">Primary</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">BoltDB</span>
          </div>
        </div>
      </div>
    </header>
  );
}
