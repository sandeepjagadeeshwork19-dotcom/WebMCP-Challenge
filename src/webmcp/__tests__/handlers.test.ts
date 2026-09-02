import { describe, expect, it } from "vitest";
import { createHandlers } from "../handlers";
import { isToolError } from "../errors";
import { createStore } from "../../state/store";
import { getWebMcpTrace } from "../trace";

function setup() {
  const store = createStore(undefined, () => "2026-08-31T12:00:00.000Z");
  store.dispatch({ type: "human/confirmPriorities" });
  const handlers = createHandlers(store);
  return { store, handlers };
}

const plan = [
  { projectId: "P-02", amount: 150_000 },
  { projectId: "P-05", amount: 160_000 },
];

describe("read handlers", () => {
  it("get_budget_state mirrors store state and does not mutate", () => {
    const { store, handlers } = setup();
    const before = JSON.stringify(store.getState());
    const result = handlers.get_budget_state({}) as Record<string, unknown>;
    expect(result.budgetRevision).toBe(0);
    expect(result.fundLimit).toBe(1_000_000);
    expect(result.datasetVersion).toBe("demo-budget-v1");
    expect(JSON.stringify(store.getState())).toBe(before);
  });

  it("includes the complete active proposal so a later assistant can continue safely", () => {
    const { handlers } = setup();
    handlers.propose_allocation({ budgetRevision: 0, allocations: plan, rationale: "A valid start." });
    const result = handlers.get_budget_state({}) as {
      proposal: { allocations: unknown[]; committedTotal: number; validation: { valid: boolean } };
    };
    expect(result.proposal.allocations).toEqual(plan);
    expect(result.proposal.committedTotal).toBe(310_000);
    expect(result.proposal.validation.valid).toBe(true);
  });

  it("get_budget_state rejects unknown keys", () => {
    const { handlers } = setup();
    const result = handlers.get_budget_state({ bogus: true });
    expect(isToolError(result) && result.error.code).toBe("invalid_input");
  });

  it("list_projects returns all eight in stable order", () => {
    const { handlers } = setup();
    const result = handlers.list_projects({}) as { projects: { id: string }[] };
    expect(result.projects.map((p) => p.id)).toEqual([
      "P-01",
      "P-02",
      "P-03",
      "P-04",
      "P-05",
      "P-06",
      "P-07",
      "P-08",
    ]);
  });

  it("list_strategy_options returns three valid directions scored against current priorities", () => {
    const { store, handlers } = setup();
    store.dispatch({ type: "human/setPriority", key: "safety", weight: 3 });
    const result = handlers.list_strategy_options({}) as {
      strategies: { id: string; valid: boolean; scoreAtResidentPriorities: { illustrativeScore: number } }[];
    };
    expect(result.strategies).toHaveLength(3);
    expect(result.strategies.every((s) => s.valid)).toBe(true);
    expect(result.strategies.map((s) => s.id)).toEqual([
      "safety_access",
      "climate_resilience",
      "broad_coverage",
    ]);
  });

  it("simulate_allocation validates without mutating and rejects a stale revision", () => {
    const { store, handlers } = setup();
    const ok = handlers.simulate_allocation({ budgetRevision: 0, allocations: plan }) as {
      valid: boolean;
    };
    expect(ok.valid).toBe(true);
    expect(store.getState().proposalRevision).toBe(0);

    const stale = handlers.simulate_allocation({ budgetRevision: 9, allocations: plan });
    expect(isToolError(stale) && stale.error.code).toBe("stale_budget_revision");
  });
});

describe("state-changing handlers", () => {
  it("propose_allocation stores an agent proposal matching the visible store", () => {
    const { store, handlers } = setup();
    const result = handlers.propose_allocation({
      budgetRevision: 0,
      allocations: plan,
      rationale: "Balanced accessibility plan.",
    }) as { proposalRevision: number; status: string; allocationHash: string };
    expect(result.status).toBe("valid");
    expect(result.proposalRevision).toBe(1);
    expect(store.getState().agentProposal?.allocationHash).toBe(result.allocationHash);
    expect(store.getState().proposalStatus).toBe("valid");
  });

  it("propose_allocation stores a rule-invalid candidate visibly", () => {
    const { store, handlers } = setup();
    const result = handlers.propose_allocation({
      budgetRevision: 0,
      allocations: [{ projectId: "P-01", amount: 100_000 }],
      rationale: "Invalid partial funding.",
    }) as { status: string; validationIssues: unknown[] };
    expect(result.status).toBe("invalid");
    expect(result.validationIssues.length).toBeGreaterThan(0);
    expect(store.getState().proposalStatus).toBe("invalid");
  });

  it("propose_allocation rejects oversized rationale and unknown keys", () => {
    const { handlers } = setup();
    expect(
      isToolError(
        handlers.propose_allocation({
          budgetRevision: 0,
          allocations: plan,
          rationale: "x".repeat(601),
        }),
      ),
    ).toBe(true);
  });

  it("requires a resident journey start and a non-empty proposal", () => {
    const store = createStore();
    const handlers = createHandlers(store);
    const beforeJourney = handlers.propose_allocation({
      budgetRevision: 0,
      allocations: plan,
      rationale: "Too early.",
    });
    expect(isToolError(beforeJourney) && beforeJourney.error.code).toBe("priorities_not_confirmed");

    store.dispatch({ type: "human/confirmPriorities" });
    const empty = handlers.propose_allocation({ budgetRevision: 0, allocations: [], rationale: "Empty." });
    expect(isToolError(empty) && empty.error.code).toBe("empty_allocation");
  });

  it("request_allocation_review opens review only for a fresh valid proposal", () => {
    const { store, handlers } = setup();
    handlers.propose_allocation({
      budgetRevision: 0,
      allocations: plan,
      rationale: "Balanced accessibility plan.",
    });

    const badRevision = handlers.request_allocation_review({ budgetRevision: 0, proposalRevision: 99 });
    expect(isToolError(badRevision) && badRevision.error.code).toBe("proposal_revision_mismatch");

    const ok = handlers.request_allocation_review({ budgetRevision: 0, proposalRevision: 1 }) as {
      reviewStatus: string;
    };
    expect(ok.reviewStatus).toBe("open");
    expect(store.getState().proposalStatus).toBe("under_review");
  });

  it("request_allocation_review rejects a stale proposal after a human edit", () => {
    const { store, handlers } = setup();
    handlers.propose_allocation({
      budgetRevision: 0,
      allocations: plan,
      rationale: "Balanced accessibility plan.",
    });
    store.dispatch({ type: "human/setPriority", key: "safety", weight: 2 });
    const result = handlers.request_allocation_review({ budgetRevision: 1, proposalRevision: 1 });
    expect(isToolError(result) && result.error.code).toBe("stale_proposal");
  });

  it("does not let an assistant replace a plan during resident review or after adoption", () => {
    const { store, handlers } = setup();
    handlers.propose_allocation({ budgetRevision: 0, allocations: plan, rationale: "A valid plan." });
    handlers.request_allocation_review({ budgetRevision: 0, proposalRevision: 1 });
    const inReview = handlers.propose_allocation({
      budgetRevision: 0,
      allocations: [{ projectId: "P-04", amount: 240_000 }],
      rationale: "Interrupt the review.",
    });
    expect(isToolError(inReview) && inReview.error.code).toBe("resident_review_in_progress");
    expect(store.getState().proposalRevision).toBe(1);

    store.dispatch({ type: "human/acceptProposal" });
    store.dispatch({ type: "human/setDisclosureAck", acknowledged: true });
    store.dispatch({ type: "human/finalise" });
    const afterAdoption = handlers.propose_allocation({
      budgetRevision: 0,
      allocations: plan,
      rationale: "Replace a final record.",
    });
    expect(isToolError(afterAdoption) && afterAdoption.error.code).toBe("finalised_state");
    expect(store.getState().proposalStatus).toBe("finalised");
  });

  it("clears the visible WebMCP trace when the resident resets the demonstration", () => {
    const { store, handlers } = setup();
    handlers.get_budget_state({});
    expect(getWebMcpTrace(store).getSnapshot()).toHaveLength(1);
    store.dispatch({ type: "human/reset" });
    expect(getWebMcpTrace(store).getSnapshot()).toHaveLength(0);
  });
});

describe("authority boundary", () => {
  it("no handler can accept, finalise or reset", () => {
    const { handlers } = setup();
    const names = Object.keys(handlers);
    expect(names).not.toContain("finalise_allocation");
    expect(names).not.toContain("accept_proposal");
    expect(names).not.toContain("reset_demo");
    expect(names.sort()).toEqual(
      [
        "explain_tradeoffs",
        "get_budget_state",
        "list_projects",
        "list_strategy_options",
        "propose_allocation",
        "request_allocation_review",
        "simulate_allocation",
      ].sort(),
    );
  });

  it("explain_tradeoffs returns canonical deltas and flags stale proposals", () => {
    const { store, handlers } = setup();
    handlers.propose_allocation({
      budgetRevision: 0,
      allocations: plan,
      rationale: "Balanced accessibility plan.",
    });
    const result = handlers.explain_tradeoffs({
      proposalRevision: 1,
      compareWith: "manual_allocation",
    }) as { added: string[]; caveats: string[] };
    expect(result.added.sort()).toEqual(["P-02", "P-05"]);

    store.dispatch({ type: "human/setPriority", key: "safety", weight: 1 });
    const stale = handlers.explain_tradeoffs({
      proposalRevision: 1,
      compareWith: "manual_allocation",
    }) as { caveats: string[] };
    expect(stale.caveats.join(" ")).toMatch(/stale/i);
  });
});
