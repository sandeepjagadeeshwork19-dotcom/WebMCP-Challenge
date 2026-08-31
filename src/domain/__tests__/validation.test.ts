import { describe, expect, it } from "vitest";
import { validateAllocation, committedTotal, remainingFunds } from "../validation";
import { FUND_LIMIT } from "../projects";
import type { Allocation } from "../types";

const full = (projectId: Allocation["projectId"], amount: number): Allocation => ({
  projectId,
  amount,
});

describe("validateAllocation — fund limit", () => {
  it("accepts a total at or below the fund limit", () => {
    // 260 + 240 + 160 + 150 + 140 = 950,000 (<= 1,000,000)
    const result = validateAllocation([
      full("P-08", 260_000),
      full("P-04", 240_000),
      full("P-05", 160_000),
      full("P-02", 150_000),
      full("P-07", 140_000),
    ]);
    expect(result.valid).toBe(true);
  });

  it("reports exact overage when over budget", () => {
    const result = validateAllocation([
      full("P-08", 260_000),
      full("P-04", 240_000),
      full("P-05", 160_000),
      full("P-02", 150_000),
      full("P-07", 140_000),
      full("P-06", 90_000),
    ]);
    // 260+240+160+150+140+90 = 1,040,000 -> $40,000 over
    const issue = result.issues.find((i) => i.code === "budget_exceeded");
    expect(issue?.message).toContain("$40,000 over");
  });

  it("committed total and remaining funds helpers", () => {
    const alloc = [full("P-02", 150_000), full("P-05", 160_000)];
    expect(committedTotal(alloc)).toBe(310_000);
    expect(remainingFunds(alloc)).toBe(FUND_LIMIT - 310_000);
  });
});

describe("validateAllocation — shape and amounts", () => {
  it("rejects negative, zero, fractional, unknown and duplicate entries", () => {
    const result = validateAllocation([
      { projectId: "P-99", amount: 10 } as unknown as Allocation,
      full("P-02", -5),
      full("P-05", 0),
      full("P-07", 140_000.5),
      full("P-01", 180_000),
      full("P-01", 180_000),
    ]);
    const codes = result.issues.map((i) => i.code);
    expect(codes).toContain("unknown_project");
    expect(codes).toContain("duplicate_project");
    expect(codes).toContain("invalid_amount");
    expect(result.valid).toBe(false);
  });

  it("rejects unknown fields on an entry", () => {
    const result = validateAllocation([
      { projectId: "P-02", amount: 150_000, note: "x" } as unknown as Allocation,
    ]);
    expect(result.issues.some((i) => i.code === "invalid_amount")).toBe(true);
  });
});

describe("validateAllocation — funding rules", () => {
  it("rejects a partial amount for a complete project", () => {
    const result = validateAllocation([full("P-01", 100_000)]);
    expect(result.issues[0].code).toBe("funding_rule");
  });

  it("accepts P-06 at 60k, 90k and 120k and rejects others", () => {
    for (const amount of [60_000, 90_000, 120_000]) {
      expect(validateAllocation([full("P-06", amount)]).valid).toBe(true);
    }
    expect(validateAllocation([full("P-06", 30_000)]).valid).toBe(false);
    expect(validateAllocation([full("P-06", 100_000)]).valid).toBe(false);
  });
});

describe("validateAllocation — dependencies and incompatibilities", () => {
  it("P-03 without full P-04 fails; both at full funding pass", () => {
    expect(validateAllocation([full("P-03", 210_000)]).issues[0].code).toBe(
      "missing_dependency",
    );
    expect(
      validateAllocation([full("P-03", 210_000), full("P-04", 240_000)]).valid,
    ).toBe(true);
  });

  it("P-01 plus P-08 fails with incompatible_projects", () => {
    const result = validateAllocation([full("P-01", 180_000), full("P-08", 260_000)]);
    const issue = result.issues.find((i) => i.code === "incompatible_projects");
    expect(issue?.projectIds).toEqual(["P-01", "P-08"]);
  });
});

describe("validateAllocation — lock preservation", () => {
  it("fails when a locked project is removed or changed, passes when preserved", () => {
    const locked = [full("P-03", 210_000)];
    expect(
      validateAllocation([full("P-04", 240_000)], { lockedAllocations: locked }).issues.some(
        (i) => i.code === "locked_selection_changed",
      ),
    ).toBe(true);
    expect(
      validateAllocation([full("P-03", 200_000), full("P-04", 240_000)], {
        lockedAllocations: locked,
      }).issues.some((i) => i.code === "locked_selection_changed"),
    ).toBe(true);
    expect(
      validateAllocation([full("P-03", 210_000), full("P-04", 240_000)], {
        lockedAllocations: locked,
      }).valid,
    ).toBe(true);
  });
});

describe("validateAllocation — stable issue order", () => {
  it("returns issues in spec order", () => {
    const result = validateAllocation(
      [
        full("P-01", 100_000), // funding_rule
        full("P-03", 210_000), // missing_dependency
        full("P-08", 260_000), // incompatible with P-01
      ],
      { lockedAllocations: [full("P-02", 150_000)] }, // locked_selection_changed
    );
    const order = result.issues.map((i) => i.code);
    expect(order.indexOf("funding_rule")).toBeLessThan(order.indexOf("locked_selection_changed"));
    expect(order.indexOf("locked_selection_changed")).toBeLessThan(
      order.indexOf("missing_dependency"),
    );
    expect(order.indexOf("missing_dependency")).toBeLessThan(
      order.indexOf("incompatible_projects"),
    );
  });
});
