/**
 * Machine-readable "how to satisfy this rule" hints, derived from a validation
 * issue plus the allocation that produced it. These describe *what the engine
 * requires* - they do not decide what the plan should be. Pure and deterministic.
 */

import { FUND_LIMIT, getProject } from "./projects";
import type { Allocation, ProjectId, ValidationIssue } from "./types";

export type FixHint =
  | { action: "setAmount"; projectId: ProjectId; amount: number }
  | { action: "setAmount"; projectId: ProjectId; allowedAmounts: number[] }
  | { action: "add"; projectId: ProjectId; amount: number }
  | { action: "removeOneOf"; projectIds: ProjectId[] }
  | { action: "reduceBy"; amount: number }
  | { action: "removeDuplicate"; projectId: ProjectId }
  | { action: "correctInput" };

function committed(allocations: Allocation[]): number {
  const byId = new Map<ProjectId, number>();
  for (const a of allocations) if (!byId.has(a.projectId)) byId.set(a.projectId, a.amount);
  return [...byId.values()].filter((n) => n > 0).reduce((s, n) => s + n, 0);
}

export function fixHintForIssue(
  issue: ValidationIssue,
  allocations: Allocation[],
): FixHint | null {
  switch (issue.code) {
    case "funding_rule": {
      const id = issue.projectIds[0];
      if (!id) return null;
      const rule = getProject(id).fundingRule;
      return rule.kind === "complete"
        ? { action: "setAmount", projectId: id, amount: rule.cost }
        : { action: "setAmount", projectId: id, allowedAmounts: [...rule.allowedAmounts] };
    }
    case "missing_dependency": {
      const dependencyId = issue.projectIds[1];
      if (!dependencyId) return null;
      const dependency = getProject(dependencyId);
      const amount =
        dependency.fundingRule.kind === "complete"
          ? dependency.fundingRule.cost
          : Math.max(...dependency.fundingRule.allowedAmounts);
      return { action: "add", projectId: dependencyId, amount };
    }
    case "incompatible_projects":
      return { action: "removeOneOf", projectIds: [...issue.projectIds] };
    case "budget_exceeded":
      return { action: "reduceBy", amount: committed(allocations) - FUND_LIMIT };
    case "duplicate_project": {
      const id = issue.projectIds[0];
      return id ? { action: "removeDuplicate", projectId: id } : null;
    }
    case "locked_selection_changed":
      return null;
    default:
      return { action: "correctInput" };
  }
}
