'use client';

import React from "react";
import { Radio, Archive, Sparkles, Activity, Layers, Volume2, VolumeX, Waves } from "lucide-react";
import { HealthStatus } from "@/types";
import { useAudioEngine } from "@/hooks/useAudioEngine";

export type Workspace = "portal" | "astrology" | "audio";

interface NavbarProps {
  health: HealthStatus | null;
  activeWorkspace: Workspace;
  setActiveWorkspace: (w: Workspace) => void;
  isSSEConnected: boolean;
}

export function Navbar({
  activeWorkspace,
  setActiveWorkspace,
  isSSEConnected,
}: NavbarProps) {
  const {
    isMuted,
    toggleMute,
    masterVolume,
    setMasterVolume,
    isAmbientActive,
    toggleAmbient,
    playUIClick,
  } = useAudioEngine();

  const workspaces = [
    {
      id: "portal" as Workspace,
      label: "Portal & Philosophy",
      icon: Sparkles,
      tag: "Axiom & 2028",
    },
    {
      id: "astrology" as Workspace,
      label: "Mercurial Engine",
      icon: Layers,
      tag: "Dasha & Graph",
    },
    {
      id: "audio" as Workspace,
      label: "Synesthetic Sound",
      icon: Activity,
      tag: "Web Audio DSP",
    },
  ];

  const handleWorkspaceChange = (ws: Workspace) => {
    playUIClick();
    setActiveWorkspace(ws);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-mercury-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          onClick={() => handleWorkspaceChange("portal")}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-slate-700/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-serif font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
            ☿
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-wider font-bold text-slate-100 text-sm sm:text-base">
                MERCURY DASH
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium">
                ECHO SH LABS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">echosh-labs.com &bull; Justin Andrew Wood</p>
          </div>
        </div>

        {/* Streamlined Workspace Tabs */}
        <nav className="flex items-center gap-1 bg-mercury-900/60 p-1 rounded-xl border border-slate-800/80">
          {workspaces.map((ws) => {
            const Icon = ws.icon;
            const isActive = activeWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => handleWorkspaceChange(ws.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="hidden md:inline">{ws.label}</span>
                <span className="md:hidden">{ws.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </nav>

        {/* Persistent Audio HUD, Foundations Link & SSE Status */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Direct Link to Foundations Storyboard & Architecture */}
          <a
            href="/foundations"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-emerald-300 hover:border-emerald-500/40 transition-all"
            title="Open Foundations Storyboard & Axis Mundi Architecture"
          >
            <span>Foundations</span>
          </a>

          {/* Direct Link to Axis Terminal */}
          <a
            href="/terminal"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-all"
            title="Open Axis Mundi Operational Terminal"
          >
            <span>Terminal</span>
          </a>

          {/* Ambient Cosmic Drone Button */}
          <button
            onClick={() => toggleAmbient(432)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
              isAmbientActive
                ? "bg-violet-950/80 border-violet-500/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.3)] animate-pulse"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Continuous Generative Cosmic Drone (432 Hz)"
          >
            <Waves className={`w-3 h-3 ${isAmbientActive ? "text-violet-400" : "text-slate-500"}`} />
            <span className="hidden xl:inline">{isAmbientActive ? "AMBIENT ON" : "AMBIENT"}</span>
          </button>

          {/* Master Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-full border transition-all ${
              isMuted
                ? "bg-rose-950/80 border-rose-500/50 text-rose-400"
                : "bg-slate-900/80 border-slate-800 text-emerald-400 hover:bg-slate-800"
            }`}
            title={isMuted ? "Unmute Audio Engine" : "Mute Audio Engine"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* SSE Live Stream Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono">
            <Radio className={`w-3 h-3 ${isSSEConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
            <span className={isSSEConnected ? "text-emerald-300 font-medium" : "text-slate-500"}>
              {isSSEConnected ? "LIVE" : "CONNECTING"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}