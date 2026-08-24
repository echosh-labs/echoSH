'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Waves, Volume2, VolumeX, Github, ExternalLink } from "lucide-react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { Badge } from "@/components/ui/Badge";

export function Header() {
  const pathname = usePathname();
  const {
    isMuted,
    toggleMute,
    isAmbientActive,
    toggleAmbient,
    playUIClick,
  } = useAudioEngine();

  const navLinks = [
    { href: "/", label: "Dossier" },
    { href: "/compendium", label: "Compendium" },
    { href: "/foundations", label: "Foundations" },
    { href: "/axis-mundi", label: "Axis Mundi" },
    { href: "/echosh", label: "echoSH (Origin)" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900/90 bg-mercury-950/85 backdrop-blur-md px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={playUIClick}
            className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-serif font-bold text-sm shadow-glow-emerald hover:scale-105 transition-transform"
            title="Mercury Dash Home Dossier"
          >
            ☿
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                onClick={playUIClick}
                className="font-serif tracking-widest font-bold text-slate-200 text-sm hover:text-emerald-400 transition-colors"
              >
                JUSTIN ANDREW WOOD
              </Link>
              <Badge variant="emerald" size="xs">
                SYSTEMS ARCHITECT
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-0.5">
              <a
                href="https://echosh-labs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors"
              >
                Echo SH Labs
              </a>{" "}
              &bull; Zero-Token Infrastructure
            </p>
          </div>
        </div>

        {/* Center: Homogenized Core Routes Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 font-mono text-xs">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={playUIClick}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* GitHub Outbound Link */}
          <a
            href="https://github.com/echosh-labs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all ml-1"
            title="View Echo SH Labs GitHub Organization"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </a>
        </nav>

        {/* Right: Audio Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            onClick={() => toggleAmbient(432)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all ${
              isAmbientActive
                ? "bg-violet-950/80 border-violet-500/60 text-violet-300 shadow-glow-violet animate-pulse"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Continuous Generative Ambient Drone (432 Hz)"
          >
            <Waves className={`w-3 h-3 ${isAmbientActive ? "text-violet-400" : "text-slate-500"}`} />
            <span>{isAmbientActive ? "AMBIENT: 432 HZ" : "AMBIENT"}</span>
          </button>

          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-full border transition-all ${
              isMuted
                ? "bg-rose-950/80 border-rose-500/50 text-rose-400"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-emerald-300"
            }`}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </header>
  );
}

