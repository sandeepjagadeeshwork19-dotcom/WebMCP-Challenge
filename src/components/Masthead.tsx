import { HYPOTHETICAL_DISCLOSURE } from "../domain/disclosure";
import type { WebMcpState } from "../webmcp/useWebMcp";

export function Masthead({ webmcp }: { webmcp: WebMcpState }) {
  const connected = webmcp.status === "registered";
  const toolsText =
    webmcp.status === "registered"
      ? `${webmcp.registeredTools.length} tools connected`
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
        <p className="docket">WARD FUND · DRAFT WD-12</p>
      </div>
      <h1 className="masthead__headline">
        Decide which ward works should receive the &#8377;10 lakh
      </h1>
      <p className="masthead__standfirst">
        You have &#8377;10,00,000 to split across eight ward works. The assistant can suggest and
        draft plans. You pick, you decide.
      </p>
      <p className="disclosure" role="note">
        {HYPOTHETICAL_DISCLOSURE}
      </p>
    </header>
  );
}
