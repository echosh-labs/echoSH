import React from "react";
import { cn } from "@/lib/utils";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "elevated"
    | "sunken"
    | "emerald"
    | "silver"
    | "violet"
    | "amber"
    | "cyan"
    | "tui";
  glow?: boolean;
  interactive?: boolean;
}

export function Panel({
  className,
  variant = "default",
  glow = false,
  interactive = false,
  children,
  ...props
}: PanelProps) {
  const variantClasses = {
    default: "glass-panel",
    elevated: "glass-panel-elevated",
    sunken: "glass-panel-sunken",
    emerald: "glass-panel-emerald",
    silver: "glass-panel-silver",
    violet: "glass-panel-violet",
    amber: "glass-panel-amber",
    cyan: "glass-panel-cyan",
    tui: "tui-window",
  };

  const glowClasses = {
    default: "shadow-glow-silver",
    elevated: "shadow-2xl",
    sunken: "",
    emerald: "shadow-glow-emerald",
    silver: "shadow-glow-silver",
    violet: "shadow-glow-violet",
    amber: "shadow-glow-amber",
    cyan: "shadow-glow-cyan",
    tui: "shadow-tui-glow",
  };

  return (
    <div
      className={cn(
        "rounded-2xl relative overflow-hidden transition-all",
        variantClasses[variant],
        glow && glowClasses[variant],
        interactive &&
          "cursor-pointer hover:border-emerald-500/50 hover:shadow-glow-emerald active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-serif text-lg sm:text-xl font-bold text-slate-100", className)} {...props}>
      {children}
    </h3>
  );
}

export function PanelDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs sm:text-sm text-slate-400 font-light leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function PanelContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}

export function PanelFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs", className)}
      {...props}
    >
      {children}
    </div>
  );
}
