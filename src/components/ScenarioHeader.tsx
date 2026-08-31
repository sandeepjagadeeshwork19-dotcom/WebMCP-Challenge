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
      <p className="eyebrow">Participatory budgeting workspace</p>
      <h1>Neighbors Decide</h1>
      <p className="task">
        Real participatory budgeting programmes &mdash; New York City, Paris, Porto Alegre &mdash;
        let residents directly allocate tens of millions of dollars in public funds every year.
        This is a hypothetical version of one such cycle: one resident allocates a{" "}
        <strong>$1,000,000</strong> capital fund across eight candidate projects, working alongside
        an AI assistant that can model options but cannot make the decision.
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
