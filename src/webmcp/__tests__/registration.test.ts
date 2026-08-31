import { afterEach, describe, expect, it, vi } from "vitest";
import { registerWebMcpTools } from "../register";
import { TOOL_NAMES } from "../contracts";
import { createStore } from "../../state/store";
import type { WebMcpToolDefinition } from "../types";

afterEach(() => {
  delete (document as { modelContext?: unknown }).modelContext;
  vi.restoreAllMocks();
});

describe("registerWebMcpTools", () => {
  it("registers nothing when document.modelContext is absent", async () => {
    const names = await registerWebMcpTools(createStore(), new AbortController().signal);
    expect(names).toEqual([]);
  });

  it("registers exactly the expected tools, each with the caller's abort signal", async () => {
    const registered: WebMcpToolDefinition[] = [];
    const signals: (AbortSignal | undefined)[] = [];
    (document as { modelContext?: unknown }).modelContext = {
      registerTool: (tool: WebMcpToolDefinition, options?: { signal?: AbortSignal }) => {
        registered.push(tool);
        signals.push(options?.signal);
        return Promise.resolve();
      },
    };

    const controller = new AbortController();
    const names = await registerWebMcpTools(createStore(), controller.signal);
    expect(names).toEqual([...TOOL_NAMES]);
    expect(registered).toHaveLength(TOOL_NAMES.length);
    expect(signals.every((s) => s === controller.signal)).toBe(true);
  });

  it("stops immediately if the signal is already aborted", async () => {
    let calls = 0;
    (document as { modelContext?: unknown }).modelContext = {
      registerTool: () => {
        calls += 1;
        return Promise.resolve();
      },
    };
    const controller = new AbortController();
    controller.abort();
    const names = await registerWebMcpTools(createStore(), controller.signal);
    expect(names).toEqual([]);
    expect(calls).toBe(0);
  });

  it("does not register any tool that accepts or adopts", async () => {
    const names: string[] = [];
    (document as { modelContext?: unknown }).modelContext = {
      registerTool: (tool: WebMcpToolDefinition) => {
        names.push(tool.name);
        return Promise.resolve();
      },
    };
    await registerWebMcpTools(createStore(), new AbortController().signal);
    expect(names).not.toContain("finalise_allocation");
    expect(names).not.toContain("adopt_resolution");
    expect(names).not.toContain("accept_proposal");
  });
});
