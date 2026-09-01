import { PROJECTS, P06_ALLOWED_AMOUNTS, getProject } from "../domain/projects";
import { formatMoney } from "../format";
import { useAppState, useDispatch } from "../state/store";

/** The eight works before the ward — always visible; the resident can protect any. */
export function ScheduleOfWorks() {
  const state = useAppState();
  const dispatch = useDispatch();
  const locked = new Set(state.lockedAllocations.map((l) => l.projectId));

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
    <section className="schedule" aria-labelledby="schedule-heading">
      <h2 className="rail-block__title" id="schedule-heading">
        The eight works
      </h2>
      <p className="schedule__note">
        Each work is all-or-nothing to fund, except the tree drive (which can be partly funded).
        Protect any work to keep it in every plan.
      </p>

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
            <button
              type="button"
              className="work-protect"
              aria-pressed={locked.has(p.id)}
              onClick={() => toggleProtect(p.id, defaultAmount)}
            >
              {locked.has(p.id) ? "Protected" : "Protect"}
            </button>
          </div>
        );
      })}
    </section>
  );
}
