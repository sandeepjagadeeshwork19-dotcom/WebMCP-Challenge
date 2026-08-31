import { FUND_LIMIT, getProject } from "../domain/projects";
import { committedTotal } from "../domain/validation";
import { formatMoney, formatSignedMoney } from "../format";
import { useAppState, useDispatch } from "../state/store";
import {
  selectProposalTradeoffVsManual,
  selectProposalTradeoffVsPrevious,
} from "../state/selectors";
import { Icon } from "./Icon";

export function ResolutionSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const proposal = state.agentProposal;
  const cv = state.constraintValidation;
  if (!proposal || !cv) return null;

  const lines = [...proposal.allocations]
    .filter((a) => a.amount > 0)
    .sort((a, b) => a.projectId.localeCompare(b.projectId));
  const total = committedTotal(proposal.allocations);
  const locked = new Set(state.lockedAllocations.map((l) => l.projectId));
  const tradeoff =
    selectProposalTradeoffVsPrevious(state) ?? selectProposalTradeoffVsManual(state);

  return (
    <section className="stage-block" aria-labelledby="draft-heading">
      <p className="compare__lead">
        A complete draft{locked.size > 0 ? ", keeping your protected work" : ""}. Take it into review,
        or send it back for changes.
      </p>

      <div className="sheet">
        <div className="sheet__head">
          <h2 className="sheet__title" id="draft-heading">
            DRAFT RESOLUTION &mdash; WD-12
          </h2>
          <p className="sheet__status" data-bad={!cv.valid || undefined}>
            proposal rev {proposal.proposalRevision} &nbsp;·&nbsp; {cv.valid ? "valid" : "invalid"}{" "}
            &nbsp;·&nbsp; not yet adopted
          </p>
        </div>
        <hr className="sheet__rule" />
        <p className="sheet__preamble">
          The ward resolves to fund the following works against a fund of {formatMoney(FUND_LIMIT)}{" "}
          &mdash;
        </p>

        <div className="resolution-lines">
          {lines.map((entry, i) => (
            <div
              key={entry.projectId}
              className={`resolution-line${locked.has(entry.projectId) ? " resolution-line--protected" : ""}`}
            >
              <span className="resolution-line__num">{i + 1}</span>
              <span className="resolution-line__id">{entry.projectId}</span>
              <span className="resolution-line__name">
                {getProject(entry.projectId).name}
                {locked.has(entry.projectId) && (
                  <>
                    {" "}
                    <span className="protected-badge">
                      <Icon name="shield" size={10} /> PROTECTED
                    </span>
                  </>
                )}
              </span>
              <span className="resolution-line__amount">{formatMoney(entry.amount)}</span>
            </div>
          ))}
        </div>

        <hr className="sheet__rule" />
        <div className="sheet__tally">
          <p className="tally-figure">
            <span>RESOLVED</span>
            <b>{formatMoney(total)}</b>
          </p>
          <p className="tally-figure">
            <span>UNALLOCATED</span>
            <b>{formatMoney(FUND_LIMIT - total)}</b>
          </p>
        </div>

        <p className="sheet__validation" data-bad={!cv.valid || undefined}>
          {cv.valid ? (
            <>&#10003; Satisfies every rule of the fund.</>
          ) : (
            <>&#10007; {cv.issues.map((x) => x.message).join(" ")}</>
          )}
        </p>

        {tradeoff && (tradeoff.added.length > 0 || tradeoff.removed.length > 0) && (
          <div className="tradeoff-strip">
            <span className="kicker">Compared with where you started</span>
            <p>
              {tradeoff.added.map((id) => `+ ${getProject(id).shortName}`).join("   ·   ")}
              {tradeoff.added.length > 0 && tradeoff.removed.length > 0 ? "   ·   " : ""}
              {tradeoff.removed.map((id) => `− ${getProject(id).shortName}`).join("   ·   ")}
              {tradeoff.fundingChanged.length > 0 && (
                <>
                  {"   ·   "}
                  {tradeoff.fundingChanged
                    .map(
                      (c) =>
                        `${getProject(c.projectId).shortName} ${formatSignedMoney(c.toAmount - c.fromAmount)}`,
                    )
                    .join(", ")}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="stage-actions">
        {cv.valid ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => dispatch({ type: "human/openReview" })}
          >
            Review this resolution <Icon name="arrow" size={15} />
          </button>
        ) : (
          <p className="sheet__validation" data-bad>
            The engine rejected this draft. Ask the assistant for a plan that satisfies every rule.
          </p>
        )}
        <span className="btn btn--ghost" style={{ cursor: "default" }}>
          Or ask the assistant to change something
        </span>
      </div>
    </section>
  );
}
