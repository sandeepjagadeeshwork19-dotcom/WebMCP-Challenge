import { useAppState } from "../state/store";
import { selectRecentActivity } from "../state/selectors";
import type { Actor } from "../state/appState";

const ACTOR_LABEL: Record<Actor, string> = {
  human: "Human",
  agent: "Agent",
  system: "System",
};

export function ActivityHistory() {
  const state = useAppState();
  const events = selectRecentActivity(state, 30);

  return (
    <section className="panel activity-history" aria-labelledby="activity-heading">
      <h2 id="activity-heading">Activity history</h2>
      {events.length === 0 ? (
        <p>No activity yet.</p>
      ) : (
        <ol className="activity-list">
          {events.map((event) => (
            <li key={event.id} className={`activity activity--${event.actor}`}>
              <span className={`actor-badge actor-badge--${event.actor}`}>
                {ACTOR_LABEL[event.actor]}
              </span>
              <span className="activity-summary">{event.summary}</span>
              <span className="activity-meta">
                #{event.sequence} · budget rev {event.budgetRevision} · proposal rev{" "}
                {event.proposalRevision}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
