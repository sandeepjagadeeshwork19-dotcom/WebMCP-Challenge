import { useSyncExternalStore } from "react";
import type { Store } from "../state/store";
import { useStore } from "../state/store";
import { isToolError } from "./errors";
import type { ToolName } from "./contracts";

export type ToolMode = "read" | "write";
export type ToolTraceStatus = "ok" | "blocked";

export interface ToolTraceEvent {
  id: string;
  sequence: number;
  toolName: ToolName;
  mode: ToolMode;
  status: ToolTraceStatus;
  summary: string;
  budgetRevision: number;
  proposalRevision: number;
  timestamp: string;
}

interface ToolTraceStore {
  getSnapshot: () => readonly ToolTraceEvent[];
  subscribe: (listener: () => void) => () => void;
  record: (toolName: ToolName, mode: ToolMode, result: unknown) => void;
}

const traces = new WeakMap<Store, ToolTraceStore>();

function money(value: unknown): string {
  return typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : "the allocation";
}

function resultRecord(result: unknown): Record<string, unknown> {
  return typeof result === "object" && result !== null
    ? (result as Record<string, unknown>)
    : {};
}

function summaryFor(toolName: ToolName, result: unknown): string {
  if (isToolError(result)) return `${result.error.code}: ${result.error.message}`;
  const value = resultRecord(result);

  switch (toolName) {
    case "get_budget_state":
      return `Read canonical budget state at revision ${String(value.budgetRevision ?? "—")}`;
    case "list_projects":
      return `Returned ${Array.isArray(value.projects) ? value.projects.length : 0} structured projects`;
    case "list_strategy_options":
      return `Compared ${Array.isArray(value.strategies) ? value.strategies.length : 0} valid directions`;
    case "simulate_allocation":
      return `${value.valid ? "Validated" : "Rejected"} ${money(value.committedTotal)} simulation`;
    case "propose_allocation":
      return `Stored proposal rev ${String(value.proposalRevision ?? "—")} · ${String(value.status ?? "unknown")}`;
    case "explain_tradeoffs":
      return `Explained trade-offs for proposal rev ${String(value.proposalRevision ?? "—")}`;
    case "request_allocation_review":
      return `Requested resident review of proposal rev ${String(value.proposalRevision ?? "—")}`;
  }
}

export function getWebMcpTrace(store: Store): ToolTraceStore {
  const existing = traces.get(store);
  if (existing) return existing;

  let events: readonly ToolTraceEvent[] = [];
  let sequence = 0;
  const listeners = new Set<() => void>();
  const trace: ToolTraceStore = {
    getSnapshot: () => events,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    record: (toolName, mode, result) => {
      sequence += 1;
      const state = store.getState();
      const event: ToolTraceEvent = {
        id: `webmcp-${sequence}`,
        sequence,
        toolName,
        mode,
        status: isToolError(result) ? "blocked" : "ok",
        summary: summaryFor(toolName, result),
        budgetRevision: state.budgetRevision,
        proposalRevision: state.proposalRevision,
        timestamp: new Date().toISOString(),
      };
      events = [...events, event].slice(-7);
      for (const listener of listeners) listener();
    },
  };
  traces.set(store, trace);
  return trace;
}

export function useWebMcpTrace(): readonly ToolTraceEvent[] {
  const trace = getWebMcpTrace(useStore());
  return useSyncExternalStore(trace.subscribe, trace.getSnapshot, trace.getSnapshot);
}
