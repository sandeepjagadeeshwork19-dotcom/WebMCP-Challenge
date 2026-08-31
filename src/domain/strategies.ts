/**
 * Canonical "strategy directions" — three distinct, deterministically valid ways
 * to spend the fund, each expressing a different priority lens.
 *
 * These are starting points a resident can adopt, and the agent can compare them
 * against the resident's current priorities via the `list_strategy_options` tool.
 * Adopting a direction only sets priority weights — it never funds anything; the
 * resident still builds and commits the actual allocation.
 */

import { PROJECT_IDS, getProject } from "./projects";
import { benefitSummary } from "./tradeoffs";
import { committedTotal, remainingFunds } from "./validation";
import type { Allocation, ProjectId, ResidentPriorities } from "./types";

export type StrategyId = "safety_access" | "climate_resilience" | "broad_coverage";

export interface StrategyPreset {
  id: StrategyId;
  label: string;
  blurb: string;
  /** One line: what this direction is strongest at. */
  mainBenefit: string;
  /** One line: what it gives up. */
  mainSacrifice: string;
  priorities: ResidentPriorities;
  /** An illustrative valid allocation that embodies this lens. */
  allocations: Allocation[];
}

export const STRATEGY_PRESETS: readonly StrategyPreset[] = [
  {
    id: "safety_access",
    label: "Safety & access first",
    blurb:
      "Prioritise reduced injury risk and step-free, inclusive design. Funds the road crossings, bus shelters, the storm-water drain, PHC equipment and the study room.",
    mainBenefit: "Safest junctions and step-free access, ward-wide.",
    mainSacrifice: "No riverside play area; no cycle track.",
    priorities: { safety: 3, accessibility: 3, climate: 1, communitySupport: 1 },
    allocations: [
      { projectId: "P-01", amount: 180_000 },
      { projectId: "P-02", amount: 150_000 },
      { projectId: "P-04", amount: 240_000 },
      { projectId: "P-05", amount: 160_000 },
      { projectId: "P-06", amount: 90_000 },
      { projectId: "P-07", amount: 140_000 },
    ],
  },
  {
    id: "climate_resilience",
    label: "Climate resilience",
    blurb:
      "Prioritise heat relief, drainage and lower-emission travel. Funds the storm-water drain, the protected cycle track, the full tree drive, bus shelters and PHC equipment.",
    mainBenefit: "Built for the monsoon and the heat — the drain, full tree drive, clean travel.",
    mainSacrifice: "No play area, no road crossings, no study room.",
    priorities: { safety: 2, accessibility: 1, climate: 3, communitySupport: 1 },
    allocations: [
      { projectId: "P-02", amount: 150_000 },
      { projectId: "P-04", amount: 240_000 },
      { projectId: "P-05", amount: 160_000 },
      { projectId: "P-06", amount: 120_000 },
      { projectId: "P-08", amount: 260_000 },
    ],
  },
  {
    id: "broad_coverage",
    label: "Broad ward coverage",
    blurb:
      "Spread the fund across the most localities. Funds bus shelters, the play area and its required drain, PHC equipment, the study room and a starter tree phase.",
    mainBenefit: "The widest spread — and the only direction that funds the riverside play area.",
    mainSacrifice: "No road crossings, no cycle track; smallest tree phase.",
    priorities: { safety: 2, accessibility: 2, climate: 2, communitySupport: 3 },
    allocations: [
      { projectId: "P-02", amount: 150_000 },
      { projectId: "P-03", amount: 210_000 },
      { projectId: "P-04", amount: 240_000 },
      { projectId: "P-05", amount: 160_000 },
      { projectId: "P-06", amount: 60_000 },
      { projectId: "P-07", amount: 140_000 },
    ],
  },
] as const;

export function getStrategy(id: StrategyId): StrategyPreset {
  const preset = STRATEGY_PRESETS.find((s) => s.id === id);
  if (!preset) throw new Error(`Unknown strategy id: ${id}`);
  return preset;
}

/** Distinct neighbourhoods touched by a strategy's selected projects. */
export function strategyNeighbourhoods(preset: StrategyPreset): string[] {
  const set = new Set<string>();
  for (const entry of preset.allocations) {
    if (entry.amount > 0) set.add(getProject(entry.projectId).neighbourhood);
  }
  return [...set];
}

export interface StrategyView {
  id: StrategyId;
  label: string;
  blurb: string;
  mainBenefit: string;
  mainSacrifice: string;
  lensPriorities: ResidentPriorities;
  /** Illustrative benefit score at the resident's *current* priorities. */
  scoreAtResidentPriorities: number;
  committedTotal: number;
  unallocated: number;
  neighbourhoodCount: number;
  fundsShort: string[];
  leavesOutShort: string[];
  matchesCurrentPriorities: boolean;
}

/** Build the card view-model for a direction, scored against the resident. */
export function describeStrategy(
  preset: StrategyPreset,
  residentPriorities: ResidentPriorities,
): StrategyView {
  const funded = new Set<ProjectId>(
    preset.allocations.filter((a) => a.amount > 0).map((a) => a.projectId),
  );
  const matches = (Object.keys(residentPriorities) as (keyof ResidentPriorities)[]).every(
    (k) => residentPriorities[k] === preset.priorities[k],
  );
  return {
    id: preset.id,
    label: preset.label,
    blurb: preset.blurb,
    mainBenefit: preset.mainBenefit,
    mainSacrifice: preset.mainSacrifice,
    lensPriorities: preset.priorities,
    scoreAtResidentPriorities: Math.round(
      benefitSummary(preset.allocations, residentPriorities).illustrativeScore,
    ),
    committedTotal: committedTotal(preset.allocations),
    unallocated: remainingFunds(preset.allocations),
    neighbourhoodCount: strategyNeighbourhoods(preset).length,
    fundsShort: PROJECT_IDS.filter((id) => funded.has(id)).map((id) => getProject(id).shortName),
    leavesOutShort: PROJECT_IDS.filter((id) => !funded.has(id)).map(
      (id) => getProject(id).shortName,
    ),
    matchesCurrentPriorities: matches,
  };
}
