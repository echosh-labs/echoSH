/**
 * @file styleSettings.ts
 * @description Maps the user's appearance settings onto the CSS custom
 * properties that drive the liquid-glass theme (see assets/main.css). Defaults
 * here mirror the stylesheet defaults, so an empty settings object is a no-op.
 */

import { AppSettings } from "@/renderer/types/app.ts";

export const STYLE_DEFAULTS = {
  accentColor: "#58a6ff",
  glassColor: "#181f2c",
  glassOpacity: 0.55,
  cornerRadius: 14,
  fontFamily: "'Fira Code', 'Source Code Pro', monospace",
} as const;

/** Font choices offered in the settings UI. */
export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Fira Code", value: "'Fira Code', monospace" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Source Code Pro", value: "'Source Code Pro', monospace" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "System Monospace", value: "ui-monospace, monospace" },
];

/** Converts "#RRGGBB" into an "r, g, b" triplet for use inside rgba(). */
function hexToRgbTriplet(hex: string): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/** Drops undefined/null/empty entries so they fall back to defaults. */
function present<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as Partial<T>;
}

/**
 * Writes the appearance settings to CSS variables on the document root,
 * overriding the stylesheet defaults. Safe to call with a partial object.
 */
export function applyStyleSettings(settings: Partial<AppSettings>): void {
  const root = document.documentElement;
  const s = { ...STYLE_DEFAULTS, ...present(settings) };

  root.style.setProperty("--glass-accent", s.accentColor);
  root.style.setProperty("--glass-accent-2", s.accentColor);

  const rgb = hexToRgbTriplet(s.glassColor);
  if (rgb) root.style.setProperty("--glass-rgb", rgb);

  root.style.setProperty("--glass-opacity", String(s.glassOpacity));
  root.style.setProperty("--glass-radius", `${s.cornerRadius}px`);
  root.style.setProperty("--terminal-font", s.fontFamily);
}
