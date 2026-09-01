import { STRATEGY_PRESETS, describeStrategy } from "../domain/strategies";
import { formatMoney } from "../format";
import { useAppState, useDispatch } from "../state/store";
import { selectPrioritiesSet } from "../state/selectors";
import { useStageFocus } from "./useStageFocus";

const TAG = ["PLAN A", "PLAN B", "PLAN C"];

export function CompareDirections() {
  const state = useAppState();
  const dispatch = useDispatch();
  const focusRef = useStageFocus<HTMLElement>();
  const prioritiesSet = selectPrioritiesSet(state);

  // Choosing a direction loads its plan as a starting draft. It does NOT touch
  // the resident's priorities — those stay exactly as the resident set them, and
  // the final record reflects what the resident actually chose.
  const choose = (strategyId: (typeof STRATEGY_PRESETS)[number]["id"]) => {
    dispatch({ type: "app/loadDirectionDraft", strategyId });
  };

  return (
    <section className="compare" aria-labelledby="compare-heading" ref={focusRef} tabIndex={-1}>
      <h2 id="compare-heading" className="visually-hidden">
        Compare the three directions
      </h2>
      <p className="compare__lead">
        {prioritiesSet
          ? "Three ready-made examples, scored against your priorities. Open one as a starting draft — this is not the final decision."
          : "Set your priorities above first, or open a ready-made example below."}
      </p>

      <div className="compare__cards">
        {STRATEGY_PRESETS.map((preset, i) => {
          const v = describeStrategy(preset, state.residentPriorities);
          return (
            <article className="direction-card" key={v.id} aria-label={v.label}>
              <p className="direction-card__tag">{TAG[i]}</p>
              <h3 className="direction-card__name">{v.label}</h3>

              <div className="direction-card__score">
                <span className="direction-card__score-num">
                  {prioritiesSet ? v.scoreAtResidentPriorities : "—"}
                </span>
                <span className="direction-card__score-label">
                  {prioritiesSet ? "match with your priorities" : "set priorities to score"}
                </span>
              </div>

              <div className="direction-card__metrics">
                <div className="metric-row">
                  <span>Spent</span>
                  <b>{formatMoney(v.committedTotal)}</b>
                </div>
                <div className="metric-row">
                  <span>Left</span>
                  <b>{formatMoney(v.unallocated)}</b>
                </div>
                <div className="metric-row">
                  <span>Neighbourhoods covered</span>
                  <b>{v.neighbourhoodCount}</b>
                </div>
              </div>

              <div className="direction-card__list">
                <p className="kicker">Funds</p>
                <p>{v.fundsShort.join(" · ")}</p>
              </div>

              <div className="direction-card__prose">
                <span className="strongest">Strongest</span>
                {v.mainBenefit}
                <span className="sacrifice">Gives up</span>
                {v.mainSacrifice}
              </div>

              <div className="direction-card__choose">
                <button
                  type="button"
                  className="btn"
                  aria-label={`Start from ${v.label}`}
                  onClick={() => choose(v.id)}
                >
                  Open ready-made example
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
