import { PROJECTS, P06_ALLOWED_AMOUNTS, getProject } from "../domain/projects";
import { formatMoney } from "../format";
import { useAppState, useDispatch } from "../state/store";
import { selectStage } from "../state/selectors";

/** The eight works before the ward — always visible; protections must remain feasible. */
export function ScheduleOfWorks() {
  const state = useAppState();
  const dispatch = useDispatch();
  const locked = new Set(state.lockedAllocations.map((l) => l.projectId));
  const selected = new Set(state.manualAllocations.map((a) => a.projectId));
  const isPrioritiesStage = selectStage(state) === "priorities";

  const toggleProtect = (projectId: (typeof PROJECTS)[number]["id"], cost: number) => {
    if (locked.has(projectId)) {
      dispatch({ type: "human/unlockProject", projectId });
      return;
    }
    // Select at its funding amount and protect it in a single revision bump.
    const entry = state.manualAllocations.find((a) => a.projectId === projectId);
    dispatch({ type: "human/lockProjectAt", projectId, amount: entry?.amount ?? cost });
  };

  return (
    <section
      className={`schedule${isPrioritiesStage ? " schedule--lead" : ""}`}
      aria-labelledby="schedule-heading"
    >
      <h2 className="rail-block__title" id="schedule-heading">
        The eight works
      </h2>
      <p className="schedule__note">
        {isPrioritiesStage
          ? "These eight works are competing for the ₹10 lakh. Read them, weigh what matters on the left, then compare plans. Protect a work to keep it in every plan, provided the protected set can still be funded."
          : "Each work is all-or-nothing to fund, except the tree drive (which can be partly funded). You can include a starting work by hand or protect it to keep it in every plan; incompatible or over-budget protections are explained before they are added."}
      </p>
      {state.protectionError && (
        <p className="schedule__notice" role="alert">
          {state.protectionError}
        </p>
      )}

      {PROJECTS.map((p) => {
        const phased = p.fundingRule.kind === "phased";
        const constraint =
          p.incompatibilities.length > 0
            ? `not with the ${getProject(p.incompatibilities[0]).shortName}`
            : p.dependencies.length > 0
              ? `needs the ${getProject(p.dependencies[0]).shortName}`
              : phased
                ? "can be partly funded"
                : "";
        const defaultAmount = phased ? P06_ALLOWED_AMOUNTS[1] : p.cost;
        return (
          <div
            className={`schedule__row${locked.has(p.id) ? " is-protected" : ""}`}
            key={p.id}
          >
            <span className="work-id">{p.id}</span>
            <span>
              <span className="work-name">{p.name}</span>
              <br />
              <span className="work-meta">
                {p.neighbourhood}
                {constraint && (
                  <>
                    {" · "}
                    <span className="work-constraint">{constraint}</span>
                  </>
                )}
              </span>
            </span>
            <span className="work-cost">
              {phased ? `up to ${formatMoney(p.cost)}` : formatMoney(p.cost)}
            </span>
            <span className="schedule__actions">
              <button
                type="button"
                className="toggle"
                aria-pressed={selected.has(p.id)}
                aria-label={`${selected.has(p.id) ? "Remove" : "Include"} ${p.name}`}
                disabled={locked.has(p.id)}
                onClick={() =>
                  selected.has(p.id)
                    ? dispatch({ type: "human/removeAllocation", projectId: p.id })
                    : dispatch({ type: "human/setAllocation", projectId: p.id, amount: defaultAmount })
                }
              >
                {selected.has(p.id) ? "Included" : "Include"}
              </button>
              <button
                type="button"
                className="toggle work-protect"
                aria-pressed={locked.has(p.id)}
                aria-label={`${locked.has(p.id) ? "Unprotect" : "Protect"} ${p.name}`}
                onClick={() => toggleProtect(p.id, defaultAmount)}
              >
                {locked.has(p.id) ? "Protected" : "Protect"}
              </button>
            </span>
          </div>
        );
      })}
    </section>
  );
}
