/**
 * Deterministic "rebuild the draft around what the resident protected".
 *
 * Pure: given a seed allocation, the locked allocations and the resident's
 * priorities, it returns a valid allocation that keeps every locked work and
 * every dependency, then drops the lowest-value unprotected works until it fits
 * the fund. No search, no optimisation target beyond "valid and within budget" —
 * the ordering is a fixed benefit-at-priorities ranking so the result is
 * reproducible. Used by the WebMCP-absent fallback so a protect action never
 * dead-ends, and available to the agent's re-plan path.
 */

import { FUND_LIMIT, getProject, P06_ALLOWED_AMOUNTS } from "./projects";
import { benefitSummary } from "./tradeoffs";
import { committedTotal, validateAllocation } from "./validation";
import type { Allocation, ProjectId, ResidentPriorities, ValidationResult } from "./types";

function defaultAmount(id: ProjectId): number {
  const project = getProject(id);
  return project.fundingRule.kind === "phased" ? P06_ALLOWED_AMOUNTS[1] : project.cost;
}

function benefitOf(id: ProjectId, priorities: ResidentPriorities): number {
  return benefitSummary([{ projectId: id, amount: defaultAmount(id) }], priorities)
    .illustrativeScore;
}

export function redraftAroundLocks(
  seed: Allocation[],
  lockedAllocations: Allocation[],
  priorities: ResidentPriorities,
): Allocation[] {
  const amount = new Map<ProjectId, number>();
  for (const entry of seed) {
    if (entry.amount > 0 && !amount.has(entry.projectId)) amount.set(entry.projectId, entry.amount);
  }
  for (const lock of lockedAllocations) amount.set(lock.projectId, lock.amount);
  const lockedIds = new Set(lockedAllocations.map((l) => l.projectId));

  const ensureDependencies = () => {
    for (const id of [...amount.keys()]) {
      for (const dep of getProject(id).dependencies) {
        if (!amount.has(dep)) amount.set(dep, defaultAmount(dep));
      }
    }
  };

  const isDependencyOfKept = (id: ProjectId) =>
    [...amount.keys()].some((other) => getProject(other).dependencies.includes(id));

  const removeWithOrphans = (id: ProjectId) => {
    if (lockedIds.has(id)) return;
    amount.delete(id);
    for (const other of [...amount.keys()]) {
      if (lockedIds.has(other)) continue;
      if (getProject(other).dependencies.some((dep) => !amount.has(dep))) amount.delete(other);
    }
  };

  ensureDependencies();

  // Resolve incompatibilities — drop the unprotected / lower-value side.
  for (const id of [...amount.keys()]) {
    if (!amount.has(id)) continue;
    for (const other of getProject(id).incompatibilities) {
      if (!amount.has(other) || !amount.has(id)) continue;
      const drop = lockedIds.has(id)
        ? other
        : lockedIds.has(other)
          ? id
          : benefitOf(id, priorities) <= benefitOf(other, priorities)
            ? id
            : other;
      removeWithOrphans(drop);
    }
  }

  // Trim to the fund limit, cheapest-value unprotected work first.
  let guard = 0;
  while (committedTotal([...amount.entries()].map(toAllocation)) > FUND_LIMIT && guard++ < 32) {
    const removable = [...amount.keys()]
      .filter((id) => !lockedIds.has(id) && !isDependencyOfKept(id))
      .sort((a, b) => benefitOf(a, priorities) - benefitOf(b, priorities) || a.localeCompare(b));
    if (removable.length === 0) break;
    removeWithOrphans(removable[0]);
  }

  return [...amount.entries()].map(toAllocation).sort((a, b) => a.projectId.localeCompare(b.projectId));
}

function toAllocation([projectId, amount]: [ProjectId, number]): Allocation {
  return { projectId, amount };
}

/** True when the redraft is a valid allocation given the locks. */
export function redraftIsValid(
  allocations: Allocation[],
  lockedAllocations: Allocation[],
): boolean {
  return validateAllocation(allocations, { lockedAllocations }).valid;
}

/**
 * Check whether the protected set can be honoured by at least one valid plan.
 * Dependencies are supplied by the same deterministic rebuild used by the app;
 * protected works themselves are never silently removed or altered.
 */
export function validateProtectedWorks(
  lockedAllocations: Allocation[],
  priorities: ResidentPriorities,
): ValidationResult {
  const rebuilt = redraftAroundLocks([], lockedAllocations, priorities);
  return validateAllocation(rebuilt, { lockedAllocations });
}
