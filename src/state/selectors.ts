/**
 * Read-only derived views over AppState. The UI and the WebMCP read handlers use
 * these so displayed values and tool output cannot diverge.
 */

import { benefitSummary, compareTradeoffs } from "../domain/tradeoffs";
import {
  committedTotal,
  remainingFunds,
  selectedProjectIds,
  validateAllocation,
} from "../domain/validation";
import type { Allocation, TradeoffSummary, ValidationResult } from "../domain/types";
import { finalisationBlockers } from "./reducer";
import type { AppState } from "./appState";

export function selectManualValidation(state: AppState): ValidationResult {
  return validateAllocation(state.manualAllocations, {
    lockedAllocations: state.lockedAllocations,
  });
}

export function selectCommittedTotal(state: AppState): number {
  return committedTotal(state.manualAllocations);
}

export function selectRemainingFunds(state: AppState): number {
  return remainingFunds(state.manualAllocations);
}

export function selectSelectedProjectIds(state: AppState) {
  return selectedProjectIds(state.manualAllocations);
}

export function selectBenefitSummary(state: AppState) {
  return benefitSummary(state.manualAllocations, state.residentPriorities);
}

export function selectProposalAllocations(state: AppState): Allocation[] {
  return state.agentProposal?.allocations ?? [];
}

export function selectProposalCommittedTotal(state: AppState): number {
  return committedTotal(selectProposalAllocations(state));
}

export function selectProposalRemainingFunds(state: AppState): number {
  return remainingFunds(selectProposalAllocations(state));
}

export function selectProposalTradeoffVsManual(state: AppState): TradeoffSummary | null {
  if (!state.agentProposal) return null;
  return compareTradeoffs(
    state.manualAllocations,
    state.agentProposal.allocations,
    state.residentPriorities,
  );
}

export function selectProposalTradeoffVsPrevious(state: AppState): TradeoffSummary | null {
  if (!state.agentProposal || !state.previousProposal) return null;
  return compareTradeoffs(
    state.previousProposal.allocations,
    state.agentProposal.allocations,
    state.residentPriorities,
  );
}

export function selectConstraintMatchesCurrent(state: AppState): boolean {
  const cv = state.constraintValidation;
  return (
    !!cv &&
    !!state.agentProposal &&
    cv.valid &&
    cv.validatedBudgetRevision === state.budgetRevision &&
    cv.allocationHash === state.agentProposal.allocationHash
  );
}

export function selectCanOpenReview(state: AppState): boolean {
  return (
    state.proposalStatus === "valid" &&
    state.reviewStatus !== "open" &&
    selectConstraintMatchesCurrent(state)
  );
}

export function selectIsProposalStale(state: AppState): boolean {
  return state.proposalStatus === "stale";
}

export function selectFinalisationBlockers(state: AppState): string[] {
  return finalisationBlockers(state);
}

export function selectCanFinalise(state: AppState): boolean {
  return finalisationBlockers(state).length === 0;
}

export function selectRecentActivity(state: AppState, limit = 20) {
  return state.activityHistory.slice(-limit).reverse();
}

// --- Flow stage --------------------------------------------------------------

export type Stage =
  | "priorities"
  | "compare"
  | "draft"
  | "replanning"
  | "invalid"
  | "rejected"
  | "review"
  | "adopted";

export function selectPrioritiesSet(state: AppState): boolean {
  return state.prioritiesConfirmed;
}

export function selectStage(state: AppState): Stage {
  if (state.proposalStatus === "finalised") return "adopted";
  // A sent-back plan is the resident's to revise - its own editable step, not a
  // review the resident is somehow still inside.
  if (state.proposalStatus === "rejected") return "rejected";
  if (
    state.reviewStatus === "open" ||
    state.proposalStatus === "under_review" ||
    state.proposalStatus === "accepted"
  ) {
    return "review";
  }
  if (state.proposalStatus === "stale") return "replanning";
  if (state.proposalStatus === "invalid") return "invalid";
  if (state.proposalStatus === "valid") return "draft";
  return selectPrioritiesSet(state) ? "compare" : "priorities";
}

/** The allocation currently in focus: the proposal if there is one, else manual. */
export function selectActiveAllocation(state: AppState): Allocation[] {
  return state.agentProposal ? state.agentProposal.allocations : state.manualAllocations;
}

export function selectStatusLabel(state: AppState): string {
  switch (selectStage(state)) {
    case "adopted":
      return "adopted";
    case "review":
      return state.proposalStatus === "accepted" ? "accepted" : "under review";
    case "replanning":
      return "needs redraft";
    case "rejected":
      return "sent back";
    case "invalid":
      return "breaks a rule";
    case "draft":
      return "valid";
    default: {
      if (state.lockedAllocations.length > 0) return "protected choice pending";
      if (state.manualAllocations.length === 0) return "incomplete";
      return selectManualValidation(state).valid ? "valid" : "has issues";
    }
  }
}

export interface TurnIndicator {
  actor: "you" | "assistant" | "done";
  text: string;
}

export function selectTurn(state: AppState): TurnIndicator {
  switch (selectStage(state)) {
    case "priorities":
      return { actor: "you", text: "Your move - set what you value, or ask the assistant to suggest a plan" };
    case "compare":
      return { actor: "you", text: "Your move - compare the plans and pick one" };
    case "draft":
      return { actor: "you", text: "Your move - review the plan, or send it back for changes" };
    case "replanning":
      return { actor: "assistant", text: "Assistant's move - ask it to redraft the plan" };
    case "invalid":
      return { actor: "assistant", text: "The draft breaks a rule - ask the assistant to fix it" };
    case "rejected":
      return { actor: "you", text: "Your move - change a priority or protection, then rebuild" };
    case "review":
      return state.proposalStatus === "accepted"
        ? { actor: "you", text: "Your move - tick the box, then adopt" }
        : { actor: "you", text: "Your move - accept or send back, then adopt" };
    case "adopted":
      return { actor: "done", text: "Adopted. The assistant modelled the options; you made the call." };
  }
}
