import { describe, expect, it } from "vitest";
import { reducer } from "../reducer";
import { createInitialState, type AppState } from "../appState";
import type { AppAction } from "../actions";

let clock = 0;
function run(state: AppState, ...actions: AppAction[]): AppState {
  return actions.reduce((acc, action) => {
    clock += 1;
    return reducer(acc, { ...action, timestamp: `2026-08-31T00:00:${String(clock).padStart(2, "0")}.000Z` });
  }, state);
}

const validPlan: AppAction = {
  type: "agent/proposeAllocation",
  allocations: [
    { projectId: "P-02", amount: 150_000 },
    { projectId: "P-05", amount: 160_000 },
  ],
  rationale: "Two strong accessibility investments within budget.",
};

describe("human budget changes", () => {
  it("increment budgetRevision exactly once per action", () => {
    const s = run(
      createInitialState(),
      { type: "human/setPriority", key: "safety", weight: 3 },
      { type: "human/setAllocation", projectId: "P-02", amount: 150_000 },
      { type: "human/lockProject", projectId: "P-02" },
    );
    expect(s.budgetRevision).toBe(3);
    expect(s.lockedAllocations).toEqual([{ projectId: "P-02", amount: 150_000 }]);
  });

  it("no-op actions do not increment the revision", () => {
    const s = run(createInitialState(), { type: "human/setPriority", key: "safety", weight: 0 });
    expect(s.budgetRevision).toBe(0);
  });

});

describe("agent proposals", () => {
  it("increment proposalRevision, not budgetRevision, and store agent attribution", () => {
    const s = run(createInitialState(), validPlan);
    expect(s.budgetRevision).toBe(0);
    expect(s.proposalRevision).toBe(1);
    expect(s.proposalStatus).toBe("valid");
    expect(s.agentProposal?.createdBy).toBe("agent");
    expect(s.agentProposal?.basedOnBudgetRevision).toBe(0);
    expect(s.activityHistory.at(-1)?.actor).toBe("agent");
  });

  it("store an invalid proposal visibly and keep it out of review", () => {
    const s = run(createInitialState(), {
      type: "agent/proposeAllocation",
      allocations: [{ projectId: "P-01", amount: 100_000 }],
      rationale: "Intentionally invalid partial funding.",
    });
    expect(s.proposalStatus).toBe("invalid");
    expect(s.constraintValidation?.valid).toBe(false);
    const after = run(s, { type: "agent/requestReview" });
    expect(after.proposalStatus).toBe("invalid");
    expect(after.reviewStatus).toBe("none");
  });

  it("loads a direction rebuilt around protected works", () => {
    const s = run(
      createInitialState(),
      { type: "human/lockProjectAt", projectId: "P-03", amount: 210_000 },
      { type: "app/loadDirectionDraft", strategyId: "safety_access" },
    );
    expect(s.proposalStatus).toBe("valid");
    expect(s.agentProposal?.allocations).toContainEqual({ projectId: "P-03", amount: 210_000 });
  });

  it("rejects a protection that makes the protected set infeasible", () => {
    const s = run(
      createInitialState(),
      { type: "human/lockProjectAt", projectId: "P-01", amount: 180_000 },
      { type: "human/lockProjectAt", projectId: "P-08", amount: 260_000 },
    );
    expect(s.budgetRevision).toBe(1);
    expect(s.lockedAllocations).toEqual([{ projectId: "P-01", amount: 180_000 }]);
    expect(s.protectionError).toMatch(/cannot both be funded/i);
    expect(s.activityHistory.at(-1)?.action).toBe("protect_blocked");
  });
});

describe("staleness", () => {
  it("a human edit stales a valid proposal and closes review", () => {
    let s = run(createInitialState(), validPlan);
    s = run(s, { type: "agent/requestReview" });
    expect(s.proposalStatus).toBe("under_review");
    s = run(s, { type: "human/setPriority", key: "climate", weight: 2 });
    expect(s.proposalStatus).toBe("stale");
    expect(s.reviewStatus).toBe("none");
  });

  it("a stale proposal cannot enter review", () => {
    let s = run(createInitialState(), validPlan, {
      type: "human/setPriority",
      key: "safety",
      weight: 1,
    });
    expect(s.proposalStatus).toBe("stale");
    s = run(s, { type: "agent/requestReview" });
    expect(s.proposalStatus).toBe("stale");
  });
});

describe("review and finalisation", () => {
  function toAccepted(): AppState {
    let s = run(createInitialState(), validPlan);
    s = run(s, { type: "agent/requestReview" });
    s = run(s, { type: "human/acceptProposal" });
    return s;
  }

  it("human accept does not finalise", () => {
    const s = toAccepted();
    expect(s.proposalStatus).toBe("accepted");
    expect(s.finalAllocationRecord).toBeNull();
  });

  it("finalisation is blocked without the disclosure acknowledgement", () => {
    const s = run(toAccepted(), { type: "human/finalise" });
    expect(s.proposalStatus).toBe("accepted");
    expect(s.finalAllocationRecord).toBeNull();
  });

  it("finalisation revalidates and writes an immutable human-attributed record", () => {
    let s = toAccepted();
    s = run(s, { type: "human/setDisclosureAck", acknowledged: true });
    s = run(s, { type: "human/finalise" });
    expect(s.proposalStatus).toBe("finalised");
    expect(s.reviewStatus).toBe("completed");
    expect(s.finalAllocationRecord?.actor).toBe("human_finalisation");
    expect(s.finalAllocationRecord?.validation.valid).toBe(true);
    expect(s.activityHistory.at(-1)?.actor).toBe("human");
  });

  it("makes adoption terminal until the resident explicitly resets", () => {
    let s = toAccepted();
    s = run(s, { type: "human/setDisclosureAck", acknowledged: true }, { type: "human/finalise" });
    const finalRecord = s.finalAllocationRecord;
    s = run(
      s,
      { type: "human/setPriority", key: "safety", weight: 3 },
      {
        type: "agent/proposeAllocation",
        allocations: [
          { projectId: "P-02", amount: 150_000 },
          { projectId: "P-05", amount: 160_000 },
        ],
        rationale: "Replace it.",
      },
    );
    expect(s.proposalStatus).toBe("finalised");
    expect(s.finalAllocationRecord).toBe(finalRecord);
    expect(s.residentPriorities.safety).toBe(0);
  });
});

describe("attribution and reset", () => {
  it("actor is derived from the action, never taken from payload", () => {
    const s = run(createInitialState(), {
      type: "agent/proposeAllocation",
      allocations: [{ projectId: "P-02", amount: 150_000 }],
      rationale: "test",
      // @ts-expect-error attempt to smuggle an actor label
      actor: "human",
    });
    expect(s.activityHistory.at(-1)?.actor).toBe("agent");
  });

  it("reset restores initial values, clears history and bumps the reset version", () => {
    let s = run(createInitialState(), validPlan, {
      type: "human/setPriority",
      key: "safety",
      weight: 3,
    });
    s = run(s, { type: "human/reset" });
    expect(s.budgetRevision).toBe(0);
    expect(s.proposalRevision).toBe(0);
    expect(s.agentProposal).toBeNull();
    expect(s.residentPriorities.safety).toBe(0);
    expect(s.demoResetVersion).toBe(1);
    expect(s.activityHistory).toHaveLength(1);
    expect(s.activityHistory[0].action).toBe("reset_demo");
  });
});
