/**
 * Typed actions, grouped by authority.
 *
 * `human/*` actions may only be dispatched by visible UI controls.
 * `agent/*` actions may only be dispatched by WebMCP tool handlers.
 * Actor attribution is derived from the action prefix by the reducer and can
 * never be supplied through action payload or tool input.
 */

import type { Allocation, PriorityKey, PriorityWeight, ProjectId } from "../domain/types";
import type { StrategyId } from "../domain/strategies";

export type HumanAction =
  | { type: "human/setPriority"; key: PriorityKey; weight: PriorityWeight; timestamp?: string }
  | { type: "human/confirmPriorities"; timestamp?: string }
  | { type: "human/setAllocation"; projectId: ProjectId; amount: number; timestamp?: string }
  | { type: "human/removeAllocation"; projectId: ProjectId; timestamp?: string }
  | { type: "human/lockProject"; projectId: ProjectId; timestamp?: string }
  | { type: "human/lockProjectAt"; projectId: ProjectId; amount: number; timestamp?: string }
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

/**
 * Application-owned actions. `app/loadDirectionDraft` places one of the canonical
 * direction plans as a starting draft — used when the resident chooses a
 * direction, and as the WebMCP-absent fallback for "load an example proposal".
 * It is attributed to the application (`system`), never to the agent.
 */
export type SystemAction =
  | {
      type: "app/loadDirectionDraft";
      strategyId: StrategyId;
      timestamp?: string;
    }
  | {
      /**
       * Rebuild the active draft around the resident's locked works using the
       * shared deterministic engine. Used as the WebMCP-absent fallback so a
       * protect action never dead-ends at "draft stale" with no way forward.
       */
      type: "app/redraftAroundLocks";
      timestamp?: string;
    };

export type AppAction = HumanAction | AgentAction | SystemAction;

export function actorForAction(action: AppAction): "human" | "agent" | "system" {
  if (action.type.startsWith("agent/")) return "agent";
  if (action.type.startsWith("app/")) return "system";
  return "human";
}
