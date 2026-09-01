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

  it("returns the MCP result shape: text content plus structuredContent", async () => {
    const byName = Object.fromEntries(contracts().map((t) => [t.name, t]));
    const ctx = { signal: new AbortController().signal };
    const ok = await byName.get_budget_state.execute({}, ctx);
    expect(Array.isArray(ok.content)).toBe(true);
    expect(ok.content[0]).toMatchObject({ type: "text" });
    expect(ok.structuredContent).toMatchObject({ budgetRevision: 0 });
    expect(ok.isError).toBeUndefined();

    const bad = await byName.simulate_allocation.execute(
      { budgetRevision: 99, allocations: [] },
      ctx,
    );
    expect(bad.isError).toBe(true);
    expect(bad.structuredContent).toMatchObject({ error: { code: "stale_budget_revision" } });
  });

  it("get_budget_state declares the actions no tool can perform", async () => {
    const byName = Object.fromEntries(contracts().map((t) => [t.name, t]));
    const result = await byName.get_budget_state.execute({}, { signal: new AbortController().signal });
    const limits = (result.structuredContent as { structuralLimits: { actions: string[] } })
      .structuralLimits;
    expect(limits.actions.join(" ")).toMatch(/adopt or finalise/i);
    expect(limits.actions.join(" ")).toMatch(/priority weights/i);
  });
});
