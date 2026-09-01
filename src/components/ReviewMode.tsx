import { useEffect, useRef } from "react";
import { FUND_LIMIT, getProject } from "../domain/projects";
import { committedTotal } from "../domain/validation";
import { formatMoney } from "../format";
import { useAppState, useDispatch } from "../state/store";
import {
  selectCanFinalise,
  selectFinalisationBlockers,
  selectProposalTradeoffVsManual,
  selectProposalTradeoffVsPrevious,
} from "../state/selectors";
import { Icon } from "./Icon";

export function ReviewMode() {
  const state = useAppState();
  const dispatch = useDispatch();
  const headingRef = useRef<HTMLDivElement>(null);
  const proposal = state.agentProposal;

  const accepted = state.proposalStatus === "accepted";
  const rejected = state.proposalStatus === "rejected";
  const underReview = state.proposalStatus === "under_review" || state.reviewStatus === "open";
  const canFinalise = selectCanFinalise(state);
  const blockers = selectFinalisationBlockers(state);

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
          Fund {formatMoney(FUND_LIMIT)} to {works.length} works:{" "}
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

      {rejected ? (
        <p className="sheet__validation" data-bad>
          You sent this back. Ask the assistant for a different plan, or change your priorities.
        </p>
      ) : (
        <>
          <div className="review-controls">
            <button
              type="button"
              className="btn btn--dark"
              disabled={!underReview}
              onClick={() => dispatch({ type: "human/acceptProposal" })}
            >
              {accepted ? "Accepted" : "Accept"}
            </button>
            <button
              type="button"
              className="btn"
              disabled={!underReview}
              onClick={() => dispatch({ type: "human/rejectProposal" })}
            >
              Send back
            </button>
          </div>

          <div className="ack">
            <input
              type="checkbox"
              id="ack-box"
              checked={state.disclosureAcknowledged}
              onChange={(e) =>
                dispatch({ type: "human/setDisclosureAck", acknowledged: e.target.checked })
              }
            />
            <label htmlFor="ack-box">
              I understand this is a demo &mdash; adopting doesn&rsquo;t allocate any real money.
            </label>
          </div>

          <div>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!canFinalise}
              onClick={() => dispatch({ type: "human/finalise" })}
            >
              Adopt resolution WD-12
            </button>
            {!canFinalise && (
              <p className="adopt-hint" role="status">
                {accepted
                  ? "Tick the box above to adopt."
                  : blockers[0] ?? "Accept the plan, then tick the box."}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
