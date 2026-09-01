/**
 * WebMCP tool handlers. Every handler reads and writes the exact same store the
 * visible React UI uses. Read handlers never dispatch. State-changing handlers
 * dispatch only `agent/*` actions.
 */

import { HYPOTHETICAL_DISCLOSURE } from "../domain/disclosure";
import { DATASET_VERSION, FUND_LIMIT, getProject, PROJECT_IDS } from "../domain/projects";
import { STRATEGY_PRESETS, strategyNeighbourhoods } from "../domain/strategies";
import { benefitSummary, compareTradeoffs } from "../domain/tradeoffs";
import {
  committedTotal,
  selectedProjectIds,
  validateAllocation,
} from "../domain/validation";
import type { ProjectId } from "../domain/types";
import type { Store } from "../state/store";
import {
  selectConstraintMatchesCurrent,
  selectProposalTradeoffVsManual,
  selectProposalTradeoffVsPrevious,
} from "../state/selectors";
import { toolError } from "./errors";
import { getWebMcpTrace, type ToolMode } from "./trace";
import type { ToolName } from "./contracts";
import {
  asBoolean,
  asBoundedString,
  asInteger,
  asObject,
  parseAllocations,
  parseProjectIdList,
} from "./parse";

export interface Handlers {
  get_budget_state: (input: unknown) => unknown;
  list_projects: (input: unknown) => unknown;
  list_strategy_options: (input: unknown) => unknown;
  simulate_allocation: (input: unknown) => unknown;
  propose_allocation: (input: unknown) => unknown;
  explain_tradeoffs: (input: unknown) => unknown;
  request_allocation_review: (input: unknown) => unknown;
}

function proposalSummary(store: Store) {
  const state = store.getState();
  if (!state.agentProposal) return null;
  return {
    createdBy: state.agentProposal.createdBy,
    proposalRevision: state.agentProposal.proposalRevision,
    status: state.proposalStatus,
    basedOnBudgetRevision: state.agentProposal.basedOnBudgetRevision,
    allocationHash: state.agentProposal.allocationHash,
    rationale: state.agentProposal.rationale,
  };
}

export function createHandlers(store: Store): Handlers {
  const handlers: Handlers = {
    get_budget_state(input) {
      const parsed = asObject(input ?? {}, ["includeRecentActivity"]);
      if (!parsed.ok) return parsed.error;
      let includeRecentActivity = false;
      if (parsed.value.includeRecentActivity !== undefined) {
        const flag = asBoolean(parsed.value.includeRecentActivity, "includeRecentActivity");
        if (!flag.ok) return flag.error;
        includeRecentActivity = flag.value;
      }

      const state = store.getState();
      const total = committedTotal(state.manualAllocations);
      return {
        datasetVersion: state.datasetVersion,
        fundLimit: state.fundLimit,
        budgetRevision: state.budgetRevision,
        priorities: { ...state.residentPriorities },
        lockedAllocations: state.lockedAllocations,
        manualAllocations: state.manualAllocations,
        committedTotal: total,
        remainingFunds: FUND_LIMIT - total,
        proposal: proposalSummary(store),
        reviewStatus: state.reviewStatus,
        finalised: state.proposalStatus === "finalised",
        ...(includeRecentActivity
          ? {
              recentActivity: state.activityHistory
                .slice(-15)
                .reverse()
                .map((e) => ({
                  sequence: e.sequence,
                  actor: e.actor,
                  action: e.action,
                  summary: e.summary,
                  budgetRevision: e.budgetRevision,
                  proposalRevision: e.proposalRevision,
                })),
            }
          : {}),
      };
    },

    list_projects(input) {
      const parsed = asObject(input ?? {}, ["projectIds"]);
      if (!parsed.ok) return parsed.error;
      let ids: ProjectId[] = [...PROJECT_IDS];
      if (parsed.value.projectIds !== undefined) {
        const list = parseProjectIdList(parsed.value.projectIds);
        if (!list.ok) return list.error;
        ids = PROJECT_IDS.filter((id) => list.value.includes(id));
      }
      return {
        datasetVersion: DATASET_VERSION,
        projects: ids.map((id) => {
          const p = getProject(id);
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            neighbourhood: p.neighbourhood,
            category: p.category,
            peopleServed: p.peopleServed,
            cost: p.cost,
            fundingRule: p.fundingRule,
            benefits: p.benefits,
            communitySupport: p.communitySupport,
            dependencies: p.dependencies,
            incompatibilities: p.incompatibilities,
            minimumViableFunding: p.minimumViableFunding,
            hypotheticalAssumption: p.hypotheticalAssumption,
            disclosure: "Hypothetical data",
          };
        }),
      };
    },

    list_strategy_options(input) {
      const parsed = asObject(input ?? {}, []);
      if (!parsed.ok) return parsed.error;
      const state = store.getState();
      return {
        datasetVersion: DATASET_VERSION,
        residentPriorities: { ...state.residentPriorities },
        note:
          "These are structured comparison options. Calling this tool changes nothing; the page can separately load an application example draft.",
        strategies: STRATEGY_PRESETS.map((s) => {
          const total = committedTotal(s.allocations);
          return {
            id: s.id,
            label: s.label,
            blurb: s.blurb,
            lensPriorities: s.priorities,
            allocations: s.allocations,
            committedTotal: total,
            remainingFunds: FUND_LIMIT - total,
            selectedProjectIds: selectedProjectIds(s.allocations),
            neighbourhoods: strategyNeighbourhoods(s),
            valid: validateAllocation(s.allocations, {
              lockedAllocations: state.lockedAllocations,
            }).valid,
            scoreAtResidentPriorities: benefitSummary(s.allocations, state.residentPriorities),
            scoreAtLensPriorities: benefitSummary(s.allocations, s.priorities),
          };
        }),
      };
    },

    simulate_allocation(input) {
      const parsed = asObject(input, ["budgetRevision", "allocations"]);
      if (!parsed.ok) return parsed.error;
      const revision = asInteger(parsed.value.budgetRevision, "budgetRevision");
      if (!revision.ok) return revision.error;
      const allocations = parseAllocations(parsed.value.allocations);
      if (!allocations.ok) return allocations.error;

      const state = store.getState();
      if (revision.value !== state.budgetRevision) {
        return toolError(
          "stale_budget_revision",
          `Referenced budget revision ${revision.value} but the current revision is ${state.budgetRevision}. Re-read get_budget_state.`,
        );
      }

      const validation = validateAllocation(allocations.value, {
        lockedAllocations: state.lockedAllocations,
      });
      const total = committedTotal(allocations.value);
      return {
        valid: validation.valid,
        budgetRevision: state.budgetRevision,
        committedTotal: total,
        remainingFunds: FUND_LIMIT - total,
        selectedProjectIds: selectedProjectIds(allocations.value),
        validationIssues: validation.issues,
        benefitSummary: benefitSummary(allocations.value, state.residentPriorities),
        comparedWithCurrent: compareTradeoffs(
          state.manualAllocations,
          allocations.value,
          state.residentPriorities,
        ),
      };
    },

    propose_allocation(input) {
      const parsed = asObject(input, ["budgetRevision", "allocations", "rationale"]);
      if (!parsed.ok) return parsed.error;
      const revision = asInteger(parsed.value.budgetRevision, "budgetRevision");
      if (!revision.ok) return revision.error;
      const allocations = parseAllocations(parsed.value.allocations);
      if (!allocations.ok) return allocations.error;
      const rationale = asBoundedString(parsed.value.rationale, "rationale", 1, 600);
      if (!rationale.ok) return rationale.error;

      const state = store.getState();
      if (revision.value !== state.budgetRevision) {
        return toolError(
          "stale_budget_revision",
          `Referenced budget revision ${revision.value} but the current revision is ${state.budgetRevision}. Re-read get_budget_state.`,
        );
      }

      store.dispatch({
        type: "agent/proposeAllocation",
        allocations: allocations.value,
        rationale: rationale.value,
      });

      const next = store.getState();
      const proposal = next.agentProposal!;
      const cv = next.constraintValidation!;
      const total = committedTotal(proposal.allocations);
      return {
        proposalRevision: proposal.proposalRevision,
        status: next.proposalStatus === "valid" ? "valid" : "invalid",
        basedOnBudgetRevision: proposal.basedOnBudgetRevision,
        committedTotal: total,
        remainingFunds: FUND_LIMIT - total,
        validationIssues: cv.issues,
        allocationHash: proposal.allocationHash,
      };
    },

    explain_tradeoffs(input) {
      const parsed = asObject(input, ["proposalRevision", "compareWith"]);
      if (!parsed.ok) return parsed.error;
      const revision = asInteger(parsed.value.proposalRevision, "proposalRevision");
      if (!revision.ok) return revision.error;
      const compareWith = parsed.value.compareWith;
      if (compareWith !== "manual_allocation" && compareWith !== "previous_proposal") {
        return toolError(
          "invalid_input",
          'compareWith must be "manual_allocation" or "previous_proposal".',
        );
      }

      const state = store.getState();
      if (!state.agentProposal) {
        return toolError("no_active_proposal", "There is no active proposal to explain.");
      }
      if (revision.value !== state.agentProposal.proposalRevision) {
        return toolError(
          "proposal_revision_mismatch",
          `Referenced proposal revision ${revision.value} but the active proposal is revision ${state.agentProposal.proposalRevision}.`,
        );
      }

      const tradeoff =
        compareWith === "manual_allocation"
          ? selectProposalTradeoffVsManual(state)
          : selectProposalTradeoffVsPrevious(state);
      if (!tradeoff) {
        return toolError(
          "comparison_unavailable",
          "There is no previous proposal to compare against.",
        );
      }

      const caveats = [...tradeoff.caveats];
      if (state.proposalStatus === "stale") {
        caveats.unshift(
          "This proposal is stale: the resident changed the budget since it was created.",
        );
      }
      return {
        proposalRevision: state.agentProposal.proposalRevision,
        proposalStatus: state.proposalStatus,
        added: tradeoff.added,
        removed: tradeoff.removed,
        fundingChanged: tradeoff.fundingChanged,
        costDelta: tradeoff.costDelta,
        remainingFundsDelta: tradeoff.remainingFundsDelta,
        benefitDeltas: tradeoff.benefitDeltas,
        opportunityCosts: tradeoff.opportunityCosts,
        caveats,
      };
    },

    request_allocation_review(input) {
      const parsed = asObject(input, ["budgetRevision", "proposalRevision"]);
      if (!parsed.ok) return parsed.error;
      const budgetRevision = asInteger(parsed.value.budgetRevision, "budgetRevision");
      if (!budgetRevision.ok) return budgetRevision.error;
      const proposalRevision = asInteger(parsed.value.proposalRevision, "proposalRevision");
      if (!proposalRevision.ok) return proposalRevision.error;

      const state = store.getState();
      if (!state.agentProposal) {
        return toolError("no_active_proposal", "There is no active proposal.");
      }
      if (budgetRevision.value !== state.budgetRevision) {
        return toolError(
          "stale_budget_revision",
          `Referenced budget revision ${budgetRevision.value} but the current revision is ${state.budgetRevision}.`,
        );
      }
      if (proposalRevision.value !== state.agentProposal.proposalRevision) {
        return toolError(
          "proposal_revision_mismatch",
          `Referenced proposal revision ${proposalRevision.value} but the active proposal is revision ${state.agentProposal.proposalRevision}.`,
        );
      }
      if (state.proposalStatus === "stale") {
        return toolError("stale_proposal", "The proposal is stale and cannot enter review.");
      }
      if (state.reviewStatus === "open") {
        return toolError("review_already_open", "A resident review is already open.");
      }
      if (state.proposalStatus !== "valid" || !selectConstraintMatchesCurrent(state)) {
        return toolError(
          "proposal_not_valid",
          "The proposal is not currently a fresh valid proposal.",
        );
      }

      store.dispatch({ type: "agent/requestReview" });
      const next = store.getState();
      return {
        reviewStatus: next.reviewStatus,
        proposalStatus: next.proposalStatus,
        budgetRevision: next.budgetRevision,
        proposalRevision: next.agentProposal!.proposalRevision,
        allocationHash: next.agentProposal!.allocationHash,
      };
    },
  };

  const trace = getWebMcpTrace(store);
  const wrap = <K extends keyof Handlers>(name: K, mode: ToolMode): Handlers[K] =>
    ((input: unknown) => {
      const result = handlers[name](input);
      trace.record(name as ToolName, mode, result);
      return result;
    }) as Handlers[K];

  return {
    get_budget_state: wrap("get_budget_state", "read"),
    list_projects: wrap("list_projects", "read"),
    list_strategy_options: wrap("list_strategy_options", "read"),
    simulate_allocation: wrap("simulate_allocation", "read"),
    propose_allocation: wrap("propose_allocation", "write"),
    explain_tradeoffs: wrap("explain_tradeoffs", "read"),
    request_allocation_review: wrap("request_allocation_review", "write"),
  };
}

export { HYPOTHETICAL_DISCLOSURE };
