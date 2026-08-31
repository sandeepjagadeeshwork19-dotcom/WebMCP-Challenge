import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithStore } from "../../test/renderWithStore";
import { App } from "../../App";
import { BudgetSummary } from "../BudgetSummary";
import { PriorityControls } from "../PriorityControls";
import { ProjectList } from "../ProjectList";
import { CurrentAllocation } from "../CurrentAllocation";

describe("disclosure and fallback", () => {
  it("shows the mandatory hypothetical-data disclosure and the unsupported-WebMCP notice", () => {
    renderWithStore(<App />);
    expect(screen.getAllByText(/Hypothetical demonstration:/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Agent tools are unavailable in this browser/i).length,
    ).toBeGreaterThan(0);
  });
});

describe("priority controls", () => {
  it("a resident change advances the visible budget revision", async () => {
    const user = userEvent.setup();
    renderWithStore(
      <>
        <BudgetSummary />
        <PriorityControls />
      </>,
    );
    expect(screen.getByText("Budget revision").nextSibling).toHaveTextContent("0");
    await user.click(screen.getAllByRole("radio", { name: /3 — Most important/ })[0]);
    expect(screen.getByText("Budget revision").nextSibling).toHaveTextContent("1");
  });
});

describe("manual allocation", () => {
  it("funding projects updates totals and reports incompatibility", async () => {
    const user = userEvent.setup();
    renderWithStore(
      <>
        <BudgetSummary />
        <ProjectList />
        <CurrentAllocation />
      </>,
    );

    await user.click(screen.getByRole("button", { name: /Fund P-01/ }));
    await user.click(screen.getByRole("button", { name: /Fund P-08/ }));

    expect(screen.getByText("Committed").nextSibling).toHaveTextContent("₹4,40,000");
    const allocation = screen.getByRole("region", { name: /Current allocation/i });
    expect(
      within(allocation).getByText(/cannot both be funded/i),
    ).toBeInTheDocument();
  });

  it("locked projects cannot be removed from the UI", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProjectList />);
    await user.click(screen.getByRole("button", { name: /Fund P-05/ }));
    await user.click(screen.getByRole("button", { name: /Lock P-05/ }));
    expect(screen.getByRole("button", { name: /Remove P-05/ })).toBeDisabled();
  });
});

describe("human-only review and finalisation", () => {
  it("finalise stays disabled until every precondition holds", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);

    store.dispatch({
      type: "agent/proposeAllocation",
      allocations: [
        { projectId: "P-02", amount: 150_000 },
        { projectId: "P-05", amount: 160_000 },
      ],
      rationale: "Balanced accessibility plan.",
    });

    const review = screen.getByRole("region", { name: /Human review/i });
    const finaliseButton = within(review).getByRole("button", { name: /Finalise allocation/i });
    expect(finaliseButton).toBeDisabled();

    await user.click(within(review).getByRole("button", { name: /Open review/i }));
    await user.click(within(review).getByRole("button", { name: /Accept proposal/i }));
    expect(finaliseButton).toBeDisabled();

    await user.click(within(review).getByRole("checkbox"));
    expect(finaliseButton).toBeEnabled();

    await user.click(finaliseButton);
    const record = screen.getByRole("region", { name: /Final allocation record/i });
    expect(record).toBeInTheDocument();
    expect(within(record).getAllByText(/human_finalisation/).length).toBeGreaterThan(0);
  });

  it("a human edit after a proposal marks it stale in the UI", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);
    store.dispatch({
      type: "agent/proposeAllocation",
      allocations: [{ projectId: "P-02", amount: 150_000 }],
      rationale: "Single accessible-transport investment.",
    });
    expect(await screen.findByText(/Status: Valid/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("radio", { name: /2 — Important/ })[0]);
    expect(await screen.findByText(/Status: Stale/i)).toBeInTheDocument();
  });
});
