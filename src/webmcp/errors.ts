/** Structured tool errors. Returned as JSON values, never thrown across the API. */

export type ToolErrorCode =
  | "invalid_input"
  | "state_unavailable"
  | "stale_budget_revision"
  | "unknown_project"
  | "duplicate_project"
  | "no_active_proposal"
  | "proposal_revision_mismatch"
  | "proposal_not_valid"
  | "stale_proposal"
  | "review_already_open"
  | "comparison_unavailable"
  | "finalised_state"
  | "resident_review_in_progress"
  | "priorities_not_confirmed"
  | "empty_allocation";

export interface ToolError {
  error: {
    code: ToolErrorCode;
    message: string;
  };
}

export function toolError(code: ToolErrorCode, message: string): ToolError {
  return { error: { code, message } };
}

export function isToolError(value: unknown): value is ToolError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ToolError).error?.code === "string"
  );
}
