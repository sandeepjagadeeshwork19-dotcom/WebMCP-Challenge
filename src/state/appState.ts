/**
 * The single mutable application state shape and its deterministic initial value.
 *
 * There is exactly one store. The manual UI and every WebMCP handler read and
 * write this same state through typed actions.
 */

import { DATASET_VERSION, FUND_LIMIT } from "../domain/projects";
import type { FinalAllocationRecord } from "../domain/finalRecord";
import type {
  Allocation,
  ProjectId,
  ResidentPriorities,
  ValidationIssue,
} from "../domain/types";

export type ProposalStatus =
  | "none"
  | "invalid"
  | "valid"
  | "stale"
  | "under_review"
  | "rejected"
  | "accepted"
  | "finalised";

export type ReviewStatus = "none" | "open" | "rejected" | "accepted" | "completed";

export type Actor = "human" | "agent" | "system";

export interface AgentProposal {
  proposalRevision: number;
  allocations: Allocation[];
  rationale: string;
  basedOnBudgetRevision: number;
  allocationHash: string;
  previousProposalRevision: number | null;
  createdAt: string;
}

export interface ConstraintValidation {
  valid: boolean;
  issues: ValidationIssue[];
  validatedBudgetRevision: number;
  allocationHash: string;
}

export interface ActivityEvent {
  id: string;
  sequence: number;
  actor: Actor;
  action: string;
  summary: string;
  budgetRevision: number;
  proposalRevision: number;
  timestamp: string;
}

export interface AppState {
  datasetVersion: typeof DATASET_VERSION;
  fundLimit: typeof FUND_LIMIT;
  budgetRevision: number;
  residentPriorities: ResidentPriorities;
  lockedAllocations: Allocation[];
  manualAllocations: Allocation[];
  agentProposal: AgentProposal | null;
  previousProposal: AgentProposal | null;
  proposalRevision: number;
  proposalStatus: ProposalStatus;
  constraintValidation: ConstraintValidation | null;
  reviewStatus: ReviewStatus;
  disclosureAcknowledged: boolean;
  finalAllocationRecord: FinalAllocationRecord | null;
  activityHistory: ActivityEvent[];
  activitySequence: number;
  demoResetVersion: number;
}

export const INITIAL_PRIORITIES: ResidentPriorities = {
  safety: 0,
  accessibility: 0,
  climate: 0,
  communitySupport: 0,
};

export function createInitialState(): AppState {
  return {
    datasetVersion: DATASET_VERSION,
    fundLimit: FUND_LIMIT,
    budgetRevision: 0,
    residentPriorities: { ...INITIAL_PRIORITIES },
    lockedAllocations: [],
    manualAllocations: [],
    agentProposal: null,
    previousProposal: null,
    proposalRevision: 0,
    proposalStatus: "none",
    constraintValidation: null,
    reviewStatus: "none",
    disclosureAcknowledged: false,
    finalAllocationRecord: null,
    activityHistory: [],
    activitySequence: 0,
    demoResetVersion: 0,
  };
}

export const LOCKABLE_PROJECT_IDS: readonly ProjectId[] = [
  "P-01",
  "P-02",
  "P-03",
  "P-04",
  "P-05",
  "P-06",
  "P-07",
  "P-08",
];
