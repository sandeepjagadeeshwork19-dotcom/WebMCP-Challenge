/**
 * The six WebMCP tool contracts. Exactly these tools are registered — there is
 * no tool for setting priorities, locking, manual editing, acceptance,
 * rejection, finalisation, or reset.
 */

import { PROJECT_IDS, MAX_PROJECT_COST } from "../domain/projects";
import type { Handlers } from "./handlers";
import type { WebMcpToolDefinition } from "./types";

const projectIdSchema = {
  type: "string",
  enum: [...PROJECT_IDS],
} as const;

const allocationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["projectId", "amount"],
  properties: {
    projectId: projectIdSchema,
    amount: { type: "integer", minimum: 1, maximum: MAX_PROJECT_COST },
  },
} as const;

const allocationsArraySchema = {
  type: "array",
  minItems: 0,
  maxItems: PROJECT_IDS.length,
  items: allocationSchema,
} as const;

export const TOOL_NAMES = [
  "get_budget_state",
  "list_projects",
  "list_strategy_options",
  "simulate_allocation",
  "propose_allocation",
  "explain_tradeoffs",
  "request_allocation_review",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export function createToolContracts(handlers: Handlers): WebMcpToolDefinition[] {
  return [
    {
      name: "get_budget_state",
      title: "Get budget state",
      description:
        "Read the current hypothetical budget, resident priorities, locks, manual allocation, proposal summary and revision numbers.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          includeRecentActivity: { type: "boolean", default: false },
        },
      },
      execute: (input) => handlers.get_budget_state(input),
    },
    {
      name: "list_projects",
      title: "List projects",
      description:
        "List the eight hypothetical projects with costs, benefits, funding rules, dependencies and incompatibilities.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          projectIds: {
            type: "array",
            maxItems: PROJECT_IDS.length,
            uniqueItems: true,
            items: projectIdSchema,
          },
        },
      },
      execute: (input) => handlers.list_projects(input),
    },
    {
      name: "list_strategy_options",
      title: "List strategy options",
      description:
        "List three deterministically valid budget directions (safety & access, climate resilience, broad coverage), each scored against the resident's current priorities.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      execute: (input) => handlers.list_strategy_options(input),
    },
    {
      name: "simulate_allocation",
      title: "Simulate allocation",
      description:
        "Validate a hypothetical allocation against the current revision without changing application state.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["budgetRevision", "allocations"],
        properties: {
          budgetRevision: { type: "integer", minimum: 0 },
          allocations: allocationsArraySchema,
        },
      },
      execute: (input) => handlers.simulate_allocation(input),
    },
    {
      name: "propose_allocation",
      title: "Propose allocation",
      description:
        "Store an agent-attributed allocation proposal for the current budget revision after deterministic validation.",
      annotations: { readOnlyHint: false },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["budgetRevision", "allocations", "rationale"],
        properties: {
          budgetRevision: { type: "integer", minimum: 0 },
          allocations: allocationsArraySchema,
          rationale: { type: "string", minLength: 1, maxLength: 600 },
        },
      },
      execute: (input) => handlers.propose_allocation(input),
    },
    {
      name: "explain_tradeoffs",
      title: "Explain trade-offs",
      description:
        "Compare the active proposal with the resident's current allocation or the previous proposal using canonical project facts.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["proposalRevision", "compareWith"],
        properties: {
          proposalRevision: { type: "integer", minimum: 1 },
          compareWith: {
            type: "string",
            enum: ["manual_allocation", "previous_proposal"],
          },
        },
      },
      execute: (input) => handlers.explain_tradeoffs(input),
    },
    {
      name: "request_allocation_review",
      title: "Request allocation review",
      description:
        "Open visible resident review for the current fresh, valid proposal; this does not accept or finalise it.",
      annotations: { readOnlyHint: false },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["budgetRevision", "proposalRevision"],
        properties: {
          budgetRevision: { type: "integer", minimum: 0 },
          proposalRevision: { type: "integer", minimum: 1 },
        },
      },
      execute: (input) => handlers.request_allocation_review(input),
    },
  ];
}
