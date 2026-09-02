import { describe, expect, it } from "vitest";
import {
  STRATEGY_PRESETS,
  strategyForResident,
  strategyNeighbourhoods,
} from "../strategies";
import { validateProtectedWorks } from "../redraft";
import { validateAllocation, committedTotal } from "../validation";
import { FUND_LIMIT } from "../projects";

describe("strategy presets", () => {
  it("offers three distinct directions", () => {
    expect(STRATEGY_PRESETS).toHaveLength(3);
    expect(new Set(STRATEGY_PRESETS.map((s) => s.id)).size).toBe(3);
  });

  it("every strategy is a deterministically valid allocation within budget", () => {
    for (const preset of STRATEGY_PRESETS) {
      const result = validateAllocation(preset.allocations);
      expect(result.valid, `${preset.id}: ${JSON.stringify(result.issues)}`).toBe(true);
      expect(committedTotal(preset.allocations)).toBeLessThanOrEqual(FUND_LIMIT);
    }
  });

  it("each strategy has a different priority lens", () => {
    const lenses = STRATEGY_PRESETS.map((s) => JSON.stringify(s.priorities));
    expect(new Set(lenses).size).toBe(3);
  });

  it("reports the neighbourhoods each strategy touches", () => {
    for (const preset of STRATEGY_PRESETS) {
      expect(strategyNeighbourhoods(preset).length).toBeGreaterThan(0);
    }
  });

  it("rebuilds every direction around protected works", () => {
    const locks = [{ projectId: "P-03" as const, amount: 210_000 }];
    const priorities = { safety: 3, accessibility: 2, climate: 3, communitySupport: 2 } as const;

    for (const preset of STRATEGY_PRESETS) {
      const strategy = strategyForResident(preset, locks, priorities);
      expect(strategy.allocations).toContainEqual({ projectId: "P-03", amount: 210_000 });
      expect(validateAllocation(strategy.allocations, { lockedAllocations: locks }).valid).toBe(true);
    }
  });

  it("identifies protected sets that cannot be funded together", () => {
    const incompatible = validateProtectedWorks(
      [
        { projectId: "P-01", amount: 180_000 },
        { projectId: "P-08", amount: 260_000 },
      ],
      { safety: 0, accessibility: 0, climate: 0, communitySupport: 0 },
    );
    expect(incompatible.valid).toBe(false);
    expect(incompatible.issues.some((issue) => issue.code === "incompatible_projects")).toBe(true);

    const overBudget = validateProtectedWorks(
      [
        { projectId: "P-01", amount: 180_000 },
        { projectId: "P-02", amount: 150_000 },
        { projectId: "P-03", amount: 210_000 },
        { projectId: "P-04", amount: 240_000 },
        { projectId: "P-05", amount: 160_000 },
        { projectId: "P-06", amount: 90_000 },
        { projectId: "P-07", amount: 140_000 },
      ],
      { safety: 0, accessibility: 0, climate: 0, communitySupport: 0 },
    );
    expect(overBudget.valid).toBe(false);
    expect(overBudget.issues.some((issue) => issue.code === "budget_exceeded")).toBe(true);
  });
});
