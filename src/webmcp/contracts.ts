/**
 * The seven WebMCP tool contracts. Exactly these tools are registered — there is
 * no tool for setting priorities, locking, manual editing, acceptance,
 * rejection, finalisation, or reset. That omission is the human/agent boundary:
 * a withheld capability is a function that was never put on `document.modelContext`.
 */

import { PROJECT_IDS, MAX_PROJECT_COST } from "../domain/projects";
import { isToolError } from "./errors";
import type { Handlers } from "./handlers";
import type { WebMcpToolDefinition, WebMcpToolResult } from "./types";

/**
 * Wrap a handler's plain return value in the MCP result shape: a human-readable
 * `content` block plus the machine-readable `structuredContent`. Structured
 * tool errors come back with `isError: true` and their message as the text.
 */
function present(result: unknown): WebMcpToolResult {
  if (isToolError(result)) {
    return {
      content: [{ type: "text", text: result.error.message }],
      structuredContent: result,
      isError: true,
    };
  }
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    structuredContent: result,
  };
}

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
        "Read the canonical on-page state: the ₹10,00,000 fund, resident priorities, protected works, the resident's manual allocation, the active proposal, revision numbers, whose turn it is, and the list of actions no tool can perform. Call this first; pass the returned budgetRevision to simulate_allocation and propose_allocation. Changes nothing.",
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          includeRecentActivity: { type: "boolean", default: false },
        },
      },
      execute: (input) => present(handlers.get_budget_state(input)),
    },
    {
      name: "list_projects",
      title: "List projects",
      description:
        "List the eight candidate works with costs, benefit ratings, the numeric scoring model, funding rules, dependencies and incompatibilities. Changes nothing.",
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
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
      execute: (input) => present(handlers.list_projects(input)),
    },
    {
      name: "list_strategy_options",
      title: "List strategy options",
      description:
        "Return three deterministically valid budget directions (safety & access, climate resilience, broad coverage), each scored against the resident's current priorities and its own lens. These are comparison options; this tool changes nothing and does not load a draft.",
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      execute: (input) => present(handlers.list_strategy_options(input)),
    },
    {
      name: "simulate_allocation",
      title: "Simulate allocation",
      description:
        "Run the shared validator on a hypothetical allocation. Returns every constraint issue at once, each with a machine-readable fix, plus the benefit summary at the resident's priorities. Changes nothing.",
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["budgetRevision", "allocations"],
        properties: {
          budgetRevision: { type: "integer", minimum: 0 },
          allocations: allocationsArraySchema,
        },
      },
      execute: (input) => present(handlers.simulate_allocation(input)),
    },
    {
      name: "propose_allocation",
      title: "Propose allocation",
      description:
        "Record a draft allocation with your rationale as a visible, agent-attributed proposal for the given budgetRevision. Runs the shared validator; an invalid allocation is still stored as a visible rejected draft. This is never the decision — any resident edit stales it and you must re-read and redraft. There is no tool to accept, adopt, or finalise.",
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
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
      execute: (input) => present(handlers.propose_allocation(input)),
    },
    {
      name: "explain_tradeoffs",
      title: "Explain trade-offs",
      description:
        "Compare the active proposal with the resident's current allocation or the previous proposal: added and removed works, funding changes, per-priority benefit deltas and opportunity costs. Directional and illustrative only; changes nothing.",
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
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
      execute: (input) => present(handlers.explain_tradeoffs(input)),
    },
    {
      name: "request_allocation_review",
      title: "Request allocation review",
      description:
        "Open a visible resident review of the current fresh, valid proposal and step back. This does not accept, adopt or finalise it — only the resident can, and no tool exposes those steps.",
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["budgetRevision", "proposalRevision"],
        properties: {
          budgetRevision: { type: "integer", minimum: 0 },
          proposalRevision: { type: "integer", minimum: 1 },
        },
      },
      execute: (input) => present(handlers.request_allocation_review(input)),
    },
  ];
}
