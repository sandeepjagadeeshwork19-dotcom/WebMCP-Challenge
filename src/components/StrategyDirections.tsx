import { PRIORITY_KEYS } from "../domain/projects";
import { STRATEGY_PRESETS, strategyNeighbourhoods } from "../domain/strategies";
import { committedTotal } from "../domain/validation";
import type { PriorityKey } from "../domain/types";
import { useAppState, useDispatch } from "../state/store";
import { PRIORITY_LABELS, formatMoney } from "../format";

export function StrategyDirections() {
  const state = useAppState();
  const dispatch = useDispatch();

  const matchesCurrent = (priorities: Record<PriorityKey, number>) =>
    PRIORITY_KEYS.every((key) => state.residentPriorities[key] === priorities[key]);

  return (
    <section className="panel strategy-directions" aria-labelledby="strategy-heading">
      <h2 id="strategy-heading">Starting directions</h2>
      <p className="panel-note">
        Three valid ways to spend the fund, each with a different emphasis. Adopting one sets your
        priority weights only &mdash; it funds nothing. The assistant can compare them against your
        current priorities.
      </p>
      <ul className="strategy-list">
        {STRATEGY_PRESETS.map((preset) => {
          const active = matchesCurrent(preset.priorities);
          return (
            <li key={preset.id} className={`strategy-card ${active ? "strategy-card--active" : ""}`}>
              <h3>{preset.label}</h3>
              <p>{preset.blurb}</p>
              <p className="strategy-lens">
                {PRIORITY_KEYS.map((key) => `${PRIORITY_LABELS[key]} ${preset.priorities[key]}`).join(
                  " · ",
                )}
              </p>
              <p className="strategy-meta">
                {formatMoney(committedTotal(preset.allocations))} across{" "}
                {strategyNeighbourhoods(preset).length} neighbourhoods:{" "}
                {preset.allocations
                  .filter((a) => a.amount > 0)
                  .map((a) => a.projectId)
                  .join(", ")}
              </p>
              <button
                type="button"
                disabled={active}
                onClick={() =>
                  dispatch({ type: "human/applyStrategyPriorities", strategyId: preset.id })
                }
              >
                {active ? "Current priority direction" : "Adopt these priorities"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
