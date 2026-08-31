/**
 * Benefit scoring and canonical trade-off comparison.
 *
 * The engine reports directional, illustrative comparisons. It never claims an
 * objective optimum or "public value". People-served estimates are never summed.
 */

import { getProject, P06_ALLOWED_AMOUNTS, PRIORITY_KEYS } from "./projects";
import { committedTotal, remainingFunds, selectedProjectIds } from "./validation";
import type {
  Allocation,
  BenefitRating,
  BenefitSummary,
  CommunitySupport,
  PriorityKey,
  ProjectId,
  ResidentPriorities,
  TradeoffBenefitDelta,
  TradeoffFundingChange,
  TradeoffSummary,
} from "./types";

const RATING_VALUE: Record<BenefitRating, number> = { Low: 1, Medium: 2, High: 3 };
const SUPPORT_VALUE: Record<CommunitySupport, number> = { Moderate: 2, High: 3 };

/** Fraction of P-06's rating credited at each allowed phase amount. */
export function p06Fraction(amount: number): number {
  const index = P06_ALLOWED_AMOUNTS.indexOf(amount as (typeof P06_ALLOWED_AMOUNTS)[number]);
  if (index < 0) return 0;
  return [0.5, 0.75, 1][index];
}

function projectRatingValue(id: ProjectId, priority: PriorityKey): number {
  const project = getProject(id);
  if (priority === "communitySupport") {
    return SUPPORT_VALUE[project.communitySupport];
  }
  return RATING_VALUE[project.benefits[priority]];
}

function allocationMap(allocations: Allocation[]): Map<ProjectId, number> {
  const map = new Map<ProjectId, number>();
  for (const entry of allocations) {
    if (entry.amount > 0 && !map.has(entry.projectId)) {
      map.set(entry.projectId, entry.amount);
    }
  }
  return map;
}

export function benefitSummary(
  allocations: Allocation[],
  priorities: ResidentPriorities,
): BenefitSummary {
  const selected = selectedProjectIds(allocations);
  const map = allocationMap(allocations);
  const byPriority = Object.fromEntries(
    PRIORITY_KEYS.map((key) => [key, 0]),
  ) as Record<PriorityKey, number>;

  for (const id of selected) {
    const scale = id === "P-06" ? p06Fraction(map.get(id) ?? 0) : 1;
    for (const key of PRIORITY_KEYS) {
      byPriority[key] += projectRatingValue(id, key) * priorities[key] * scale;
    }
  }

  const illustrativeScore = PRIORITY_KEYS.reduce(
    (sum, key) => sum + byPriority[key],
    0,
  );

  return { illustrativeScore, byPriority, label: "Illustrative comparison" };
}

export function compareTradeoffs(
  from: Allocation[],
  to: Allocation[],
  priorities: ResidentPriorities,
): TradeoffSummary {
  const fromMap = allocationMap(from);
  const toMap = allocationMap(to);

  const added: ProjectId[] = [];
  const removed: ProjectId[] = [];
  const fundingChanged: TradeoffFundingChange[] = [];

  for (const [id, amount] of toMap) {
    if (!fromMap.has(id)) added.push(id);
    else if (fromMap.get(id) !== amount) {
      fundingChanged.push({ projectId: id, fromAmount: fromMap.get(id) ?? 0, toAmount: amount });
    }
  }
  for (const [id] of fromMap) {
    if (!toMap.has(id)) removed.push(id);
  }
  added.sort();
  removed.sort();
  fundingChanged.sort((a, b) => a.projectId.localeCompare(b.projectId));

  const costDelta = committedTotal(to) - committedTotal(from);
  const remainingFundsDelta = remainingFunds(to) - remainingFunds(from);

  const fromBenefits = benefitSummary(from, priorities).byPriority;
  const toBenefits = benefitSummary(to, priorities).byPriority;
  const benefitDeltas: TradeoffBenefitDelta[] = PRIORITY_KEYS.map((priority) => {
    const fromScore = fromBenefits[priority];
    const toScore = toBenefits[priority];
    const direction: TradeoffBenefitDelta["direction"] =
      toScore > fromScore ? "up" : toScore < fromScore ? "down" : "unchanged";
    return { priority, fromScore, toScore, direction };
  });

  const opportunityCosts: string[] = [];
  for (const id of removed) {
    const project = getProject(id);
    const reach = project.peopleServed.replace(/^About /, "about ");
    opportunityCosts.push(
      `Dropping ${id} (${project.name}) gives up its reach of ${reach}, along with ${describeStrengths(
        id,
      )}.`,
    );
  }
  for (const change of fundingChanged) {
    if (change.projectId === "P-06" && change.toAmount < change.fromAmount) {
      opportunityCosts.push(
        `Reducing P-06 (Street-tree programme) from $${change.fromAmount.toLocaleString(
          "en-US",
        )} to $${change.toAmount.toLocaleString("en-US")} covers fewer block groups.`,
      );
    }
  }

  const caveats = [
    "Directional comparison only, labelled Illustrative comparison; it is not an objective optimum or a measure of public value.",
    "Benefit ratings are hypothetical judgments, not measured outcomes.",
    "People-served estimates are shown per project and are not summed, because they may overlap.",
  ];

  return {
    added,
    removed,
    fundingChanged,
    costDelta,
    remainingFundsDelta,
    benefitDeltas,
    opportunityCosts,
    caveats,
  };
}

function describeStrengths(id: ProjectId): string {
  const project = getProject(id);
  const strengths: string[] = [];
  for (const key of ["safety", "accessibility", "climate"] as const) {
    if (project.benefits[key] === "High") strengths.push(`high ${key} benefit`);
  }
  if (project.communitySupport === "High") strengths.push("high community support");
  if (strengths.length === 0) return "its modest illustrative benefits";
  return `its ${joinWithAnd(strengths)}`;
}

function joinWithAnd(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}
