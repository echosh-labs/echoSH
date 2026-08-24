/**
 * Echo SH Labs // Mercury Dash Design System & Theme Engine
 * Author: Justin Andrew Wood (echosh-labs.com)
 */

export const THEME_COLORS = {
  spaceVoid: "#020408",
  spaceDeep: "#05070a",
  surfaceBase: "#090d14",
  surfacePanel: "rgba(15, 21, 35, 0.7)",
  surfaceElevated: "rgba(22, 31, 51, 0.85)",
  quicksilver: "#e2e8f0",
  quicksilverMetal: "#94a3b8",
  emeraldTalisman: "#10b981",
  hermeticGold: "#f59e0b",
  etherViolet: "#a855f7",
  lunaCyan: "#06b6d4",
  statusAlert: "#f43f5e",
} as const;

export const GRADIENTS = {
  gold: "text-gold-gradient",
  silver: "text-silver-gradient",
  emerald: "text-emerald-gradient",
  cyan: "text-cyan-gradient",
  violet: "text-violet-gradient",
  rose: "text-rose-gradient",
} as const;

export const GLASS_PANELS = {
  default: "glass-panel",
  elevated: "glass-panel-elevated",
  sunken: "glass-panel-sunken",
  emerald: "glass-panel-emerald",
  silver: "glass-panel-silver",
  violet: "glass-panel-violet",
  amber: "glass-panel-amber",
  cyan: "glass-panel-cyan",
} as const;

export type ThemeAccent = "emerald" | "violet" | "cyan" | "amber" | "rose" | "silver" | "slate";

export function getAccentClasses(accent: ThemeAccent = "emerald"): {
  badge: string;
  glow: string;
  border: string;
  text: string;
} {
  switch (accent) {
    case "violet":
      return {
        badge: "bg-ether-violet/10 text-ether-light border-ether-violet/30",
        glow: "shadow-glow-violet",
        border: "border-ether-violet/40",
        text: "text-ether-light",
      };
    case "cyan":
      return {
        badge: "bg-luna-cyan/10 text-luna-light border-luna-cyan/30",
        glow: "shadow-glow-cyan",
        border: "border-luna-cyan/40",
        text: "text-luna-light",
      };
    case "amber":
      return {
        badge: "bg-hermetic-gold/10 text-hermetic-light border-hermetic-gold/30",
        glow: "shadow-glow-amber",
        border: "border-hermetic-gold/40",
        text: "text-hermetic-light",
      };
    case "rose":
      return {
        badge: "bg-rose-500/10 text-rose-300 border-rose-500/30",
        glow: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
        border: "border-rose-500/40",
        text: "text-rose-300",
      };
    case "silver":
      return {
        badge: "bg-slate-800/80 text-slate-200 border-slate-700",
        glow: "shadow-glow-silver",
        border: "border-slate-700",
        text: "text-slate-200",
      };
    case "slate":
      return {
        badge: "bg-slate-900/90 text-slate-400 border-slate-800",
        glow: "shadow-none",
        border: "border-slate-800",
        text: "text-slate-400",
      };
    case "emerald":
    default:
      return {
        badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        glow: "shadow-glow-emerald",
        border: "border-emerald-500/40",
        text: "text-emerald-300",
      };
  }
}
