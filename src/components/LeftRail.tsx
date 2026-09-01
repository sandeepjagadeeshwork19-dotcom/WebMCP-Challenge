import { useRef } from "react";
import { PRIORITY_KEYS, getProject } from "../domain/projects";
import type { PriorityKey, PriorityWeight } from "../domain/types";
import { useAppState, useDispatch } from "../state/store";
import { selectRecentActivity } from "../state/selectors";
import { PRIORITY_LABELS, formatMoney } from "../format";

const WEIGHTS: PriorityWeight[] = [0, 1, 2, 3];

/** A priority row as a proper radio group: one tab stop, arrow keys move it. */
function PriorityRow({ priorityKey, value }: { priorityKey: PriorityKey; value: PriorityWeight }) {
  const dispatch = useDispatch();
  const chips = useRef<Array<HTMLButtonElement | null>>([]);

  const set = (weight: PriorityWeight) => {
    dispatch({ type: "human/setPriority", key: priorityKey, weight });
    chips.current[weight]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = WEIGHTS.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(last, value + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(0, value - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next !== null) {
      event.preventDefault();
      set(next as PriorityWeight);
    }
  };

  return (
    <div className="priority-row" role="radiogroup" aria-label={`${PRIORITY_LABELS[priorityKey]} priority`}>
      <span>{PRIORITY_LABELS[priorityKey]}</span>
      <span className="priority-chips" onKeyDown={onKeyDown}>
        {WEIGHTS.map((weight) => {
          const active = value === weight;
          return (
            <button
              key={weight}
              ref={(el) => {
                chips.current[weight] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${PRIORITY_LABELS[priorityKey]} ${weight}`}
              tabIndex={active ? 0 : -1}
              className="priority-chip"
              onClick={() => set(weight)}
            >
              {weight}
            </button>
          );
        })}
      </span>
    </div>
  );
}

export function LeftRail() {
  const state = useAppState();
  const dispatch = useDispatch();
  const activity = selectRecentActivity(state, 12);

  return (
    <aside className="rail" aria-label="What the resident controls">
      <section className="rail-block" aria-labelledby="rail-priorities">
        <p className="kicker">You control this</p>
        <h2 className="rail-block__title" id="rail-priorities">
          Your priorities
        </h2>
        <p className="rail-block__note">
          What the ward should weigh. Each change advances the revision.
        </p>
        {PRIORITY_KEYS.map((key: PriorityKey) => (
          <PriorityRow key={key} priorityKey={key} value={state.residentPriorities[key]} />
        ))}
      </section>

      <section className="rail-block" aria-labelledby="rail-protected">
        <p className="kicker">Kept in every draft</p>
        <h2 className="rail-block__title" id="rail-protected">
          Protected
        </h2>
        {state.lockedAllocations.length === 0 ? (
          <p className="rail-block__note">
            Nothing protected yet. Protect a work to keep it in every draft.
          </p>
        ) : (
          state.lockedAllocations.map((lock) => (
            <div className="protected-item" key={lock.projectId}>
              <p className="protected-item__id">
                <span>{lock.projectId} · PROTECTED</span>
              </p>
              <p className="protected-item__name">
                {getProject(lock.projectId).name} — {formatMoney(lock.amount)}
              </p>
              <button
                type="button"
                className="protected-item__unlock"
                onClick={() =>
                  dispatch({ type: "human/unlockProject", projectId: lock.projectId })
                }
              >
                Remove protection
              </button>
            </div>
          ))
        )}
      </section>

      <section className="rail-block" aria-labelledby="rail-log">
        <p className="kicker">Record</p>
        <h2 className="rail-block__title" id="rail-log">
          Log
        </h2>
        {activity.length === 0 ? (
          <p className="rail-block__note">No entries yet.</p>
        ) : (
          <ol className="log-list">
            {activity.map((e) => (
              <li key={e.id}>
                <span className={`log-actor log-actor--${e.actor}`}>{e.actor}</span>
                <span>
                  {e.summary}
                  <span className="visually-hidden">
                    {" "}
                    (budget rev {e.budgetRevision}, proposal rev {e.proposalRevision})
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </aside>
  );
}
