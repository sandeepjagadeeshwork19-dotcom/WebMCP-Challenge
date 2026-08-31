/**
 * The one revisioned state machine. Pure: (state, action) -> state.
 *
 * Only this reducer creates activity events and actor labels. Only `human/*`
 * actions change priorities, locks, manual allocations, acceptance and
 * finalisation. Only `agent/proposeAllocation` changes `proposalRevision`.
 */

import { buildFinalRecord } from "../domain/finalRecord";
import { allocationHash } from "../domain/hash";
import { getProject } from "../domain/projects";
import { committedTotal, validateAllocation } from "../domain/validation";
import type { Allocation, PriorityKey, ProjectId } from "../domain/types";
import { actorForAction, type AppAction } from "./actions";
import {
  createInitialState,
  type ActivityEvent,
  type AppState,
  type ConstraintValidation,
} from "./appState";

const PRIORITY_KEYS: PriorityKey[] = ["safety", "accessibility", "climate", "communitySupport"];

function isLocked(state: AppState, projectId: ProjectId): boolean {
  return state.lockedAllocations.some((l) => l.projectId === projectId);
}

function money(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

function appendActivity(
  state: AppState,
  actor: ActivityEvent["actor"],
  action: string,
  summary: string,
  timestamp: string,
): Pick<AppState, "activityHistory" | "activitySequence"> {
  const sequence = state.activitySequence + 1;
  const event: ActivityEvent = {
    id: `evt-${sequence}`,
    sequence,
    actor,
    action,
    summary,
    budgetRevision: state.budgetRevision,
    proposalRevision: state.proposalRevision,
    timestamp,
  };
  return {
    activityHistory: [...state.activityHistory, event],
    activitySequence: sequence,
  };
}

/** Apply the automatic staleness rule after a human-owned budget change. */
function staleAfterHumanEdit(state: AppState): Pick<AppState, "proposalStatus" | "reviewStatus"> {
  if (
    state.proposalStatus === "valid" ||
    state.proposalStatus === "under_review" ||
    state.proposalStatus === "accepted"
  ) {
    return { proposalStatus: "stale", reviewStatus: "none" };
  }
  return { proposalStatus: state.proposalStatus, reviewStatus: state.reviewStatus };
}

/** A human-owned budget change: bump revision, stale proposal, log one event. */
function commitHumanBudgetChange(
  state: AppState,
  patch: Partial<AppState>,
  action: string,
  summary: string,
  timestamp: string,
): AppState {
  const next: AppState = {
    ...state,
    ...patch,
    budgetRevision: state.budgetRevision + 1,
  };
  const staled = staleAfterHumanEdit(next);
  next.proposalStatus = staled.proposalStatus;
  next.reviewStatus = staled.reviewStatus;
  Object.assign(next, appendActivity(next, "human", action, summary, timestamp));
  return next;
}

function upsertAllocation(
  allocations: Allocation[],
  projectId: ProjectId,
  amount: number,
): Allocation[] {
  const filtered = allocations.filter((a) => a.projectId !== projectId);
  return [...filtered, { projectId, amount }].sort((a, b) =>
    a.projectId.localeCompare(b.projectId),
  );
}

function currentConstraintMatches(state: AppState): boolean {
  const cv = state.constraintValidation;
  return (
    !!cv &&
    !!state.agentProposal &&
    cv.valid &&
    cv.validatedBudgetRevision === state.budgetRevision &&
    cv.allocationHash === state.agentProposal.allocationHash
  );
}

export function reducer(state: AppState, action: AppAction): AppState {
  const timestamp = action.timestamp ?? "1970-01-01T00:00:00.000Z";
  const actor = actorForAction(action);

  switch (action.type) {
    case "human/setPriority": {
      if (!PRIORITY_KEYS.includes(action.key)) return state;
      if (![0, 1, 2, 3].includes(action.weight)) return state;
      if (state.residentPriorities[action.key] === action.weight) return state;
      return commitHumanBudgetChange(
        state,
        {
          residentPriorities: {
            ...state.residentPriorities,
            [action.key]: action.weight,
          },
        },
        "set_priority",
        `Set ${action.key} priority to ${action.weight}`,
        timestamp,
      );
    }

    case "human/setAllocation": {
      if (isLocked(state, action.projectId)) {
        const locked = state.lockedAllocations.find((l) => l.projectId === action.projectId);
        if (locked && locked.amount !== action.amount) return state;
      }
      const existing = state.manualAllocations.find((a) => a.projectId === action.projectId);
      if (existing && existing.amount === action.amount) return state;
      const projectName = getProject(action.projectId).name;
      return commitHumanBudgetChange(
        state,
        { manualAllocations: upsertAllocation(state.manualAllocations, action.projectId, action.amount) },
        "set_allocation",
        `${existing ? "Adjusted" : "Selected"} ${action.projectId} (${projectName}) at ${money(action.amount)}`,
        timestamp,
      );
    }

    case "human/removeAllocation": {
      if (isLocked(state, action.projectId)) return state;
      if (!state.manualAllocations.some((a) => a.projectId === action.projectId)) return state;
      return commitHumanBudgetChange(
        state,
        {
          manualAllocations: state.manualAllocations.filter(
            (a) => a.projectId !== action.projectId,
          ),
        },
        "remove_allocation",
        `Removed ${action.projectId} (${getProject(action.projectId).name})`,
        timestamp,
      );
    }

    case "human/lockProject": {
      const entry = state.manualAllocations.find((a) => a.projectId === action.projectId);
      if (!entry || entry.amount <= 0) return state;
      if (isLocked(state, action.projectId)) return state;
      return commitHumanBudgetChange(
        state,
        {
          lockedAllocations: [
            ...state.lockedAllocations,
            { projectId: action.projectId, amount: entry.amount },
          ].sort((a, b) => a.projectId.localeCompare(b.projectId)),
        },
        "lock_project",
        `Locked ${action.projectId} at ${money(entry.amount)}`,
        timestamp,
      );
    }

    case "human/unlockProject": {
      if (!isLocked(state, action.projectId)) return state;
      return commitHumanBudgetChange(
        state,
        {
          lockedAllocations: state.lockedAllocations.filter(
            (l) => l.projectId !== action.projectId,
          ),
        },
        "unlock_project",
        `Unlocked ${action.projectId}`,
        timestamp,
      );
    }

    case "human/setDisclosureAck": {
      if (state.disclosureAcknowledged === action.acknowledged) return state;
      const next: AppState = { ...state, disclosureAcknowledged: action.acknowledged };
      Object.assign(
        next,
        appendActivity(
          next,
          "human",
          action.acknowledged ? "acknowledge_disclosure" : "withdraw_disclosure_acknowledgement",
          action.acknowledged
            ? "Acknowledged the hypothetical-data disclosure"
            : "Withdrew the hypothetical-data acknowledgement",
          timestamp,
        ),
      );
      return next;
    }

    case "human/openReview": {
      if (state.proposalStatus !== "valid") return state;
      if (state.reviewStatus === "open") return state;
      if (!currentConstraintMatches(state)) return state;
      const next: AppState = {
        ...state,
        proposalStatus: "under_review",
        reviewStatus: "open",
      };
      Object.assign(
        next,
        appendActivity(next, "human", "open_review", "Opened resident review", timestamp),
      );
      return next;
    }

    case "human/rejectProposal": {
      if (state.proposalStatus !== "under_review") return state;
      const next: AppState = {
        ...state,
        proposalStatus: "rejected",
        reviewStatus: "rejected",
      };
      Object.assign(
        next,
        appendActivity(next, "human", "reject_proposal", "Rejected the proposal", timestamp),
      );
      return next;
    }

    case "human/acceptProposal": {
      if (state.proposalStatus !== "under_review") return state;
      if (!currentConstraintMatches(state)) return state;
      const next: AppState = {
        ...state,
        proposalStatus: "accepted",
        reviewStatus: "accepted",
      };
      Object.assign(
        next,
        appendActivity(next, "human", "accept_proposal", "Accepted the proposal (not yet finalised)", timestamp),
      );
      return next;
    }

    case "human/finalise": {
      const check = finalisationBlockers(state);
      if (check.length > 0) return state;
      const proposal = state.agentProposal!;
      const validation = validateAllocation(proposal.allocations, {
        lockedAllocations: state.lockedAllocations,
      });
      if (!validation.valid) return state;
      const finalSequence = state.activitySequence + 1;
      const record = buildFinalRecord({
        allocations: proposal.allocations,
        residentPriorities: state.residentPriorities,
        lockedAllocations: state.lockedAllocations,
        proposalRevision: proposal.proposalRevision,
        budgetRevision: state.budgetRevision,
        validation,
        demoResetVersion: state.demoResetVersion,
        finalSequence,
        createdAt: timestamp,
      });
      const next: AppState = {
        ...state,
        proposalStatus: "finalised",
        reviewStatus: "completed",
        finalAllocationRecord: record,
      };
      Object.assign(
        next,
        appendActivity(
          next,
          "human",
          "finalise_allocation",
          `Finalised allocation (${money(committedTotal(proposal.allocations))} committed)`,
          timestamp,
        ),
      );
      return next;
    }

    case "human/reset": {
      const fresh = createInitialState();
      fresh.demoResetVersion = state.demoResetVersion + 1;
      fresh.activitySequence = state.activitySequence;
      Object.assign(
        fresh,
        appendActivity(fresh, "human", "reset_demo", "Reset the demonstration to its initial state", timestamp),
      );
      return fresh;
    }

    case "agent/proposeAllocation": {
      const hash = allocationHash(action.allocations);
      const validation = validateAllocation(action.allocations, {
        lockedAllocations: state.lockedAllocations,
      });
      const proposalRevision = state.proposalRevision + 1;
      const constraintValidation: ConstraintValidation = {
        valid: validation.valid,
        issues: validation.issues,
        validatedBudgetRevision: state.budgetRevision,
        allocationHash: hash,
      };
      const next: AppState = {
        ...state,
        previousProposal: state.agentProposal,
        agentProposal: {
          proposalRevision,
          allocations: [...action.allocations],
          rationale: action.rationale,
          basedOnBudgetRevision: state.budgetRevision,
          allocationHash: hash,
          previousProposalRevision: state.agentProposal?.proposalRevision ?? null,
          createdAt: timestamp,
        },
        proposalRevision,
        proposalStatus: validation.valid ? "valid" : "invalid",
        constraintValidation,
        reviewStatus: "none",
      };
      Object.assign(
        next,
        appendActivity(
          next,
          "agent",
          "propose_allocation",
          `Proposed allocation rev ${proposalRevision}: ${
            validation.valid ? "valid" : "invalid"
          }, ${money(committedTotal(action.allocations))} committed`,
          timestamp,
        ),
      );
      return next;
    }

    case "agent/requestReview": {
      if (state.proposalStatus !== "valid") return state;
      if (state.reviewStatus === "open") return state;
      if (!currentConstraintMatches(state)) return state;
      const next: AppState = {
        ...state,
        proposalStatus: "under_review",
        reviewStatus: "open",
      };
      Object.assign(
        next,
        appendActivity(
          next,
          "agent",
          "request_allocation_review",
          `Requested resident review of proposal rev ${state.proposalRevision}`,
          timestamp,
        ),
      );
      return next;
    }

    default: {
      // Exhaustiveness guard.
      void actor;
      return state;
    }
  }
}

/** Reasons finalisation is currently blocked, in a stable order. */
export function finalisationBlockers(state: AppState): string[] {
  const blockers: string[] = [];
  const proposal = state.agentProposal;
  if (state.proposalStatus !== "accepted") {
    blockers.push("The proposal has not been accepted by the resident.");
  }
  if (state.reviewStatus !== "accepted") {
    blockers.push("The resident review is not complete.");
  }
  if (!proposal) {
    blockers.push("There is no active proposal.");
    return blockers;
  }
  if (proposal.basedOnBudgetRevision !== state.budgetRevision) {
    blockers.push(
      `The budget changed since acceptance (proposal revision ${proposal.basedOnBudgetRevision}, current ${state.budgetRevision}).`,
    );
  }
  const cv = state.constraintValidation;
  if (!cv || !cv.valid) {
    blockers.push("The last validation result is not successful.");
  } else {
    if (cv.validatedBudgetRevision !== state.budgetRevision) {
      blockers.push("The validation result is bound to an older budget revision.");
    }
    if (cv.allocationHash !== proposal.allocationHash) {
      blockers.push("The allocation changed since it was validated.");
    }
  }
  if (!state.disclosureAcknowledged) {
    blockers.push("The hypothetical-data disclosure has not been acknowledged.");
  }
  return blockers;
}
