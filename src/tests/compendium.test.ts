import { describe, it, expect } from "vitest";
import {
  dashaOverviewData,
  nakshatrasData,
  alchemicalPrinciplesData,
  contextNodesData,
  foundationalStatementData,
} from "../lib/data/compendium";

describe("Compendium Static Datasets", () => {
  it("should have complete 17-Year Dasha dataset with all 9 sub-periods", () => {
    expect(dashaOverviewData.mahadasha_lord).toBe("Mercury (Budha)");
    expect(dashaOverviewData.total_years).toBe(17);
    expect(dashaOverviewData.sub_periods.length).toBe(9);

    dashaOverviewData.sub_periods.forEach((sub) => {
      expect(sub.sub_lord).toBeDefined();
      expect(sub.qualities.length).toBeGreaterThan(10);
      expect(sub.psychological).toBeDefined();
      expect(sub.material).toBeDefined();
      expect(sub.esoteric).toBeDefined();
    });
  });

  it("should have all 3 Mercurial Nakshatras defined with shaktis and qualities", () => {
    expect(nakshatrasData.length).toBe(3);
    const names = nakshatrasData.map((n) => n.name);
    expect(names).toEqual(["Ashlesha", "Jyeshtha", "Revati"]);

    nakshatrasData.forEach((nak) => {
      expect(nak.sanskrit).toBeDefined();
      expect(nak.shakti).toBeDefined();
      expect(nak.qualities.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("should have Tria Prima alchemical principles populated", () => {
    expect(alchemicalPrinciplesData.length).toBe(3);
    const names = alchemicalPrinciplesData.map((p) => p.principle);
    expect(names[0]).toContain("Hydrargyrum (Mercury)");
    expect(names[1]).toContain("Sulfur");
    expect(names[2]).toContain("Salt");
  });

  it("should have rich relational context knowledge graph nodes", () => {
    expect(contextNodesData.length).toBeGreaterThanOrEqual(5);
    contextNodesData.forEach((node) => {
      expect(node.key).toMatch(/^node:/);
      expect(node.tags.length).toBeGreaterThan(0);
      expect(node.relative_keys.length).toBeGreaterThan(0);
    });
  });

  it("should have valid foundational statement and correspondences", () => {
    expect(foundationalStatementData.id).toBe("mercury-foundational-root");
    expect(foundationalStatementData.archetypes.length).toBeGreaterThanOrEqual(5);
    expect(Object.keys(foundationalStatementData.correspondences).length).toBeGreaterThanOrEqual(8);
  });
});

