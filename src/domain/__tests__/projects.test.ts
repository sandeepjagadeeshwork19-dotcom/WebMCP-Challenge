import { describe, expect, it } from "vitest";
import { DATASET_VERSION, FUND_LIMIT, PROJECTS, PROJECT_IDS } from "../projects";

describe("dataset", () => {
  it("has the locked scenario constants", () => {
    expect(DATASET_VERSION).toBe("demo-budget-v1");
    expect(FUND_LIMIT).toBe(1_000_000);
  });

  it("has exactly eight projects with unique stable ids", () => {
    expect(PROJECTS).toHaveLength(8);
    expect(PROJECT_IDS).toEqual([
      "P-01",
      "P-02",
      "P-03",
      "P-04",
      "P-05",
      "P-06",
      "P-07",
      "P-08",
    ]);
    expect(new Set(PROJECT_IDS).size).toBe(8);
  });

  it("encodes the exact constraints", () => {
    const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
    expect(byId["P-01"].incompatibilities).toContain("P-08");
    expect(byId["P-08"].incompatibilities).toContain("P-01");
    expect(byId["P-03"].dependencies).toEqual(["P-04"]);
    expect(byId["P-06"].fundingRule).toEqual({
      kind: "phased",
      allowedAmounts: [60_000, 90_000, 120_000],
    });
  });

  it("is deeply frozen", () => {
    expect(Object.isFrozen(PROJECTS)).toBe(true);
    expect(Object.isFrozen(PROJECTS[0])).toBe(true);
    expect(() => {
      (PROJECTS[0] as { cost: number }).cost = 1;
    }).toThrow();
  });

  it("every project has all required fields populated", () => {
    for (const p of PROJECTS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.neighbourhood.length).toBeGreaterThan(0);
      expect(p.peopleServed).toMatch(/^About /);
      expect(p.cost).toBeGreaterThan(0);
      expect(p.hypotheticalAssumption.length).toBeGreaterThan(0);
    }
  });
});
