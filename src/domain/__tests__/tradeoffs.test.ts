import { describe, expect, it } from "vitest";
import { benefitSummary, compareTradeoffs, p06Fraction } from "../tradeoffs";
import type { Allocation, ResidentPriorities } from "../types";

const priorities: ResidentPriorities = {
  safety: 3,
  accessibility: 2,
  climate: 1,
  communitySupport: 0,
};

describe("benefit scoring", () => {
  it("P-06 contributes 50/75/100% of its rating by phase", () => {
    expect(p06Fraction(60_000)).toBe(0.5);
    expect(p06Fraction(90_000)).toBe(0.75);
    expect(p06Fraction(120_000)).toBe(1);
    expect(p06Fraction(45_000)).toBe(0);
  });

  it("scores selected projects by rating x weight", () => {
    // P-01: safety High(3)*3 + access Medium(2)*2 + climate Low(1)*1 = 9 + 4 + 1 = 14
    const summary = benefitSummary([{ projectId: "P-01", amount: 180_000 }], priorities);
    expect(summary.byPriority.safety).toBe(9);
    expect(summary.byPriority.accessibility).toBe(4);
    expect(summary.byPriority.climate).toBe(1);
    expect(summary.illustrativeScore).toBe(14);
    expect(summary.label).toBe("Illustrative comparison");
  });
});

describe("compareTradeoffs", () => {
  const from: Allocation[] = [
    { projectId: "P-01", amount: 180_000 },
    { projectId: "P-06", amount: 120_000 },
  ];
  const to: Allocation[] = [
    { projectId: "P-06", amount: 90_000 },
    { projectId: "P-02", amount: 150_000 },
  ];

  it("identifies additions, removals and funding changes", () => {
    const result = compareTradeoffs(from, to, priorities);
    expect(result.added).toEqual(["P-02"]);
    expect(result.removed).toEqual(["P-01"]);
    expect(result.fundingChanged).toEqual([
      { projectId: "P-06", fromAmount: 120_000, toAmount: 90_000 },
    ]);
    expect(result.costDelta).toBe(150_000 + 90_000 - (180_000 + 120_000));
    expect(result.remainingFundsDelta).toBe(-result.costDelta);
  });

  it("reports directional benefit deltas and never sums people served", () => {
    const result = compareTradeoffs(from, to, priorities);
    const safety = result.benefitDeltas.find((d) => d.priority === "safety");
    expect(safety?.direction).toBe("down");
    expect(result.caveats.join(" ")).toMatch(/not summed/i);
  });

  it("lists an opportunity cost for a removed project", () => {
    const result = compareTradeoffs(from, to, priorities);
    expect(result.opportunityCosts.some((line) => line.includes("P-01"))).toBe(true);
  });
});
