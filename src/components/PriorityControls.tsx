import { useAppState, useDispatch } from "../state/store";
import { PRIORITY_KEYS } from "../domain/projects";
import type { PriorityKey, PriorityWeight } from "../domain/types";
import {
  PRIORITY_DESCRIPTIONS,
  PRIORITY_LABELS,
  WEIGHT_LABELS,
} from "../format";

const WEIGHTS: PriorityWeight[] = [0, 1, 2, 3];

export function PriorityControls() {
  const state = useAppState();
  const dispatch = useDispatch();

  return (
    <section className="panel priority-controls" aria-labelledby="priority-heading">
      <h2 id="priority-heading">Resident priorities</h2>
      <p className="panel-note">
        Resident controls. These weightings express what this resident values. Changing one is a
        human action and advances the budget revision.
      </p>
      {PRIORITY_KEYS.map((key: PriorityKey) => {
        const groupId = `priority-${key}`;
        return (
          <fieldset key={key} className="priority-fieldset">
            <legend id={groupId}>{PRIORITY_LABELS[key]}</legend>
            <p className="field-description">{PRIORITY_DESCRIPTIONS[key]}</p>
            <div className="radio-row" role="radiogroup" aria-labelledby={groupId}>
              {WEIGHTS.map((weight) => {
                const checked = state.residentPriorities[key] === weight;
                return (
                  <label key={weight} className={`chip ${checked ? "chip--active" : ""}`}>
                    <input
                      type="radio"
                      name={key}
                      value={weight}
                      checked={checked}
                      onChange={() => dispatch({ type: "human/setPriority", key, weight })}
                    />
                    {weight} — {WEIGHT_LABELS[weight]}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </section>
  );
}
