/**
 * Typed actions, grouped by authority.
 *
 * `human/*` actions may only be dispatched by visible UI controls.
 * `agent/*` actions may only be dispatched by WebMCP tool handlers.
 * Actor attribution is derived from the action prefix by the reducer and can
 * never be supplied through action payload or tool input.
 */

import type { Allocation, PriorityKey, PriorityWeight, ProjectId } from "../domain/types";

export type HumanAction =
  | { type: "human/setPriority"; key: PriorityKey; weight: PriorityWeight; timestamp?: string }
  | { type: "human/setAllocation"; projectId: ProjectId; amount: number; timestamp?: string }
  | { type: "human/removeAllocation"; projectId: ProjectId; timestamp?: string }
  | { type: "human/lockProject"; projectId: ProjectId; timestamp?: string }
  | { type: "human/unlockProject"; projectId: ProjectId; timestamp?: string }
  | { type: "human/setDisclosureAck"; acknowledged: boolean; timestamp?: string }
  | { type: "human/openReview"; timestamp?: string }
  | { type: "human/rejectProposal"; timestamp?: string }
  | { type: "human/acceptProposal"; timestamp?: string }
  | { type: "human/finalise"; timestamp?: string }
  | { type: "human/reset"; timestamp?: string };

export type AgentAction =
  | {
      type: "agent/proposeAllocation";
      allocations: Allocation[];
      rationale: string;
      timestamp?: string;
    }
  | { type: "agent/requestReview"; timestamp?: string };

export type AppAction = HumanAction | AgentAction;

export function actorForAction(action: AppAction): "human" | "agent" {
  return action.type.startsWith("agent/") ? "agent" : "human";
}
