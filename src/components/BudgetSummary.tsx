import { useAppState } from "../state/store";
import {
  selectCommittedTotal,
  selectManualValidation,
  selectRemainingFunds,
} from "../state/selectors";
import { formatMoney } from "../format";

export function BudgetSummary() {
  const state = useAppState();
  const committed = selectCommittedTotal(state);
  const remaining = selectRemainingFunds(state);
  const validation = selectManualValidation(state);

  return (
    <section className="panel budget-summary" aria-labelledby="budget-summary-heading">
      <h2 id="budget-summary-heading">Budget summary</h2>
      <dl className="stat-grid">
        <div>
          <dt>Fund limit</dt>
          <dd>{formatMoney(state.fundLimit)}</dd>
        </div>
        <div>
          <dt>Committed</dt>
          <dd>{formatMoney(committed)}</dd>
        </div>
        <div>
          <dt>Remaining</dt>
          <dd className={remaining < 0 ? "negative" : undefined}>{formatMoney(remaining)}</dd>
        </div>
        <div>
          <dt>Budget revision</dt>
          <dd>{state.budgetRevision}</dd>
        </div>
        <div>
          <dt>Current allocation</dt>
          <dd>
            {validation.valid ? (
              <span className="status-ok">✓ Valid</span>
            ) : (
              <span className="status-bad">
                ✗ {validation.issues.length} issue{validation.issues.length === 1 ? "" : "s"}
              </span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
