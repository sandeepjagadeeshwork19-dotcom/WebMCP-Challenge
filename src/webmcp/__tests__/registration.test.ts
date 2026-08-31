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
  it("reports unsupported when document.modelContext is absent", async () => {
    const result = await registerWebMcpTools(createStore());
    expect(result.supported).toBe(false);
    expect(result.registeredTools).toEqual([]);
  });

  it("registers exactly the expected tools with an abort signal when supported", async () => {
    const registered: WebMcpToolDefinition[] = [];
    const signals: (AbortSignal | undefined)[] = [];
    (document as { modelContext?: unknown }).modelContext = {
      registerTool: (tool: WebMcpToolDefinition, options?: { signal?: AbortSignal }) => {
        registered.push(tool);
        signals.push(options?.signal);
        return Promise.resolve();
      },
    };

    const result = await registerWebMcpTools(createStore());
    expect(result.supported).toBe(true);
    expect(result.registeredTools).toEqual([...TOOL_NAMES]);
    expect(registered).toHaveLength(TOOL_NAMES.length);
    expect(signals.every((s) => s instanceof AbortSignal)).toBe(true);

    // Aborting unregisters: the shared signal is now aborted.
    result.unregister();
    expect(signals[0]?.aborted).toBe(true);
  });

  it("does not register a finalisation tool", async () => {
    const names: string[] = [];
    (document as { modelContext?: unknown }).modelContext = {
      registerTool: (tool: WebMcpToolDefinition) => {
        names.push(tool.name);
        return Promise.resolve();
      },
    };
    await registerWebMcpTools(createStore());
    expect(names).not.toContain("finalise_allocation");
    expect(names).not.toContain("finalize_allocation");
  });
});
