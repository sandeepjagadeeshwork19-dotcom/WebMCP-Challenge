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
