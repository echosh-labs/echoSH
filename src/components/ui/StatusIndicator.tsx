'use client';

import React from "react";
import { Radio, Cpu, Zap, Cloud, CloudOff } from "lucide-react";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface SSEStatusProps {
  isConnected: boolean;
  className?: string;
  showIcon?: boolean;
}

export function SSEStatusIndicator({
  isConnected,
  className,
  showIcon = true,
}: SSEStatusProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono transition-all",
        isConnected
          ? "bg-slate-900/90 border-slate-800 text-emerald-300"
          : "bg-slate-900/60 border-slate-800/80 text-slate-500",
        className
      )}
      title={isConnected ? "Server-Sent Events stream live and active" : "SSE connection offline"}
    >
      {showIcon && (
        <Radio
          className={cn(
            "w-3 h-3 shrink-0",
            isConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"
          )}
        />
      )}
      <span>{isConnected ? "LIVE" : "CONNECTING"}</span>
    </div>
  );
}

interface ModeBadgeProps {
  mode: "AUTO" | "MANUAL";
  className?: string;
  onClick?: () => void;
}

export function ModeStatusBadge({ mode, className, onClick }: ModeBadgeProps) {
  const isAuto = mode === "AUTO";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all select-none",
        isAuto
          ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-glow-emerald"
          : "bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-glow-amber",
        onClick && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )}
      title={`Operating Mode: ${mode}${onClick ? " (Click to toggle)" : ""}`}
    >
      <Cpu className={cn("w-3.5 h-3.5", isAuto ? "text-emerald-400" : "text-amber-400")} />
      <span>MODE: [{mode}]</span>
    </button>
  );
}

interface PolicyBadgeProps {
  policy: "EXECUTE" | "PENDING";
  className?: string;
  onClick?: () => void;
}

export function PolicyStatusBadge({ policy, className, onClick }: PolicyBadgeProps) {
  const isExecute = policy === "EXECUTE";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all select-none",
        isExecute
          ? "bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-glow-amber"
          : "bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-glow-cyan",
        onClick && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )}
      title={`Auto-Ingest Policy: ${policy}${onClick ? " (Click to toggle)" : ""}`}
    >
      <Zap className={cn("w-3.5 h-3.5", isExecute ? "text-amber-400" : "text-cyan-400")} />
      <span>INGEST: [{policy}]</span>
    </button>
  );
}
