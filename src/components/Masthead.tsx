import { HYPOTHETICAL_DISCLOSURE } from "../domain/disclosure";
import type { WebMcpState } from "../webmcp/useWebMcp";

const TOOL_NOTE = "read state, list works, compare, simulate, propose, explain, request review";

export function Masthead({ webmcp }: { webmcp: WebMcpState }) {
  const [lead, ...rest] = HYPOTHETICAL_DISCLOSURE.split(": ");
  const connected = webmcp.status === "registered";
  const toolsText =
    webmcp.status === "registered"
      ? `${webmcp.registeredTools.length} assistant tools connected — ${TOOL_NOTE}`
      : webmcp.status === "detecting"
        ? "Detecting assistant tools…"
        : "Assistant tools unavailable in this browser — the workspace still works manually";

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
        <p className="docket">WARD DEVELOPMENT FUND · WORKING DRAFT · NO. WD-12</p>
      </div>
      <h1 className="masthead__headline">
        Decide which ward works should receive the &#8377;10 lakh
      </h1>
      <p className="masthead__standfirst">
        A resident allocates a hypothetical &#8377;10,00,000 ward development fund across eight
        candidate works. An assistant can model every option and pencil a full draft &mdash; but only
        the resident chooses, reviews and adopts.
      </p>
      <p className="disclosure" role="note">
        <strong>{lead}:</strong> {rest.join(": ")}
      </p>
    </header>
  );
}
