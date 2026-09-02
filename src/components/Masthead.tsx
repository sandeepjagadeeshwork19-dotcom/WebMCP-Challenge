import { HYPOTHETICAL_DISCLOSURE } from "../domain/disclosure";
import type { WebMcpState } from "../webmcp/useWebMcp";

export function Masthead({ webmcp }: { webmcp: WebMcpState }) {
  const connected = webmcp.status === "registered";
  const n = webmcp.registeredTools.length;
  const toolsText =
    webmcp.status === "registered"
      ? `${n} tools connected`
      : webmcp.status === "degraded"
        ? `${n} of 7 tools connected — retry this browser session`
        : webmcp.status === "detecting"
          ? "Looking for an assistant…"
          : "No assistant in this browser — you can still do everything by hand.";

  return (
    <header className="masthead">
      <div className="masthead__ribbon" aria-hidden="true" />
      <div className="masthead__top">
        <div>
          <p className="wordmark">NEIGHBORS DECIDE</p>
          <p className={`tools-connected${connected ? "" : " tools-connected--off"}`} role="status">
            <span className="tools-connected__dot" aria-hidden="true" />
            {toolsText}
          </p>
        </div>
        <div className={`masthead__proof${connected ? "" : " masthead__proof--off"}`}>
          <b>{connected ? `${n} WEBMCP TOOLS` : "WEBMCP TOOLS —"}</b>
          <span>0 ADOPTION TOOLS</span>
        </div>
      </div>
      <h1 className="masthead__headline">
        &#8377;10 lakh. Eight works. One resident decision.
      </h1>
      <p className="masthead__standfirst">
        The assistant can investigate, simulate and draft. Only you can protect a work and adopt the
        plan.
      </p>
      <details className="masthead__about">
        <summary>About this demonstration</summary>
        <p className="disclosure" role="note">
          {HYPOTHETICAL_DISCLOSURE}
        </p>
      </details>
    </header>
  );
}
