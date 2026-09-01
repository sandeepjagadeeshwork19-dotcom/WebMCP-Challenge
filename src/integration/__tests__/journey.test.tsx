import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithStore } from "../../test/renderWithStore";
import { App } from "../../App";
import { createHandlers } from "../../webmcp/handlers";
import { isToolError } from "../../webmcp/errors";

describe("primary journey — tool/UI parity through compare, the turn, review, adopt, reset", () => {
  it("completes the full loop on one shared store", { timeout: 25_000 }, async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);
    const tools = createHandlers(store);

    // 1. Resident sets safety + accessibility to most important (2 human revisions).
    const safety = screen.getByRole("radiogroup", { name: /Safety priority/i });
    const access = screen.getByRole("radiogroup", { name: /Accessibility priority/i });
    await user.click(within(safety).getByRole("radio", { name: "Safety 3" }));
    await user.click(within(access).getByRole("radio", { name: "Accessibility 3" }));
    expect(store.getState().budgetRevision).toBe(2);

    // 2. Agent reads the same revision the page shows.
    expect((tools.get_budget_state({}) as { budgetRevision: number }).budgetRevision).toBe(2);
    expect(screen.getByRole("heading", { name: /LIVE WEBMCP TRACE/i })).toBeInTheDocument();
    expect(await screen.findByText("get state")).toBeInTheDocument();

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

    // 4. Agent proposes a valid plan; the draft resolution shows.
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
    expect(await screen.findByText(/DRAFT RESOLUTION — WD-12/i)).toBeInTheDocument();
    expect(screen.getByText(/WEBMCP ASSISTANT PROPOSAL/i)).toBeInTheDocument();

    // 5. Value judgment: protect the riverside play area (P-03, not in the draft, needs P-04).
    const row = screen.getByText("Riverside play area upgrade").closest(".schedule__row")!;
    await user.click(within(row as HTMLElement).getByRole("button", { name: /Protect/i }));
    expect(await screen.findByText(/This draft is stale/i)).toBeInTheDocument();

    // 6. Old revision now rejected by the review tool.
    const staleReview = tools.request_allocation_review({ budgetRevision: 2, proposalRevision: 1 });
    expect(isToolError(staleReview) && staleReview.error.code).toBe("stale_budget_revision");

    // 7. Agent re-reads, re-proposes preserving the protected work.
    const rev = (tools.get_budget_state({}) as { budgetRevision: number }).budgetRevision;
    tools.propose_allocation({
      budgetRevision: rev,
      allocations: [
        { projectId: "P-02", amount: 150_000 },
        { projectId: "P-03", amount: 210_000 },
        { projectId: "P-04", amount: 240_000 },
        { projectId: "P-05", amount: 160_000 },
        { projectId: "P-06", amount: 90_000 },
      ],
      rationale: "Revised plan keeps the protected play area and its required drain.",
    });
    expect(store.getState().proposalStatus).toBe("valid");

    // 8. Agent requests review; the human-only review region opens.
    const opened = tools.request_allocation_review({ budgetRevision: rev, proposalRevision: 2 }) as {
      reviewStatus: string;
    };
    expect(opened.reviewStatus).toBe("open");
    expect(
      await screen.findByText(/WebMCP hands control back here/i),
    ).toBeInTheDocument();

    // 9. There is no finalisation / adopt tool.
    expect(Object.keys(tools)).not.toContain("finalise_allocation");
    expect(Object.keys(tools)).not.toContain("adopt_resolution");

    // 10. Resident accepts, acknowledges, adopts via visible controls only.
    await user.click(screen.getByRole("button", { name: /Accept the draft/i }));
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /Adopt resolution WD-12/i }));
    expect(screen.getByText(/RESOLUTION WD-12 — ADOPTED/i)).toBeInTheDocument();
    expect((tools.get_budget_state({}) as { finalised: boolean }).finalised).toBe(true);

    // 11. Reset restores the initial scenario.
    await user.click(screen.getByRole("button", { name: /Reset — run the demonstration again/i }));
    await user.click(screen.getByRole("button", { name: /Confirm reset/i }));
    const after = tools.get_budget_state({}) as { budgetRevision: number; proposal: unknown };
    expect(after.budgetRevision).toBe(0);
    expect(after.proposal).toBeNull();
    expect(store.getState().demoResetVersion).toBe(1);
  });
});
