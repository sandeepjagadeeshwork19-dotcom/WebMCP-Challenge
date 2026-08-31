import { useEffect, useRef } from "react";
import { useAppState, useDispatch } from "../state/store";
import {
  selectCanFinalise,
  selectCanOpenReview,
  selectFinalisationBlockers,
} from "../state/selectors";
import { HypotheticalAcknowledgement } from "./HypotheticalAcknowledgement";

export function HumanReview() {
  const state = useAppState();
  const dispatch = useDispatch();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const canOpenReview = selectCanOpenReview(state);
  const canFinalise = selectCanFinalise(state);
  const blockers = selectFinalisationBlockers(state);
  const reviewOpen = state.reviewStatus === "open";
  const accepted = state.proposalStatus === "accepted";

  useEffect(() => {
    if (reviewOpen) headingRef.current?.focus();
  }, [reviewOpen]);

  return (
    <section className="panel human-review" aria-labelledby="human-review-heading">
      <h2 id="human-review-heading" tabIndex={-1} ref={headingRef}>
        Human review
      </h2>
      <p className="panel-note">
        Only the resident can accept, modify, reject or finalise. There is no WebMCP tool for any of
        these actions.
      </p>

      {!reviewOpen && !accepted && state.proposalStatus !== "finalised" && (
        <p>
          {canOpenReview
            ? "A fresh valid proposal is ready for review."
            : "No fresh valid proposal is available for review yet."}
        </p>
      )}

      <div className="review-actions">
        <button
          type="button"
          disabled={!canOpenReview}
          onClick={() => dispatch({ type: "human/openReview" })}
        >
          Open review
        </button>
        <button
          type="button"
          disabled={!reviewOpen}
          onClick={() => dispatch({ type: "human/acceptProposal" })}
        >
          Accept proposal
        </button>
        <button
          type="button"
          className="danger-text"
          disabled={!reviewOpen}
          onClick={() => dispatch({ type: "human/rejectProposal" })}
        >
          Reject proposal
        </button>
      </div>

      {reviewOpen && (
        <p className="modify-hint">
          To modify: change a priority, selection or lock in the sections above. Any human edit
          advances the budget revision and makes this proposal stale.
        </p>
      )}

      <fieldset className="finalise-block">
        <legend>Finalise (human only)</legend>
        <HypotheticalAcknowledgement />
        <button
          type="button"
          className="primary"
          disabled={!canFinalise}
          onClick={() => dispatch({ type: "human/finalise" })}
        >
          Finalise allocation
        </button>
        {!canFinalise && (
          <ul className="finalise-blockers" role="status">
            {blockers.map((blocker, index) => (
              <li key={index}>• {blocker}</li>
            ))}
          </ul>
        )}
      </fieldset>
    </section>
  );
}
