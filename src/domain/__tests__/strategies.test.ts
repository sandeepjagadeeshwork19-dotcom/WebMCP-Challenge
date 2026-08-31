import { describe, expect, it } from "vitest";
import { STRATEGY_PRESETS, strategyNeighbourhoods } from "../strategies";
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
});
