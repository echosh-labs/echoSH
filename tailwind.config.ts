import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mercury: {
          950: "#05070a", // Deep space void
          900: "#090d14", // Dark base surface
          850: "#0f1523", // Glass panel base
          800: "#161f33", // Elevated surface / Card
          700: "#22304d", // Border subtle
          600: "#384c75", // Muted accent
          500: "#5d73a3", // Secondary text
          400: "#8ca0cd", // Soft blue
          300: "#bdcbe8", // Highlight text
          200: "#e0e7f6", // Light metal
          100: "#f1f5fd", // Bright quicksilver
        },
        charcoal: {
          950: "#030406",
          900: "#05070a",
          850: "#0a0e17",
          800: "#111724",
          700: "#1b2333",
        },
        quicksilver: {
          glow: "#e2e8f0",
          metal: "#94a3b8",
          dark: "#334155",
          shimmer: "#f8fafc",
          muted: "#64748b",
        },
        emerald: {
          talisman: "#10b981",
          deep: "#064e3b",
          light: "#34d399",
          bright: "#059669",
          glow: "#6ee7b7",
          dark: "#022c22",
        },
        hermetic: {
          gold: "#f59e0b",
          amber: "#d97706",
          bronze: "#92400e",
          light: "#fbbf24",
          dark: "#78350f",
        },
        ether: {
          violet: "#a855f7",
          deep: "#581c87",
          light: "#c084fc",
          glow: "#e9d5ff",
          dark: "#2e1065",
        },
        luna: {
          cyan: "#06b6d4",
          deep: "#0e7490",
          light: "#67e8f9",
          glow: "#cffafe",
          dark: "#164e63",
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Georgia", "Cambria", "serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-emerald": "0 0 20px -2px rgba(16, 185, 129, 0.35)",
        "glow-emerald-lg": "0 0 35px -2px rgba(16, 185, 129, 0.5)",
        "glow-violet": "0 0 20px -2px rgba(168, 85, 247, 0.35)",
        "glow-amber": "0 0 20px -2px rgba(245, 158, 11, 0.35)",
        "glow-cyan": "0 0 20px -2px rgba(6, 182, 212, 0.35)",
        "glow-silver": "0 0 20px -2px rgba(226, 232, 240, 0.25)",
        "glass-inner": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)",
        "tui-glow": "0 0 15px rgba(16, 185, 129, 0.2), inset 0 0 15px rgba(16, 185, 129, 0.05)",
      },
      animation: {
        "quicksilver-pulse": "quicksilverGlow 4s ease-in-out infinite",
        "emerald-float": "floatSlow 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-ping": "radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "fadeIn": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scaleIn": "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        quicksilverGlow: {
          "0%, 100%": { opacity: "0.4", filter: "drop-shadow(0 0 15px rgba(226, 232, 240, 0.3))" },
          "50%": { opacity: "0.9", filter: "drop-shadow(0 0 30px rgba(16, 185, 129, 0.5))" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        radarPing: {
          "75%, 100%": {
            transform: "scale(2)",
            opacity: "0",
          },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

