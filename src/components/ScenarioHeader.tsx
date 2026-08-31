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
      <p className="eyebrow">Participatory budgeting &middot; ward development fund</p>
      <h1>Neighbors Decide</h1>
      <p className="task">
        Under the 73rd and 74th Constitutional Amendments, local development
        planning belongs to the gram sabha and the ward committee &mdash; and Kerala&rsquo;s
        People&rsquo;s Plan has devolved budgets this way for decades. This is a hypothetical
        version of one ward&rsquo;s cycle: one resident allocates a{" "}
        <strong>&#8377;10,00,000</strong> development fund across eight candidate works, alongside an
        AI assistant that can model every option but cannot make the decision.
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
