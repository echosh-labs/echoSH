import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mercury: {
          950: "#05070a",
          900: "#090d14",
          850: "#0f1523",
          800: "#161f33",
          700: "#22304d",
          600: "#384c75",
          500: "#5d73a3",
          400: "#8ca0cd",
          300: "#bdcbe8",
          200: "#e0e7f6",
          100: "#f1f5fd",
        },
        quicksilver: {
          glow: "#e2e8f0",
          metal: "#94a3b8",
          dark: "#334155",
        },
        emerald: {
          talisman: "#10b981",
          deep: "#064e3b",
          light: "#34d399",
          bright: "#059669",
        },
        hermetic: {
          gold: "#f59e0b",
          amber: "#d97706",
          bronze: "#92400e",
        }
      },
      fontFamily: {
        serif: ["Cinzel", "Georgia", "Cambria", "serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "quicksilver-pulse": "quicksilverGlow 4s ease-in-out infinite",
        "emerald-float": "floatSlow 6s ease-in-out infinite",
      },
      keyframes: {
        quicksilverGlow: {
          "0%, 100%": { opacity: "0.4", filter: "drop-shadow(0 0 15px rgba(226, 232, 240, 0.3))" },
          "50%": { opacity: "0.9", filter: "drop-shadow(0 0 30px rgba(16, 185, 129, 0.5))" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
