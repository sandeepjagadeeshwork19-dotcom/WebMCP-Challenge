import { getProject } from "../domain/projects";
import { useAppState } from "../state/store";
import {
  selectCommittedTotal,
  selectManualValidation,
  selectRemainingFunds,
} from "../state/selectors";
import { formatMoney } from "../format";
import { ConstraintMessages } from "./ConstraintMessages";

export function CurrentAllocation() {
  const state = useAppState();
  const selected = state.manualAllocations.filter((a) => a.amount > 0);
  const validation = selectManualValidation(state);

  return (
    <section className="panel current-allocation" aria-labelledby="current-allocation-heading">
      <h2 id="current-allocation-heading">Current allocation</h2>
      <p className="panel-note">The resident&rsquo;s own selections. Locks are shown explicitly.</p>

      {selected.length === 0 ? (
        <p>No projects funded yet.</p>
      ) : (
        <table className="allocation-table">
          <caption className="visually-hidden">Currently funded projects</caption>
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Amount</th>
              <th scope="col">Lock</th>
            </tr>
          </thead>
          <tbody>
            {selected.map((entry) => {
              const locked = state.lockedAllocations.some((l) => l.projectId === entry.projectId);
              return (
                <tr key={entry.projectId}>
                  <th scope="row">
                    {entry.projectId} — {getProject(entry.projectId).name}
                  </th>
                  <td>{formatMoney(entry.amount)}</td>
                  <td>{locked ? "🔒 Locked" : "Unlocked"}</td>
                </tr>
              );
            })}
            <tr className="allocation-table__total">
              <th scope="row">Committed total</th>
              <td>{formatMoney(selectCommittedTotal(state))}</td>
              <td>{formatMoney(selectRemainingFunds(state))} left</td>
            </tr>
          </tbody>
        </table>
      )}

      <ConstraintMessages
        heading="Deterministic engine result"
        issues={validation.issues}
        emptyText="This allocation satisfies every deterministic rule."
      />
    </section>
  );
}
