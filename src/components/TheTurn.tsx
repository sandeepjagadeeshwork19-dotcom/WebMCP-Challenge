import { FUND_LIMIT, P06_ALLOWED_AMOUNTS, getProject } from "../domain/projects";
import { committedTotal, validateAllocation } from "../domain/validation";
import { formatMoney } from "../format";
import { useAppState } from "../state/store";
import { Icon } from "./Icon";
import { useStageFocus } from "./useStageFocus";
import type { Allocation, ProjectId } from "../domain/types";

/**
 * The turn: a human protect action has stalled the current draft. Show the
 * *problem* the assistant must now solve — not a re-plan that does not exist yet.
 */
export function TheTurn() {
  const state = useAppState();
  const focusRef = useStageFocus<HTMLElement>();
  const stale = state.agentProposal;
  if (!stale) return null;

  const staleBecausePriorities = state.staleReason === "priority_change";
  const staleBecauseAllocation = state.staleReason === "allocation_change";
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
      const amt = p.fundingRule.kind === "complete" ? p.fundingRule.cost : P06_ALLOWED_AMOUNTS[1];
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
          {staleBecausePriorities
            ? "You changed what matters most, so this plan needs to be recalculated against your priorities."
            : staleBecauseAllocation
              ? "You changed your starting allocation, so this plan needs to be recalculated."
              : `You protected ${protectedNames || "a work"}, so this plan needs to be redrawn to fit it in.`}
        </p>
      </div>

      <div className="cost-hero">
        <p className="cost-hero__kicker">WHAT CHANGES</p>
        <div className="cost-changes">
          <p className="cost-change cost-change--added">
            <span>{staleBecausePriorities ? "RECALCULATE" : staleBecauseAllocation ? "RECHECK" : "MUST NOW INCLUDE"}</span>
            <b>
              {staleBecausePriorities
                ? "your plan's priority match"
                : staleBecauseAllocation
                  ? "your resident starting point"
                  : addedForProtection.length
                ? addedForProtection.map((a) => getProject(a.projectId).shortName).join(", ")
                : protectedNames}
            </b>
          </p>
          <p className="cost-change">
            <span>{staleBecausePriorities ? "NEW WEIGHTS" : staleBecauseAllocation ? "CHANGED BY" : "THAT COSTS"}</span>
            <b>{staleBecausePriorities ? "resident choice" : staleBecauseAllocation ? "resident choice" : formatMoney(addedForProtection.reduce((s, a) => s + a.amount, 0))}</b>
          </p>
          <p className="cost-change cost-change--dropped">
            <span>{staleBecausePriorities || staleBecauseAllocation ? "OLD PLAN" : over > 0 ? "OVER THE FUND BY" : "STATUS"}</span>
            <b>
              {staleBecausePriorities || staleBecauseAllocation
                ? "needs a fresh check"
                : over > 0
                ? formatMoney(over)
                : staleValidation.valid
                  ? "still fits"
                  : "breaks a rule"}
            </b>
          </p>
          <p className="cost-change">
            <span>{staleBecausePriorities || staleBecauseAllocation ? "NEXT STEP" : "TO FIT, DROP"}</span>
            <b>
              {staleBecausePriorities || staleBecauseAllocation
                ? "build a fresh draft"
                : over > 0
                ? `about ${formatMoney(over)} of other works`
                : "nothing — just re-check"}
            </b>
          </p>
        </div>
        <p className="cost-hero__note">
          The next action below can build a fresh draft locally or help you ask the assistant.
          {state.lockedAllocations.length > 0 ? " Either path must preserve your protected works." : ""}
        </p>
      </div>

      <div className="superseded">
        <div className="superseded__head">
          <span>OLD PLAN</span>
          <span>{formatMoney(committedTotal(stale.allocations))}</span>
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

    </section>
  );
}
