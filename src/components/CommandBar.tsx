import { FUND_LIMIT } from "../domain/projects";
import { committedTotal } from "../domain/validation";
import { formatMoney } from "../format";
import { useAppState } from "../state/store";
import { selectActiveAllocation, selectStatusLabel, selectTurn } from "../state/selectors";
import { Icon } from "./Icon";

export function CommandBar() {
  const state = useAppState();
  const allocated = committedTotal(selectActiveAllocation(state));
  const status = selectStatusLabel(state);
  const turn = selectTurn(state);

  const priorProposalRev =
    state.previousProposal && state.proposalStatus === "stale"
      ? state.previousProposal.basedOnBudgetRevision
      : null;
  const revChip =
    priorProposalRev !== null && priorProposalRev !== state.budgetRevision
      ? `BUDGET REV ${priorProposalRev} → ${state.budgetRevision}`
      : null;

  return (
    <div className="commandbar">
      <p className="commandbar__fund">
        {formatMoney(allocated)} <span>allocated</span> &nbsp;·&nbsp;{" "}
        {formatMoney(FUND_LIMIT - allocated)} <span>unallocated</span> &nbsp;·&nbsp;{" "}
        <span>of {formatMoney(FUND_LIMIT)}</span>
      </p>

      <p className="commandbar__stamp" data-status={status}>
        {revChip && <span className="rev-chip">{revChip}</span>}
        {!revChip && <>budget rev {state.budgetRevision} &nbsp;·&nbsp; </>}
        proposal rev {state.proposalRevision} &nbsp;·&nbsp; {status}
      </p>

      <p
        className={`commandbar__turn commandbar__turn--${turn.actor}`}
        role="status"
        aria-live="polite"
      >
        <Icon name={turn.actor === "assistant" ? "pen" : turn.actor === "done" ? "check" : "pen"} size={14} />
        {turn.text}
      </p>
    </div>
  );
}
