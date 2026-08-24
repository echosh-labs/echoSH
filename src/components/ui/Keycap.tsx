import React from "react";
import { cn } from "@/lib/utils";

export interface KeycapProps extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  variant?: "emerald" | "amber" | "violet" | "cyan" | "slate";
}

export function Keycap({
  className,
  active = false,
  variant = "slate",
  children,
  ...props
}: KeycapProps) {
  const variantClasses = {
    slate: "bg-slate-800/80 border-slate-700 text-slate-300",
    emerald: "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-glow-emerald",
    amber: "bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-glow-amber",
    violet: "bg-violet-950/80 border-violet-500/50 text-violet-300 shadow-glow-violet",
    cyan: "bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-glow-cyan",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-1.5 py-0.5 font-mono text-[11px] font-semibold rounded border shadow-sm select-none transition-all",
        variantClasses[variant],
        active && "scale-105 border-emerald-400 text-emerald-300",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
