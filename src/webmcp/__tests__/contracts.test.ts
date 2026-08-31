import { describe, expect, it } from "vitest";
import { createToolContracts, TOOL_NAMES } from "../contracts";
import { createHandlers } from "../handlers";
import { createStore } from "../../state/store";

function contracts() {
  return createToolContracts(createHandlers(createStore()));
}

describe("tool contracts", () => {
  it("defines exactly the approved tool set and no state-committing tool", () => {
    const names = contracts().map((t) => t.name);
    expect(names).toEqual([...TOOL_NAMES]);
    expect(names).not.toContain("finalise_allocation");
    expect(names).not.toContain("accept_proposal");
    expect(names).not.toContain("set_priority");
    expect(names).not.toContain("lock_project");
    expect(names).not.toContain("reset_demo");
  });

  it("marks read-only tools with readOnlyHint", () => {
    const byName = Object.fromEntries(contracts().map((t) => [t.name, t]));
    expect(byName.get_budget_state.annotations?.readOnlyHint).toBe(true);
    expect(byName.simulate_allocation.annotations?.readOnlyHint).toBe(true);
    expect(byName.propose_allocation.annotations?.readOnlyHint).toBe(false);
  });

  it("every schema rejects unknown properties", () => {
    for (const tool of contracts()) {
      expect(tool.inputSchema?.additionalProperties).toBe(false);
      expect(typeof tool.description).toBe("string");
    }
  });
});
