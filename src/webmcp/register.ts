/**
 * Feature-detect the WebMCP runtime and register the tools against a caller-owned
 * AbortSignal. Aborting that signal unregisters every tool.
 *
 * The caller (`useWebMcp`) owns the signal so it can abort synchronously in an
 * effect cleanup - important under React StrictMode, which runs the effect
 * setup / cleanup / setup. The loop also checks `signal.aborted` between tools so
 * a cancelled pass stops immediately instead of racing a second one.
 */

import type { Store } from "../state/store";
import { createToolContracts, TOOL_NAMES } from "./contracts";
import { createHandlers } from "./handlers";
import { getModelContext } from "./types";

export async function registerWebMcpTools(
  store: Store,
  signal: AbortSignal,
): Promise<string[]> {
  const modelContext = getModelContext();
  if (!modelContext || signal.aborted) return [];

  const handlers = createHandlers(store);
  const contracts = createToolContracts(handlers);
  const registered: string[] = [];

  for (const tool of contracts) {
    if (signal.aborted) return [];
    try {
      await modelContext.registerTool(tool, { signal });
      registered.push(tool.name);
    } catch (error) {
      if (signal.aborted) return [];
      console.warn(`WebMCP: failed to register ${tool.name}`, error);
    }
  }

  return signal.aborted ? [] : registered;
}

export { TOOL_NAMES };
