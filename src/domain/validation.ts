/**
 * The single deterministic allocation validator.
 *
 * The same function is used by the manual UI, the reducer, and every WebMCP
 * handler. It never rounds, repairs, adds dependencies, or drops projects.
 *
 * Issues are returned in the stable order defined by PRODUCT_SPEC section 6.2:
 *   1. Shape (known ids, unique entries, integer amounts, no unknown fields)
 *   2. Non-negative amount
 *   3. Funding rule
 *   4. Lock preservation
 *   5. Dependencies
 *   6. Incompatibilities
 *   7. Fund limit
 * Revision freshness (step 8) is enforced by the store / handlers, not here.
 */

import { FUND_LIMIT, getProject, isProjectId, PROJECT_IDS } from "./projects";
import type {
  Allocation,
  ProjectId,
  ValidationIssue,
  ValidationResult,
} from "./types";

export interface ValidateOptions {
  lockedAllocations?: Allocation[];
}

const ALLOWED_ENTRY_KEYS = new Set(["projectId", "amount"]);

function money(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

function label(id: ProjectId): string {
  return `${id} (${getProject(id).name})`;
}

export function validateAllocation(
  allocations: Allocation[],
  options: ValidateOptions = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const locked = options.lockedAllocations ?? [];

  // 1. Shape ----------------------------------------------------------------
  const seen = new Set<string>();
  const duplicates = new Set<ProjectId>();
  for (const entry of allocations) {
    const raw = entry as unknown as Record<string, unknown>;
    const extraKeys = Object.keys(raw).filter((k) => !ALLOWED_ENTRY_KEYS.has(k));

    if (!isProjectId(raw.projectId)) {
      issues.push({
        code: "unknown_project",
        projectIds: [],
        message: `"${String(raw.projectId)}" is not a known project id.`,
      });
      continue;
    }
    const projectId = raw.projectId;

    if (seen.has(projectId)) {
      if (!duplicates.has(projectId)) {
        duplicates.add(projectId);
        issues.push({
          code: "duplicate_project",
          projectIds: [projectId],
          message: `${projectId} appears more than once; each project may appear at most once.`,
        });
      }
      continue;
    }
    seen.add(projectId);

    if (extraKeys.length > 0) {
      issues.push({
        code: "invalid_amount",
        projectIds: [projectId],
        message: `Entry for ${projectId} has unsupported field(s): ${extraKeys.join(", ")}.`,
      });
    }

    if (typeof raw.amount !== "number" || !Number.isInteger(raw.amount)) {
      issues.push({
        code: "invalid_amount",
        projectIds: [projectId],
        message: `Amount for ${projectId} must be an integer number of dollars.`,
      });
      continue;
    }

    if (raw.amount === 0) {
      issues.push({
        code: "invalid_amount",
        projectIds: [projectId],
        message: `Amount for ${projectId} must be greater than zero; omit the project to remove it.`,
      });
    }
  }

  // Work from a clean, well-shaped view for the remaining rules.
  const wellShaped: Allocation[] = allocations.filter(
    (e): e is Allocation =>
      isProjectId((e as Allocation).projectId) &&
      typeof (e as Allocation).amount === "number" &&
      Number.isInteger((e as Allocation).amount),
  );
  const byId = new Map<ProjectId, number>();
  for (const entry of wellShaped) {
    if (!byId.has(entry.projectId)) byId.set(entry.projectId, entry.amount);
  }

  // 2. Non-negative amount ------------------------------------------------
  for (const [projectId, amount] of byId) {
    if (amount < 0) {
      issues.push({
        code: "invalid_amount",
        projectIds: [projectId],
        message: `Amount for ${projectId} may not be below zero.`,
      });
    }
  }

  // 3. Funding rule -----------------------------------------------------------
  for (const [projectId, amount] of byId) {
    if (amount <= 0) continue;
    const rule = getProject(projectId).fundingRule;
    if (rule.kind === "complete" && amount !== rule.cost) {
      issues.push({
        code: "funding_rule",
        projectIds: [projectId],
        message: `${label(projectId)} must be funded at exactly ${money(rule.cost)} or left unselected.`,
      });
    }
    if (rule.kind === "phased" && !rule.allowedAmounts.includes(amount)) {
      issues.push({
        code: "funding_rule",
        projectIds: [projectId],
        message: `${label(projectId)} must be ${rule.allowedAmounts
          .map(money)
          .join(", ")}.`,
      });
    }
  }

  // 4. Lock preservation ----------------------------------------------------
  for (const lock of locked) {
    const amount = byId.get(lock.projectId);
    if (amount !== lock.amount) {
      issues.push({
        code: "locked_selection_changed",
        projectIds: [lock.projectId],
        message: `${lock.projectId} is locked at ${money(
          lock.amount,
        )} and must appear at exactly that amount.`,
      });
    }
  }

  // 5. Dependencies -------------------------------------------------------
  for (const [projectId, amount] of byId) {
    if (amount <= 0) continue;
    for (const dependencyId of getProject(projectId).dependencies) {
      const dependency = getProject(dependencyId);
      const dependencyAmount = byId.get(dependencyId) ?? 0;
      const required =
        dependency.fundingRule.kind === "complete"
          ? dependency.fundingRule.cost
          : Math.max(...dependency.fundingRule.allowedAmounts);
      if (dependencyAmount !== required) {
        issues.push({
          code: "missing_dependency",
          projectIds: [projectId, dependencyId],
          message: `${label(projectId)} requires ${label(
            dependencyId,
          )} at full ${money(required)} funding.`,
        });
      }
    }
  }

  // 6. Incompatibilities --------------------------------------------------
  const reportedPairs = new Set<string>();
  for (const [projectId, amount] of byId) {
    if (amount <= 0) continue;
    for (const otherId of getProject(projectId).incompatibilities) {
      if ((byId.get(otherId) ?? 0) <= 0) continue;
      const pairKey = [projectId, otherId].sort().join("+");
      if (reportedPairs.has(pairKey)) continue;
      reportedPairs.add(pairKey);
      const [a, b] = [projectId, otherId].sort() as [ProjectId, ProjectId];
      issues.push({
        code: "incompatible_projects",
        projectIds: [a, b],
        message: `${label(a)} and ${label(
          b,
        )} cannot both be funded; they are alternative designs for the same Willow Avenue curb space and construction window.`,
      });
    }
  }

  // 7. Fund limit ---------------------------------------------------------
  const committedTotal = [...byId.values()]
    .filter((amount) => amount > 0)
    .reduce((sum, amount) => sum + amount, 0);
  if (committedTotal > FUND_LIMIT) {
    issues.push({
      code: "budget_exceeded",
      projectIds: [],
      message: `Total committed cost is ${money(
        committedTotal,
      )}, which is ${money(committedTotal - FUND_LIMIT)} over the ${money(
        FUND_LIMIT,
      )} fund limit.`,
    });
  }

  return { valid: issues.length === 0, issues };
}

/** Sum of positive amounts for known projects. */
export function committedTotal(allocations: Allocation[]): number {
  const byId = new Map<ProjectId, number>();
  for (const entry of allocations) {
    if (!isProjectId(entry.projectId)) continue;
    if (!byId.has(entry.projectId)) byId.set(entry.projectId, entry.amount);
  }
  return [...byId.values()]
    .filter((amount) => amount > 0)
    .reduce((sum, amount) => sum + amount, 0);
}

export function remainingFunds(allocations: Allocation[]): number {
  return FUND_LIMIT - committedTotal(allocations);
}

export function selectedProjectIds(allocations: Allocation[]): ProjectId[] {
  const selected = new Set<ProjectId>();
  for (const entry of allocations) {
    if (isProjectId(entry.projectId) && entry.amount > 0) {
      selected.add(entry.projectId);
    }
  }
  return PROJECT_IDS.filter((id) => selected.has(id));
}
