'use client';

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "tui" | "danger" | "ambient" | "glow" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      isLoading = false,
      iconLeft,
      iconRight,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeClasses = {
      xs: "px-2.5 py-1 text-xs rounded-md gap-1.5",
      sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm rounded-xl gap-2",
      lg: "px-5 py-2.5 text-base rounded-xl gap-2.5",
      icon: "p-2 rounded-xl text-sm",
    };

    const variantClasses = {
      primary:
        "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald hover:border-emerald-500/60",
      secondary:
        "bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700",
      ghost:
        "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent",
      tui:
        "bg-slate-950 font-mono text-xs text-emerald-400 border border-emerald-500/40 hover:bg-emerald-950/40 hover:border-emerald-500/60 shadow-tui-glow rounded-lg",
      danger:
        "bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 hover:border-rose-500/60",
      ambient:
        "bg-violet-950/80 hover:bg-violet-900/80 text-violet-300 border border-violet-500/50 shadow-glow-violet",
      glow:
        "bg-hermetic-gold/15 hover:bg-hermetic-gold/25 text-hermetic-light border border-hermetic-gold/40 shadow-glow-amber",
      outline:
        "bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-800/50 hover:border-slate-600",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
        ) : (
          iconLeft
        )}
        {children}
        {!isLoading && iconRight}
      </button>
    );
  }
);

Button.displayName = "Button";
