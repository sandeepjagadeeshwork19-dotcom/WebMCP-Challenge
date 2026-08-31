import { describe, expect, it } from "vitest";
import { inr } from "../money";

describe("inr — Indian digit grouping", () => {
  it("groups by lakh / crore", () => {
    expect(inr(0)).toBe("₹0");
    expect(inr(60_000)).toBe("₹60,000");
    expect(inr(1_20_000)).toBe("₹1,20,000");
    expect(inr(1_80_000)).toBe("₹1,80,000");
    expect(inr(9_90_000)).toBe("₹9,90,000");
    expect(inr(10_00_000)).toBe("₹10,00,000");
    expect(inr(1_00_00_000)).toBe("₹1,00,00,000");
  });

  it("handles negatives and rounding", () => {
    expect(inr(-40_000)).toBe("-₹40,000");
    expect(inr(1499)).toBe("₹1,499");
    expect(inr(1500.7)).toBe("₹1,501");
  });
});
