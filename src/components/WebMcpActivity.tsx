import { useWebMcpTrace } from "../webmcp/trace";

const DISPLAY_NAMES: Record<string, string> = {
  get_budget_state: "get state",
  list_projects: "list works",
  list_strategy_options: "compare directions",
  simulate_allocation: "simulate",
  propose_allocation: "propose",
  explain_tradeoffs: "explain",
  request_allocation_review: "request review",
};

export function WebMcpActivity() {
  const events = useWebMcpTrace();

  return (
    <section className="tool-trace" aria-labelledby="tool-trace-heading">
      <div className="tool-trace__head">
        <h2 id="tool-trace-heading">LIVE WEBMCP TRACE</h2>
        <span>{events.length > 0 ? `${events.length} call${events.length === 1 ? "" : "s"}` : "waiting"}</span>
      </div>

      {events.length === 0 ? (
        <div className="tool-trace__empty">
          <p>No WebMCP call yet.</p>
          <p>Ordinary page clicks do not appear here.</p>
        </div>
      ) : (
        <ol className="tool-trace__list" aria-live="polite">
          {events.map((event) => (
            <li className="tool-trace__event" data-status={event.status} key={event.id}>
              <div className="tool-trace__event-head">
                <code>{DISPLAY_NAMES[event.toolName] ?? event.toolName}</code>
                <span>{event.mode.toUpperCase()}</span>
              </div>
              <p>{event.summary}</p>
              <small>
                budget {event.budgetRevision} · proposal {event.proposalRevision}
              </small>
            </li>
          ))}
        </ol>
      )}

      <div className="assistant-prompt">
        <span>TRY ASKING YOUR BROWSER ASSISTANT</span>
        <p>
          “Read this budget, simulate a valid plan around my priorities, and propose it for review.”
        </p>
      </div>
    </section>
  );
}
