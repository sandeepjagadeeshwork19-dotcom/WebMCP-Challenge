/**
 * Feature-detect the WebMCP runtime and register exactly the six tools.
 * Aborting the returned controller unregisters every tool.
 */

import type { Store } from "../state/store";
import { createToolContracts, TOOL_NAMES } from "./contracts";
import { createHandlers } from "./handlers";
import { getModelContext } from "./types";

export interface RegistrationResult {
  supported: boolean;
  registeredTools: string[];
  unregister: () => void;
}

export async function registerWebMcpTools(store: Store): Promise<RegistrationResult> {
  const modelContext = getModelContext();
  if (!modelContext) {
    return { supported: false, registeredTools: [], unregister: () => {} };
  }

  const controller = new AbortController();
  const handlers = createHandlers(store);
  const contracts = createToolContracts(handlers);
  const registered: string[] = [];

  for (const tool of contracts) {
    try {
      await modelContext.registerTool(tool, { signal: controller.signal });
      registered.push(tool.name);
    } catch (error) {
      // Leave already-registered tools in place; report what actually landed.
      console.warn(`WebMCP: failed to register ${tool.name}`, error);
    }
  }

  return {
    supported: true,
    registeredTools: registered,
    unregister: () => controller.abort(),
  };
}

export { TOOL_NAMES };
