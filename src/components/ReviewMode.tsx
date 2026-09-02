import { useEffect, useRef } from "react";
import { FUND_LIMIT, getProject } from "../domain/projects";
import { committedTotal } from "../domain/validation";
import { formatMoney } from "../format";
import { useAppState } from "../state/store";
import {
  selectProposalTradeoffVsManual,
  selectProposalTradeoffVsPrevious,
} from "../state/selectors";
import { Icon } from "./Icon";

export function ReviewMode() {
  const state = useAppState();
  const headingRef = useRef<HTMLDivElement>(null);
  const proposal = state.agentProposal;

  const accepted = state.proposalStatus === "accepted";
  const underReview = state.proposalStatus === "under_review" || state.reviewStatus === "open";

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!proposal) return null;
  const total = committedTotal(proposal.allocations);
  const works = [...proposal.allocations]
    .filter((a) => a.amount > 0)
    .sort((a, b) => a.projectId.localeCompare(b.projectId));
  const tradeoff =
    selectProposalTradeoffVsPrevious(state) ?? selectProposalTradeoffVsManual(state);

  return (
    <section className="stage-block" aria-labelledby="review-band">
      <div className="review-band" ref={headingRef} tabIndex={-1} id="review-band">
        <strong>REVIEW &mdash; RESOLUTION WD-12</strong>
      </div>

      <div className="review-summary">
        <p className="review-summary__lead">
          Allocate up to {formatMoney(FUND_LIMIT)} across {works.length} works:{" "}
          {works.map((w) => getProject(w.projectId).shortName).join(", ")}. {formatMoney(total)}{" "}
          spent, {formatMoney(FUND_LIMIT - total)} left.
        </p>
        <p className="review-summary__validation">
          &#10003; Re-checked just now &mdash; all rules pass.
        </p>
        {tradeoff && (tradeoff.added.length > 0 || tradeoff.removed.length > 0) && (
          <p className="review-summary__tradeoff">
            Changed from your start:{" "}
            {tradeoff.added.map((id) => `+ ${getProject(id).shortName}`).join(", ")}
            {tradeoff.added.length && tradeoff.removed.length ? ", " : ""}
            {tradeoff.removed.map((id) => `− ${getProject(id).shortName}`).join(", ")}
          </p>
        )}
      </div>

      <div className="authority-notice">
        <Icon name="user" size={18} />
        <p>
          The assistant can&rsquo;t accept or adopt a plan &mdash; only you can. These buttons are
          yours.
        </p>
      </div>

      <p className="review-summary__validation">
        {accepted
          ? "Accepted. Complete the resident authority step below."
          : underReview
            ? "Ready for your decision below."
            : "Review state updated."}
      </p>
    </section>
  );
}
