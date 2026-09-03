import { StrictMode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithStore } from "../../test/renderWithStore";
import { App } from "../../App";
import { StoreProvider } from "../../state/store";
import { TOOL_NAMES } from "../../webmcp/contracts";
import type { WebMcpToolDefinition } from "../../webmcp/types";

afterEach(() => {
  delete (document as { modelContext?: unknown }).modelContext;
});

describe("WebMCP registration under StrictMode", () => {
  it("registers every tool exactly once despite the setup/cleanup/setup double-invoke", async () => {
    const live = new Set<string>();
    const attempts: string[] = [];
    (document as { modelContext?: unknown }).modelContext = {
      registerTool: (tool: WebMcpToolDefinition, options?: { signal?: AbortSignal }) => {
        attempts.push(tool.name);
        if (live.has(tool.name)) {
          return Promise.reject(new Error(`already registered: ${tool.name}`));
        }
        live.add(tool.name);
        options?.signal?.addEventListener("abort", () => live.delete(tool.name));
        return Promise.resolve();
      },
    };

    render(
      <StrictMode>
        <StoreProvider>
          <App />
        </StoreProvider>
      </StrictMode>,
    );

    await waitFor(() =>
      expect(
        screen.getByText(new RegExp(`${TOOL_NAMES.length} tools connected`, "i")),
      ).toBeInTheDocument(),
    );
    expect([...live].sort()).toEqual([...TOOL_NAMES].sort());
    // no duplicate-registration rejections logged for a tool that stayed live
    expect(attempts.length).toBe(TOOL_NAMES.length);
  });

  it("reports partial tool registration as degraded instead of connected", async () => {
    let attempts = 0;
    (document as { modelContext?: unknown }).modelContext = {
      registerTool: () => {
        attempts += 1;
        return attempts === 1 ? Promise.resolve() : Promise.reject(new Error("unavailable"));
      },
    };
    renderWithStore(<App />);
    await waitFor(() => expect(screen.getByText(/1 of 7 tools connected/i)).toBeInTheDocument());
    expect(screen.getByText(/only partly connected/i)).toBeInTheDocument();
  });
});

describe("shell", () => {
  it("shows the data disclosure and the WebMCP-absent fallback", () => {
    renderWithStore(<App />);
    expect(screen.getAllByText(/A demonstration with invented ward works/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/No assistant in this browser/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});

describe("priorities + compare", () => {
  it("the plans stay hidden until priorities are confirmed", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);

    expect(screen.getByText(/incomplete/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    // priorities screen: the eight works, no plan cards
    expect(screen.getByText(/These eight works are competing/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);

    const safety = screen.getByRole("radiogroup", { name: /Safety priority/i });
    await user.click(within(safety).getByRole("radio", { name: "Safety 3" }));
    expect(store.getState().budgetRevision).toBe(1);
    expect(screen.queryAllByRole("article")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: /Compare plans/i }));
    expect(screen.getByText(/Step 2 of 5/i)).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeGreaterThanOrEqual(3);
    expect(within(cards[0]).getByRole("heading", { name: /Safety & access first/i })).toBeInTheDocument();
  });

  it("starting from a plan loads a draft resolution", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);
    store.dispatch({ type: "human/confirmPriorities" });
    await user.click(await screen.findByRole("button", { name: /Start from Safety & access first/i }));
    expect(await screen.findByText(/DRAFT RESOLUTION: WD-12/i)).toBeInTheDocument();
    expect(screen.getByText(/READY-MADE PLAN/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send to review/i })).toBeInTheDocument();
  });
});

describe("the turn - protecting a work stales the draft", () => {
  it("protecting the play area moves to the stale/re-plan state", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);
    store.dispatch({ type: "human/confirmPriorities" });
    await user.click(await screen.findByRole("button", { name: /Start from Safety & access first/i }));
    // P-03 is not in that plan; protecting it stales the draft
    const scheduleRow = screen.getByText("Riverside play area upgrade").closest(".schedule__row")!;
    await user.click(within(scheduleRow as HTMLElement).getByRole("button", { name: /Protect/i }));

    expect(store.getState().proposalStatus).toBe("stale");
    expect(await screen.findByText(/needs to be redrawn to fit it in/i)).toBeInTheDocument();
    expect(screen.getByText(/STALE/)).toBeInTheDocument();
  });
});

describe("review is human-only and gated", () => {
  it("reveals Adopt only after acceptance and enables it after acknowledgement", async () => {
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
    await user.click(await screen.findByRole("button", { name: /Send to review/i }));

    expect(
      screen.getByText(/The assistant can.t accept or adopt a plan/i),
    ).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /Adopt resolution WD-12/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Accept this plan/i }));
    const adopt = screen.getByRole("button", { name: /Adopt resolution WD-12/i });
    expect(adopt).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    expect(adopt).toBeEnabled();

    await user.click(adopt);
    expect(screen.getByText(/RESOLUTION WD-12: ADOPTED/i)).toBeInTheDocument();
    expect(screen.getAllByText(/human_finalisation/).length).toBeGreaterThan(0);
  });
});
