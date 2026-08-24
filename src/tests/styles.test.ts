import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Styling & Theme Integrity", () => {
  const rootDir = path.resolve(__dirname, "../../");

  it("should have tailwind.config.ts correctly scanning ./src", () => {
    const tailwindConfigPath = path.join(rootDir, "tailwind.config.ts");
    expect(fs.existsSync(tailwindConfigPath)).toBe(true);
    const content = fs.readFileSync(tailwindConfigPath, "utf-8");
    expect(content).toContain("./src/**/*.{js,ts,jsx,tsx,mdx}");
    expect(content).toContain("mercury");
    expect(content).toContain("emerald");
  });

  it("should have globals.css with required Tailwind directives and color variables", () => {
    const globalsCssPath = path.join(rootDir, "src/app/globals.css");
    expect(fs.existsSync(globalsCssPath)).toBe(true);
    const content = fs.readFileSync(globalsCssPath, "utf-8");
    expect(content).toContain("@tailwind base;");
    expect(content).toContain("@tailwind components;");
    expect(content).toContain("@tailwind utilities;");
    expect(content).toContain("--bg-space: #05070a");
  });

  it("should have layout.tsx properly importing ./globals.css", () => {
    const layoutPath = path.join(rootDir, "src/app/layout.tsx");
    expect(fs.existsSync(layoutPath)).toBe(true);
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).toContain('import "./globals.css"');
  });

  it("should have next.config.mjs configured for pure static export without conflicting distDir", () => {
    const nextConfigPath = path.join(rootDir, "next.config.mjs");
    expect(fs.existsSync(nextConfigPath)).toBe(true);
    const content = fs.readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain("output: 'export'");
    expect(content).not.toContain("distDir: 'out'");
  });
});

