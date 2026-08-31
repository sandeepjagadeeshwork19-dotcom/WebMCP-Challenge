import { PROJECTS } from "../domain/projects";
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
    // ensure it is selected at its funding amount, then protect it
    const entry = state.manualAllocations.find((a) => a.projectId === projectId);
    if (!entry) dispatch({ type: "human/setAllocation", projectId, amount: cost });
    dispatch({ type: "human/lockProject", projectId });
  };

  return (
    <section className="schedule" aria-labelledby="schedule-heading">
      <p className="kicker">Before the ward</p>
      <h2 className="rail-block__title" id="schedule-heading">
        The eight candidate works
      </h2>
      <p className="schedule__note">
        Each work is fully funded or not at all &mdash; except the tree drive, which comes in phases.
        The deterministic engine, not the assistant, enforces every rule. Protect any work to keep it
        in every draft.
      </p>

      {PROJECTS.map((p) => {
        const phased = p.fundingRule.kind === "phased";
        const constraint =
          p.incompatibilities.length > 0
            ? `not with ${p.incompatibilities.join(", ")}`
            : p.dependencies.length > 0
              ? `needs ${p.dependencies.join(", ")}`
              : phased
                ? "phased"
                : "";
        const defaultAmount = phased ? 60_000 : p.cost;
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
