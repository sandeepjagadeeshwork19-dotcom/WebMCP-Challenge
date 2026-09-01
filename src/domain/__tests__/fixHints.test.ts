import { describe, expect, it } from "vitest";
import { validateAllocation } from "../validation";
import { fixHintForIssue } from "../fixHints";
import type { Allocation } from "../types";

function hintsFor(allocations: Allocation[]) {
  return validateAllocation(allocations).issues.map((issue) => ({
    code: issue.code,
    fix: fixHintForIssue(issue, allocations),
  }));
}

describe("fixHintForIssue", () => {
  it("tells the agent the exact dependency to add", () => {
    // P-03 needs P-04 at full funding.
    const hints = hintsFor([{ projectId: "P-03", amount: 210_000 }]);
    const dep = hints.find((h) => h.code === "missing_dependency");
    expect(dep?.fix).toEqual({ action: "add", projectId: "P-04", amount: 240_000 });
  });

  it("tells the agent which incompatible work to drop one of", () => {
    const hints = hintsFor([
      { projectId: "P-01", amount: 180_000 },
      { projectId: "P-08", amount: 260_000 },
    ]);
    const clash = hints.find((h) => h.code === "incompatible_projects");
    expect(clash?.fix).toMatchObject({ action: "removeOneOf" });
    expect((clash?.fix as { projectIds: string[] }).projectIds.sort()).toEqual(["P-01", "P-08"]);
  });

  it("tells the agent how far over the fund the plan is", () => {
    const hints = hintsFor([
      { projectId: "P-01", amount: 180_000 },
      { projectId: "P-04", amount: 240_000 },
      { projectId: "P-08", amount: 260_000 },
      { projectId: "P-05", amount: 160_000 },
      { projectId: "P-07", amount: 140_000 },
      { projectId: "P-02", amount: 150_000 },
    ]);
    const over = hints.find((h) => h.code === "budget_exceeded");
    expect(over?.fix).toMatchObject({ action: "reduceBy" });
    expect((over?.fix as { amount: number }).amount).toBeGreaterThan(0);
  });

  it("gives an exact amount for a funding-rule violation", () => {
    const hints = hintsFor([{ projectId: "P-01", amount: 100_000 }]);
    const rule = hints.find((h) => h.code === "funding_rule");
    expect(rule?.fix).toEqual({ action: "setAmount", projectId: "P-01", amount: 180_000 });
  });
});
