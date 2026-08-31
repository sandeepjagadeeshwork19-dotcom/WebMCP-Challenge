import { getProject } from "../domain/projects";
import { useAppState } from "../state/store";
import {
  selectProposalCommittedTotal,
  selectProposalRemainingFunds,
  selectProposalTradeoffVsManual,
  selectProposalTradeoffVsPrevious,
} from "../state/selectors";
import { formatMoney } from "../format";
import { ConstraintMessages } from "./ConstraintMessages";
import { TradeoffComparison } from "./TradeoffComparison";

const STATUS_TEXT: Record<string, string> = {
  none: "No proposal yet",
  valid: "Valid — eligible for resident review",
  invalid: "Invalid — retained so the failure stays inspectable",
  stale: "Stale — the resident changed the budget after this proposal",
  under_review: "Under resident review",
  rejected: "Rejected by the resident",
  accepted: "Accepted by the resident (not finalised)",
  finalised: "Finalised",
};

export function AgentProposal() {
  const state = useAppState();
  const proposal = state.agentProposal;

  return (
    <section className="panel agent-proposal" aria-labelledby="agent-proposal-heading">
      <h2 id="agent-proposal-heading">Agent proposal</h2>

      {!proposal ? (
        <p>
          The agent has not proposed an allocation. It can call <code>propose_allocation</code> with
          a plan bound to the current budget revision.
        </p>
      ) : (
        <>
          <p className="attribution">
            <span className="actor-badge actor-badge--agent">Agent</span> proposal revision{" "}
            <strong>{proposal.proposalRevision}</strong>, evaluated against budget revision{" "}
            <strong>{proposal.basedOnBudgetRevision}</strong> (current{" "}
            <strong>{state.budgetRevision}</strong>).
          </p>
          <p className={`proposal-status proposal-status--${state.proposalStatus}`} role="status">
            Status: {STATUS_TEXT[state.proposalStatus] ?? state.proposalStatus}
          </p>
          <blockquote className="rationale">{proposal.rationale}</blockquote>

          <table className="allocation-table">
            <caption className="visually-hidden">Proposed allocation</caption>
            <thead>
              <tr>
                <th scope="col">Project</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[...proposal.allocations]
                .sort((a, b) => a.projectId.localeCompare(b.projectId))
                .map((entry) => (
                  <tr key={entry.projectId}>
                    <th scope="row">
                      {entry.projectId} — {getProject(entry.projectId).name}
                    </th>
                    <td>{formatMoney(entry.amount)}</td>
                  </tr>
                ))}
              <tr className="allocation-table__total">
                <th scope="row">Committed total</th>
                <td>{formatMoney(selectProposalCommittedTotal(state))}</td>
              </tr>
              <tr>
                <th scope="row">Remaining funds</th>
                <td>{formatMoney(selectProposalRemainingFunds(state))}</td>
              </tr>
            </tbody>
          </table>

          <ConstraintMessages
            heading="Deterministic engine result for this proposal"
            issues={state.constraintValidation?.issues ?? []}
            emptyText="This proposal satisfies every deterministic rule."
          />

          <ProposalTradeoffs
            vsManual={selectProposalTradeoffVsManual(state)}
            vsPrevious={selectProposalTradeoffVsPrevious(state)}
          />
        </>
      )}
    </section>
  );
}

function ProposalTradeoffs({
  vsManual,
  vsPrevious,
}: {
  vsManual: ReturnType<typeof selectProposalTradeoffVsManual>;
  vsPrevious: ReturnType<typeof selectProposalTradeoffVsPrevious>;
}) {
  return (
    <div className="proposal-tradeoffs">
      {vsManual && (
        <TradeoffComparison
          summary={vsManual}
          title="Proposal compared with the resident's current allocation"
        />
      )}
      {vsPrevious && (
        <TradeoffComparison summary={vsPrevious} title="Proposal compared with the previous proposal" />
      )}
    </div>
  );
}
