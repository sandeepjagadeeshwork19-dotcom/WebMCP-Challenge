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
        <span>This step is the resident&rsquo;s alone</span>
      </div>

      <div className="review-disclosure" role="note">
        <Icon name="info" size={16} />
        <p>
          Hypothetical demonstration. This resolution, its works, costs and constraints are
          invented. It is not connected to, endorsed by or affiliated with any government body, ward
          committee or gram sabha. Adopting records a demonstration choice only &mdash; it does not
          cast a vote or allocate real funds.
        </p>
      </div>

      <div className="review-summary">
        <p className="review-summary__lead">
          Fund {formatMoney(FUND_LIMIT)} to {works.length} works:{" "}
          {works.map((w) => getProject(w.projectId).shortName).join(", ")}. {formatMoney(total)}{" "}
          resolved, {formatMoney(FUND_LIMIT - total)} unallocated.
        </p>
        <p className="review-summary__validation">
          &#10003; Fresh validation passed &mdash; funding, dependencies, incompatibilities and the{" "}
          {formatMoney(FUND_LIMIT)} limit.
        </p>
        {tradeoff && (tradeoff.added.length > 0 || tradeoff.removed.length > 0) && (
          <p className="review-summary__tradeoff">
            Trade-off vs where you started:{" "}
            {tradeoff.added.map((id) => `+ ${getProject(id).shortName}`).join("  ·  ")}
            {tradeoff.added.length && tradeoff.removed.length ? "  ·  " : ""}
            {tradeoff.removed.map((id) => `− ${getProject(id).shortName}`).join("  ·  ")}
          </p>
        )}
      </div>

      <div className="authority-notice">
        <Icon name="user" size={18} />
        <p>
          Only the resident can accept, revise, reject or adopt this resolution. The assistant has
          no WebMCP tool for any of these steps &mdash; it cannot reach past this point.
        </p>
      </div>

      {rejected ? (
        <p className="sheet__validation" data-bad>
          You rejected this resolution. Ask the assistant for a different plan, or adjust your
          priorities.
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
              {accepted ? "Accepted" : "Accept the draft"}
            </button>
            <button
              type="button"
              className="btn"
              disabled={!underReview}
              onClick={() => dispatch({ type: "human/rejectProposal" })}
            >
              Send back for changes
            </button>
            <button
              type="button"
              className="btn btn--danger"
              disabled={!underReview}
              onClick={() => dispatch({ type: "human/rejectProposal" })}
            >
              Reject
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
              I understand this is a hypothetical demonstration. Adopting records a demonstration
              choice only.
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
                  ? "Tick the acknowledgement above to adopt."
                  : blockers[0] ?? "Accept the draft, then tick the acknowledgement."}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
