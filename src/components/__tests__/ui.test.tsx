import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithStore } from "../../test/renderWithStore";
import { App } from "../../App";

describe("shell", () => {
  it("shows the mandatory hypothetical-data disclosure and the WebMCP-absent fallback", () => {
    renderWithStore(<App />);
    expect(screen.getAllByText(/Hypothetical demonstration:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Assistant tools unavailable/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Decide which ward works should receive the ₹10 lakh/i),
    ).toBeInTheDocument();
  });
});

describe("priorities + compare", () => {
  it("setting a priority advances the budget revision and shows three directions", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);

    expect(screen.getByText(/proposal rev 0/i)).toHaveTextContent(/incomplete/i);

    const safety = screen.getByRole("radiogroup", { name: /Safety priority/i });
    await user.click(within(safety).getByRole("radio", { name: "Safety 3" }));

    expect(store.getState().budgetRevision).toBe(1);
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeGreaterThanOrEqual(3);
    expect(within(cards[0]).getByRole("heading", { name: /Safety & access first/i })).toBeInTheDocument();
  });

  it("choosing a direction loads a draft resolution", async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);
    await user.click(screen.getByRole("button", { name: /Choose DIRECTION A/i }));
    expect(await screen.findByText(/DRAFT RESOLUTION — WD-12/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Review this resolution/i })).toBeInTheDocument();
  });
});

describe("the turn — protecting a work stales the draft", () => {
  it("protecting the play area moves to the stale/re-plan state", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);
    await user.click(screen.getByRole("button", { name: /Choose DIRECTION A/i }));
    // P-03 is not in Direction A; protecting it stales the draft
    const scheduleRow = screen.getByText("Riverside play area upgrade").closest(".schedule__row")!;
    await user.click(within(scheduleRow as HTMLElement).getByRole("button", { name: /Protect/i }));

    expect(store.getState().proposalStatus).toBe("stale");
    expect(await screen.findByText(/This draft is stale/i)).toBeInTheDocument();
    expect(screen.getByText(/STALE/)).toBeInTheDocument();
  });
});

describe("review is human-only and gated", () => {
  it("Adopt stays disabled until the resident accepts and acknowledges", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);
    store.dispatch({ type: "human/setPriority", key: "safety", weight: 3 });
    store.dispatch({
      type: "agent/proposeAllocation",
      allocations: [
        { projectId: "P-02", amount: 150_000 },
        { projectId: "P-05", amount: 160_000 },
      ],
      rationale: "Two accessible-transport and health investments.",
    });
    await user.click(await screen.findByRole("button", { name: /Review this resolution/i }));

    expect(
      screen.getByText(/Only the resident can accept, revise, reject or adopt/i),
    ).toBeInTheDocument();

    const adopt = screen.getByRole("button", { name: /Adopt resolution WD-12/i });
    expect(adopt).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Accept the draft/i }));
    expect(adopt).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    expect(adopt).toBeEnabled();

    await user.click(adopt);
    expect(screen.getByText(/RESOLUTION WD-12 — ADOPTED/i)).toBeInTheDocument();
    expect(screen.getAllByText(/human_finalisation/).length).toBeGreaterThan(0);
  });
});
