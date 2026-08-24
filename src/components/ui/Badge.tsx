import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "violet" | "cyan" | "amber" | "rose" | "slate" | "silver" | "mono";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  pulseDot?: boolean;
  glow?: boolean;
}

export function Badge({
  className,
  variant = "emerald",
  size = "sm",
  dot = false,
  pulseDot = false,
  glow = false,
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px] gap-1",
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-xs font-semibold gap-2",
  };

  const variantClasses = {
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    violet: "bg-ether-violet/10 text-ether-light border-ether-violet/30",
    cyan: "bg-luna-cyan/10 text-luna-light border-luna-cyan/30",
    amber: "bg-hermetic-gold/10 text-hermetic-light border-hermetic-gold/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    slate: "bg-slate-900/80 text-slate-400 border-slate-800",
    silver: "bg-slate-800/80 text-slate-200 border-slate-700",
    mono: "bg-slate-950 font-mono text-emerald-400 border-emerald-500/40",
  };

  const glowClasses = {
    emerald: "shadow-glow-emerald",
    violet: "shadow-glow-violet",
    cyan: "shadow-glow-cyan",
    amber: "shadow-glow-amber",
    rose: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
    slate: "",
    silver: "shadow-glow-silver",
    mono: "shadow-tui-glow",
  };

  const dotColorClasses = {
    emerald: "bg-emerald-400",
    violet: "bg-violet-400",
    cyan: "bg-cyan-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    slate: "bg-slate-500",
    silver: "bg-slate-300",
    mono: "bg-emerald-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-mono rounded-full border transition-all",
        sizeClasses[size],
        variantClasses[variant],
        glow && glowClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColorClasses[variant],
            pulseDot && "animate-pulse"
          )}
        />
      )}
      {children}
    </span>
  );
}
