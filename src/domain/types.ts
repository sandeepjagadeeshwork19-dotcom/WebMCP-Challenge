/**
 * Core domain types for the Neighbors Decide participatory-budget workspace.
 *
 * Everything in `src/domain` is framework-independent and pure. It never reads
 * the DOM, browser globals, React state, or the WebMCP runtime.
 */

export type ProjectId =
  | "P-01"
  | "P-02"
  | "P-03"
  | "P-04"
  | "P-05"
  | "P-06"
  | "P-07"
  | "P-08";

export type BenefitRating = "Low" | "Medium" | "High";

export type CommunitySupport = "Moderate" | "High";

export type PriorityKey = "safety" | "accessibility" | "climate" | "communitySupport";

export type PriorityWeight = 0 | 1 | 2 | 3;

export type ResidentPriorities = Record<PriorityKey, PriorityWeight>;

/** A funding rule describing which amounts a project accepts. */
export type FundingRule =
  | { kind: "complete"; cost: number }
  | { kind: "phased"; allowedAmounts: number[] };

export interface Project {
  id: ProjectId;
  name: string;
  description: string;
  neighbourhood: string;
  category: string;
  /** Rounded illustrative estimate, already prefixed with "About" in copy. */
  peopleServed: string;
  cost: number;
  fundingRule: FundingRule;
  benefits: {
    safety: BenefitRating;
    accessibility: BenefitRating;
    climate: BenefitRating;
  };
  communitySupport: CommunitySupport;
  /** Project IDs that must be funded (at full funding) for this project. */
  dependencies: ProjectId[];
  /** Project IDs that cannot be co-selected with this project. */
  incompatibilities: ProjectId[];
  minimumViableFunding: string;
  hypotheticalAssumption: string;
}

/** An allocation entry. A project is "selected" when amount > 0. */
export interface Allocation {
  projectId: ProjectId;
  amount: number;
}

export type ValidationCode =
  | "unknown_project"
  | "duplicate_project"
  | "invalid_amount"
  | "funding_rule"
  | "locked_selection_changed"
  | "missing_dependency"
  | "incompatible_projects"
  | "budget_exceeded";

export interface ValidationIssue {
  code: ValidationCode;
  projectIds: ProjectId[];
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface BenefitSummary {
  /** Sum of (project rating value x resident weight) across selected projects. */
  illustrativeScore: number;
  byPriority: Record<PriorityKey, number>;
  label: "Illustrative comparison";
}

export interface TradeoffFundingChange {
  projectId: ProjectId;
  fromAmount: number;
  toAmount: number;
}

export interface TradeoffBenefitDelta {
  priority: PriorityKey;
  fromScore: number;
  toScore: number;
  direction: "up" | "down" | "unchanged";
}

export interface TradeoffSummary {
  added: ProjectId[];
  removed: ProjectId[];
  fundingChanged: TradeoffFundingChange[];
  costDelta: number;
  remainingFundsDelta: number;
  benefitDeltas: TradeoffBenefitDelta[];
  opportunityCosts: string[];
  caveats: string[];
}
