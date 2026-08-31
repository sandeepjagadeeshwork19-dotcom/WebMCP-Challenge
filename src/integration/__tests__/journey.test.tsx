import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithStore } from "../../test/renderWithStore";
import { App } from "../../App";
import { createHandlers } from "../../webmcp/handlers";
import { isToolError } from "../../webmcp/errors";

describe("primary journey — tool/UI parity through stale, re-propose, review, finalise, reset", () => {
  it("completes the full loop with shared state", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);
    const tools = createHandlers(store);

    // 1. Resident sets safety + accessibility to most important (human, +2 revisions).
    await user.click(screen.getAllByRole("radio", { name: /3 — Most important/ })[0]);
    await user.click(screen.getAllByRole("radio", { name: /3 — Most important/ })[1]);
    expect(store.getState().budgetRevision).toBe(2);

    // 2. Agent reads the same revision the page shows.
    const state1 = tools.get_budget_state({}) as { budgetRevision: number };
    expect(state1.budgetRevision).toBe(2);

    // 3. Agent simulates an over-budget combination -> valid:false, no mutation.
    const sim = tools.simulate_allocation({
      budgetRevision: 2,
      allocations: [
        { projectId: "P-08", amount: 260_000 },
        { projectId: "P-04", amount: 240_000 },
        { projectId: "P-05", amount: 160_000 },
        { projectId: "P-02", amount: 150_000 },
        { projectId: "P-07", amount: 140_000 },
        { projectId: "P-06", amount: 90_000 },
      ],
    }) as { valid: boolean };
    expect(sim.valid).toBe(false);
    expect(store.getState().proposalRevision).toBe(0);

    // 4. Agent proposes a valid plan.
    tools.propose_allocation({
      budgetRevision: 2,
      allocations: [
        { projectId: "P-01", amount: 180_000 },
        { projectId: "P-02", amount: 150_000 },
        { projectId: "P-04", amount: 240_000 },
        { projectId: "P-05", amount: 160_000 },
        { projectId: "P-07", amount: 140_000 },
      ],
      rationale: "Safety-and-access plan within budget.",
    });
    expect(await screen.findByText(/Status: Valid/i)).toBeInTheDocument();

    // 5. Resident makes a value judgment: fund + lock the playground (needs P-04).
    await user.click(screen.getByRole("button", { name: /Fund P-03/ }));
    await user.click(screen.getByRole("button", { name: /Lock P-03/ }));
    expect(screen.getByText(/Status: Stale/i)).toBeInTheDocument();

    // 6. Old revision now rejected by the review tool.
    const staleReview = tools.request_allocation_review({ budgetRevision: 2, proposalRevision: 1 });
    expect(isToolError(staleReview) && staleReview.error.code).toBe("stale_budget_revision");

    // 7. Agent re-reads, re-proposes preserving the lock.
    const state2 = tools.get_budget_state({}) as { budgetRevision: number };
    tools.propose_allocation({
      budgetRevision: state2.budgetRevision,
      allocations: [
        { projectId: "P-02", amount: 150_000 },
        { projectId: "P-03", amount: 210_000 },
        { projectId: "P-04", amount: 240_000 },
        { projectId: "P-05", amount: 160_000 },
        { projectId: "P-06", amount: 90_000 },
      ],
      rationale: "Revised plan keeps the locked playground and required drainage.",
    });
    expect(store.getState().proposalStatus).toBe("valid");

    // 8. Agent requests review; UI review region opens.
    const opened = tools.request_allocation_review({
      budgetRevision: state2.budgetRevision,
      proposalRevision: 2,
    }) as { reviewStatus: string };
    expect(opened.reviewStatus).toBe("open");

    // 9. There is no finalisation tool.
    expect(Object.keys(tools)).not.toContain("finalise_allocation");

    // 10. Resident accepts, acknowledges disclosure, finalises via visible controls.
    const review = screen.getByRole("region", { name: /Human review/i });
    await user.click(within(review).getByRole("button", { name: /Accept proposal/i }));
    await user.click(within(review).getByRole("checkbox"));
    await user.click(within(review).getByRole("button", { name: /Finalise allocation/i }));

    expect(screen.getByRole("region", { name: /Final allocation record/i })).toBeInTheDocument();
    const finalState = tools.get_budget_state({}) as { finalised: boolean };
    expect(finalState.finalised).toBe(true);

    // 11. Reset restores the initial scenario.
    await user.click(screen.getByRole("button", { name: /^Reset demo$/ }));
    await user.click(screen.getByRole("button", { name: /Confirm reset/ }));
    const resetState = tools.get_budget_state({}) as {
      budgetRevision: number;
      finalised: boolean;
      proposal: unknown;
    };
    expect(resetState.budgetRevision).toBe(0);
    expect(resetState.finalised).toBe(false);
    expect(resetState.proposal).toBeNull();
    expect(store.getState().demoResetVersion).toBe(1);
  });
});
