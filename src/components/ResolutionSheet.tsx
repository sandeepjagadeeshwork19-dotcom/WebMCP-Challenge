import { FUND_LIMIT, getProject } from "../domain/projects";
import { committedTotal } from "../domain/validation";
import { formatMoney, formatSignedMoney } from "../format";
import { useAppState } from "../state/store";
import {
  selectProposalTradeoffVsManual,
  selectProposalTradeoffVsPrevious,
} from "../state/selectors";
import { Icon } from "./Icon";
import { useStageFocus } from "./useStageFocus";

export function ResolutionSheet() {
  const state = useAppState();
  const focusRef = useStageFocus<HTMLElement>();
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
    <section className="stage-block" aria-labelledby="draft-heading" ref={focusRef} tabIndex={-1}>
      <p className="compare__lead">
        Here&rsquo;s a full plan{locked.size > 0 ? " that keeps what you protected" : ""}. Nothing is
        locked &mdash; protect works you want kept, adjust priorities, and rebuild as many times as
        you like. Send it to review when it&rsquo;s right.
      </p>

      <div className="sheet">
        <div className="sheet__head">
          <h2 className="sheet__title" id="draft-heading">
            DRAFT RESOLUTION &mdash; WD-12
          </h2>
          <p className="sheet__status" data-bad={!cv.valid || undefined}>
            {cv.valid ? "Valid" : "Breaks a rule"}
          </p>
        </div>
        <div className="proposal-source" data-source={proposal.createdBy}>
          <span>{proposal.createdBy === "agent" ? "FROM THE ASSISTANT" : "READY-MADE PLAN"}</span>
          <p>{proposal.rationale}</p>
        </div>
        <hr className="sheet__rule" />
        <p className="sheet__preamble">This plan funds:</p>

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
            <span>SPENT</span>
            <b>{formatMoney(total)}</b>
          </p>
          <p className="tally-figure">
            <span>LEFT</span>
            <b>{formatMoney(FUND_LIMIT - total)}</b>
          </p>
        </div>

        <p className="sheet__validation" data-bad={!cv.valid || undefined}>
          {cv.valid ? (
            <>&#10003; Follows all the funding rules.</>
          ) : (
            <>&#10007; {cv.issues.map((x) => x.message).join(" ")}</>
          )}
        </p>

        {tradeoff && (tradeoff.added.length > 0 || tradeoff.removed.length > 0) && (
          <div className="tradeoff-strip">
            <span className="kicker">Changed from your start</span>
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

    </section>
  );
}
