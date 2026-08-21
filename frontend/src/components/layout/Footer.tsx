'use client';

import React from "react";
import { Archive, ShieldCheck, Terminal, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-mercury-950/90 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-semibold font-serif">Mercury Dasha v2.3</span>
          <span>•</span>
          <span>Authored by <span className="text-slate-300">Justin Andrew Wood</span></span>
          <span>•</span>
          <span className="text-emerald-400">Target Dawn: April 2028</span>
        </div>

        {/* Center / Right Archive Links */}
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-600">Preserved Legacy Archives:</span>
          <a
            href="/archive/axis-mundi/"
            className="text-slate-400 hover:text-emerald-300 transition-colors underline underline-offset-4"
          >
            Axis Mundi Archive
          </a>
          <span>•</span>
          <a
            href="/archive/foundations/"
            className="text-slate-400 hover:text-emerald-300 transition-colors underline underline-offset-4"
          >
            Foundations Archive
          </a>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-slate-500">
            <Terminal className="w-3 h-3 text-emerald-500" />
            Go Single Binary Engine
          </span>
          <span>•</span>
          <span className="text-slate-600">Local Dev Mode</span>
        </div>
      </div>
    </footer>
  );
}