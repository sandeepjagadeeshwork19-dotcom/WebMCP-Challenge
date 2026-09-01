import { FUND_LIMIT, getProject } from "../domain/projects";
import { committedTotal, validateAllocation } from "../domain/validation";
import { formatMoney } from "../format";
import { useAppState, useDispatch } from "../state/store";
import { Icon } from "./Icon";
import { useStageFocus } from "./useStageFocus";
import type { Allocation, ProjectId } from "../domain/types";

/**
 * The turn: a human protect action has stalled the current draft. Show the
 * *problem* the assistant must now solve — not a re-plan that does not exist yet.
 */
export function TheTurn({ webmcpAvailable }: { webmcpAvailable: boolean }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const focusRef = useStageFocus<HTMLElement>();
  const stale = state.agentProposal;
  if (!stale) return null;

  const protectedIds = state.lockedAllocations.map((l) => l.projectId);
  const protectedNames = protectedIds.map((id) => getProject(id).shortName).join(" and ");

  // What the plan must now contain: the stale draft + every protected work + its deps.
  const required = new Map<ProjectId, number>();
  for (const a of stale.allocations) if (a.amount > 0) required.set(a.projectId, a.amount);
  const addedForProtection: Allocation[] = [];
  for (const lock of state.lockedAllocations) {
    if (!required.has(lock.projectId)) {
      required.set(lock.projectId, lock.amount);
      addedForProtection.push(lock);
    }
    for (const dep of getProject(lock.projectId).dependencies) {
      const p = getProject(dep);
      const amt = p.fundingRule.kind === "complete" ? p.fundingRule.cost : 60_000;
      if (!required.has(dep)) {
        required.set(dep, amt);
        addedForProtection.push({ projectId: dep, amount: amt });
      }
    }
  }
  const requiredTotal = [...required.values()].reduce((a, b) => a + b, 0);
  const over = requiredTotal - FUND_LIMIT;
  const staleValidation = validateAllocation(stale.allocations, {
    lockedAllocations: state.lockedAllocations,
  });

  return (
    <section className="stage-block" aria-labelledby="turn-heading" ref={focusRef} tabIndex={-1}>
      <h2 id="turn-heading" className="visually-hidden">
        The draft is stale
      </h2>

      <div className="turn-alert" role="alert">
        <Icon name="alert" size={18} />
        <p>
          This draft is stale. You protected {protectedNames || "a work"} &mdash; the assistant must
          re-plan around it (budget rev {stale.basedOnBudgetRevision} &rarr; {state.budgetRevision}).
        </p>
      </div>

      <div className="cost-hero">
        <p className="cost-hero__kicker">
          PROTECTING {(protectedNames || "this work").toUpperCase()} CHANGES THE PLAN
        </p>
        <div className="cost-changes">
          <p className="cost-change cost-change--added">
            <span>MUST NOW INCLUDE</span>
            <b>
              {addedForProtection.length
                ? addedForProtection.map((a) => getProject(a.projectId).shortName).join(", ")
                : protectedNames}
            </b>
          </p>
          <p className="cost-change">
            <span>THAT COSTS</span>
            <b>{formatMoney(addedForProtection.reduce((s, a) => s + a.amount, 0))}</b>
          </p>
          <p className="cost-change cost-change--dropped">
            <span>{over > 0 ? "OVER THE FUND BY" : "STATUS"}</span>
            <b>
              {over > 0
                ? formatMoney(over)
                : staleValidation.valid
                  ? "fits — needs re-validation"
                  : "breaks a rule"}
            </b>
          </p>
          <p className="cost-change">
            <span>SO THE ASSISTANT MUST</span>
            <b>
              {over > 0
                ? `drop about ${formatMoney(over)} of other works`
                : "rebuild and re-check the draft"}
            </b>
          </p>
        </div>
        <p className="cost-hero__note">
          The score liked this direction &mdash; but protecting {protectedNames || "that work"} is
          your call, not the score&rsquo;s. Ask the assistant to redraft: it keeps what you protected
          and rebalances the rest within {formatMoney(FUND_LIMIT)}.
        </p>
      </div>

      <div className="superseded">
        <div className="superseded__head">
          <span>SUPERSEDED DRAFT</span>
          <span>
            proposal rev {stale.proposalRevision} &nbsp;·&nbsp;{" "}
            {formatMoney(committedTotal(stale.allocations))} committed
          </span>
        </div>
        <div className="resolution-lines">
          {[...stale.allocations]
            .filter((a) => a.amount > 0)
            .sort((a, b) => a.projectId.localeCompare(b.projectId))
            .map((entry) => (
              <div key={entry.projectId} className="resolution-line">
                <span className="resolution-line__num" aria-hidden="true" />
                <span className="resolution-line__id">{entry.projectId}</span>
                <span className="resolution-line__name">{getProject(entry.projectId).name}</span>
                <span className="resolution-line__amount">{formatMoney(entry.amount)}</span>
              </div>
            ))}
        </div>
        <span className="stale-stamp" aria-hidden="true">
          STALE
        </span>
      </div>

      <div className="stage-actions">
        {webmcpAvailable ? (
          <>
            <span className="btn btn--ghost" style={{ cursor: "default" }}>
              Ask the assistant to redraft around your protected work
            </span>
            <button
              type="button"
              className="btn"
              onClick={() => dispatch({ type: "app/redraftAroundLocks" })}
            >
              Or rebuild it here
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => dispatch({ type: "app/redraftAroundLocks" })}
          >
            Rebuild the draft around your protected work <Icon name="arrow" size={15} />
          </button>
        )}
      </div>
    </section>
  );
}
