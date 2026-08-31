import { Disclosure } from "./Disclosure";
import type { WebMcpState } from "../webmcp/useWebMcp";

const STATUS_TEXT: Record<WebMcpState["status"], string> = {
  detecting: "Detecting agent tools…",
  unsupported: "Agent tools are unavailable in this browser; the full manual workspace still works.",
  registered: "Agent tools registered.",
  error: "Agent tools could not be registered; the full manual workspace still works.",
};

export function ScenarioHeader({ webmcp }: { webmcp: WebMcpState }) {
  return (
    <header className="scenario-header">
      <p className="eyebrow">Participatory Budget Workspace</p>
      <h1>Neighbors Decide</h1>
      <p className="task">
        One resident allocates a hypothetical <strong>$1,000,000</strong> neighbourhood-improvement
        fund across exactly eight hypothetical capital projects. This is a capital-allocation
        exercise, not a real municipal budget.
      </p>
      <Disclosure id="hypothetical-disclosure" />
      <p
        className={`webmcp-status webmcp-status--${webmcp.status}`}
        role="status"
      >
        {STATUS_TEXT[webmcp.status]}
        {webmcp.status === "registered" && webmcp.registeredTools.length > 0 && (
          <> ({webmcp.registeredTools.join(", ")})</>
        )}
      </p>
    </header>
  );
}
