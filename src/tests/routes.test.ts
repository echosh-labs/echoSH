import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Core Static Routes Integrity", () => {
  const appDir = path.resolve(__dirname, "../app");

  const requiredRoutes = [
    { name: "Root Dossier", path: path.join(appDir, "page.tsx") },
    { name: "Astrological Compendium", path: path.join(appDir, "compendium/page.tsx") },
    { name: "Foundations Storyboard", path: path.join(appDir, "foundations/page.tsx") },
    { name: "Axis Mundi Archive", path: path.join(appDir, "axis-mundi/page.tsx") },
    { name: "echoSH Progenitor", path: path.join(appDir, "echosh/page.tsx") },
  ];

  requiredRoutes.forEach((route) => {
    it(`should have valid source file for ${route.name}`, () => {
      expect(fs.existsSync(route.path)).toBe(true);
      const content = fs.readFileSync(route.path, "utf-8");
      expect(content).toContain("export default function");
      expect(content.length).toBeGreaterThan(100);
    });
  });

  it("should have unified Header and Footer components exported and used", () => {
    const headerPath = path.resolve(__dirname, "../components/layout/Header.tsx");
    const footerPath = path.resolve(__dirname, "../components/layout/Footer.tsx");

    expect(fs.existsSync(headerPath)).toBe(true);
    expect(fs.existsSync(footerPath)).toBe(true);

    const headerContent = fs.readFileSync(headerPath, "utf-8");
    const footerContent = fs.readFileSync(footerPath, "utf-8");

    // Header must link to all 5 routes
    expect(headerContent).toContain('"/"');
    expect(headerContent).toContain('"/compendium"');
    expect(headerContent).toContain('"/foundations"');
    expect(headerContent).toContain('"/axis-mundi"');
    expect(headerContent).toContain('"/echosh"');

    // Footer must link to all 5 routes
    expect(footerContent).toContain('"/"');
    expect(footerContent).toContain('"/compendium"');
    expect(footerContent).toContain('"/foundations"');
    expect(footerContent).toContain('"/axis-mundi"');
    expect(footerContent).toContain('"/echosh"');
  });
});

