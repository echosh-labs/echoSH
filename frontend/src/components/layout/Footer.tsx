'use client';

import React from "react";
import { Archive, ShieldCheck, Terminal, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-mercury-950/90 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-semibold font-serif">Mercury Dash</span>
          <span>&bull;</span>
          <span>Operated by <a href="https://echosh-labs.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-400 underline underline-offset-2">Echo SH Labs</a></span>
          <span>&bull;</span>
          <span>Justin Andrew Wood</span>
        </div>

        {/* Center Links */}
        <div className="flex items-center gap-4 text-[11px]">
          <a
            href="/foundations"
            className="text-slate-400 hover:text-emerald-300 transition-colors"
          >
            Foundations
          </a>
          <span>&bull;</span>
          <a
            href="/terminal"
            className="text-slate-400 hover:text-emerald-300 transition-colors"
          >
            Axis Terminal
          </a>
          <span>&bull;</span>
          <a
            href="https://echosh-labs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-emerald-300 transition-colors"
          >
            echosh-labs.com
          </a>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Terminal className="w-3 h-3 text-emerald-500" />
            Go Single Binary Engine
          </span>
        </div>
      </div>
    </footer>
  );
}