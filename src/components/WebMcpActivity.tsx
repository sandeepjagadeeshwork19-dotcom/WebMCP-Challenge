import { useWebMcpTrace } from "../webmcp/trace";

const DISPLAY_NAMES: Record<string, string> = {
  get_budget_state: "get state",
  list_projects: "list works",
  list_strategy_options: "compare plans",
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
          <p>
            Ask your browser assistant: &ldquo;read this budget and propose a plan.&rdquo; Its calls
            show up here.
          </p>
        </div>
      ) : (
        <ol className="tool-trace__list" aria-live="polite">
          {[...events].slice(-4).reverse().map((event, index) => (
            <li
              className="tool-trace__event"
              data-status={event.status}
              data-current={index === 0 ? "true" : "false"}
              key={event.id}
            >
              <div className="tool-trace__event-head">
                <code>{DISPLAY_NAMES[event.toolName] ?? event.toolName}</code>
                <span>{event.mode.toUpperCase()}</span>
              </div>
              <p>{event.summary}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
