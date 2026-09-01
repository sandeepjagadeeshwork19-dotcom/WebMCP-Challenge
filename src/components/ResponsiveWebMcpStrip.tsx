import { useWebMcpTrace } from "../webmcp/trace";

const LABELS: Record<string, string> = {
  get_budget_state: "Read shared budget state",
  list_projects: "Inspected eligible works",
  list_strategy_options: "Compared strategy directions",
  simulate_allocation: "Validated an allocation",
  propose_allocation: "Updated the visible proposal",
  explain_tradeoffs: "Explained proposal trade-offs",
  request_allocation_review: "Opened resident review",
};

export function ResponsiveWebMcpStrip({ connected, toolCount }: { connected: boolean; toolCount: number }) {
  const latest = useWebMcpTrace().at(-1);
  return (
    <aside className="webmcp-strip" aria-label="Latest WebMCP activity" aria-live="polite">
      <span className="webmcp-strip__dot" data-connected={connected || undefined} />
      <b>{latest ? "LATEST WEBMCP" : connected ? `${toolCount} WEBMCP TOOLS READY` : "WEBMCP UNAVAILABLE"}</b>
      <span>{latest ? `${LABELS[latest.toolName] ?? latest.toolName} · ${latest.summary}` : connected ? "Waiting for the first tool call" : "Use the local controls below"}</span>
    </aside>
  );
}
