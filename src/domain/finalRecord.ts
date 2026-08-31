/**
 * The transparent, local-only final allocation record.
 *
 * It is displayed and copyable in the page. It is never transmitted or persisted
 * to any backend.
 */

import { DATASET_VERSION, FUND_LIMIT, getProject } from "./projects";
import { HYPOTHETICAL_DISCLOSURE } from "./disclosure";
import { allocationHash } from "./hash";
import { committedTotal } from "./validation";
import type {
  Allocation,
  ProjectId,
  ResidentPriorities,
  ValidationResult,
} from "./types";

export interface FinalAllocationRecord {
  recordId: string;
  createdAt: string;
  datasetVersion: typeof DATASET_VERSION;
  disclosure: string;
  fundLimit: number;
  committedTotal: number;
  unallocatedAmount: number;
  allocations: Allocation[];
  appliedDependencies: { projectId: ProjectId; dependsOn: ProjectId }[];
  residentPriorities: ResidentPriorities;
  lockedAllocations: Allocation[];
  sourceProposalRevision: number;
  sourceBudgetRevision: number;
  allocationHash: string;
  validation: ValidationResult;
  actor: "human_finalisation";
}

export interface BuildFinalRecordInput {
  allocations: Allocation[];
  residentPriorities: ResidentPriorities;
  lockedAllocations: Allocation[];
  proposalRevision: number;
  budgetRevision: number;
  validation: ValidationResult;
  demoResetVersion: number;
  finalSequence: number;
  createdAt: string;
}

export function buildFinalRecord(input: BuildFinalRecordInput): FinalAllocationRecord {
  const total = committedTotal(input.allocations);
  const selected = input.allocations.filter((a) => a.amount > 0);

  const appliedDependencies: { projectId: ProjectId; dependsOn: ProjectId }[] = [];
  for (const entry of selected) {
    for (const dependsOn of getProject(entry.projectId).dependencies) {
      appliedDependencies.push({ projectId: entry.projectId, dependsOn });
    }
  }

  return {
    recordId: `${DATASET_VERSION}/reset-${input.demoResetVersion}/final-${input.finalSequence}`,
    createdAt: input.createdAt,
    datasetVersion: DATASET_VERSION,
    disclosure: HYPOTHETICAL_DISCLOSURE,
    fundLimit: FUND_LIMIT,
    committedTotal: total,
    unallocatedAmount: FUND_LIMIT - total,
    allocations: [...selected].sort((a, b) => a.projectId.localeCompare(b.projectId)),
    appliedDependencies,
    residentPriorities: { ...input.residentPriorities },
    lockedAllocations: [...input.lockedAllocations].sort((a, b) =>
      a.projectId.localeCompare(b.projectId),
    ),
    sourceProposalRevision: input.proposalRevision,
    sourceBudgetRevision: input.budgetRevision,
    allocationHash: allocationHash(input.allocations),
    validation: input.validation,
    actor: "human_finalisation",
  };
}
