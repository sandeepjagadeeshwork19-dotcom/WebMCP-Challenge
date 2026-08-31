/** Defensive runtime parsing for tool inputs (schemas are declared separately). */

import { isProjectId, MAX_PROJECT_COST, PROJECT_IDS } from "../domain/projects";
import type { Allocation, ProjectId } from "../domain/types";
import { toolError, type ToolError } from "./errors";

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: ToolError };

const ok = <T>(value: T): Parsed<T> => ({ ok: true, value });
const fail = (error: ToolError): Parsed<never> => ({ ok: false, error });

export function asObject(
  input: unknown,
  allowedKeys: string[],
): Parsed<Record<string, unknown>> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return fail(toolError("invalid_input", "Input must be a JSON object."));
  }
  const record = input as Record<string, unknown>;
  const unknownKeys = Object.keys(record).filter((k) => !allowedKeys.includes(k));
  if (unknownKeys.length > 0) {
    return fail(
      toolError("invalid_input", `Unsupported field(s): ${unknownKeys.join(", ")}.`),
    );
  }
  return ok(record);
}

export function asInteger(value: unknown, field: string): Parsed<number> {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return fail(toolError("invalid_input", `${field} must be an integer.`));
  }
  return ok(value);
}

export function asBoolean(value: unknown, field: string): Parsed<boolean> {
  if (typeof value !== "boolean") {
    return fail(toolError("invalid_input", `${field} must be a boolean.`));
  }
  return ok(value);
}

export function asBoundedString(
  value: unknown,
  field: string,
  min: number,
  max: number,
): Parsed<string> {
  if (typeof value !== "string") {
    return fail(toolError("invalid_input", `${field} must be a string.`));
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    return fail(
      toolError("invalid_input", `${field} must be ${min}-${max} characters after trimming.`),
    );
  }
  return ok(trimmed);
}

export function parseProjectIdList(value: unknown): Parsed<ProjectId[]> {
  if (!Array.isArray(value)) {
    return fail(toolError("invalid_input", "projectIds must be an array."));
  }
  if (value.length > PROJECT_IDS.length) {
    return fail(toolError("invalid_input", "projectIds accepts at most eight ids."));
  }
  const seen = new Set<ProjectId>();
  for (const entry of value) {
    if (!isProjectId(entry)) {
      return fail(toolError("unknown_project", `"${String(entry)}" is not a known project id.`));
    }
    if (seen.has(entry)) {
      return fail(toolError("duplicate_project", `${entry} appears more than once.`));
    }
    seen.add(entry);
  }
  return ok([...seen]);
}

/**
 * Parse an allocations array. Shape errors (unknown/duplicate id, non-integer or
 * out-of-range amount, too many entries) are transport errors here; deterministic
 * rule violations are left for the validator to report as `valid: false`.
 */
export function parseAllocations(value: unknown): Parsed<Allocation[]> {
  if (!Array.isArray(value)) {
    return fail(toolError("invalid_input", "allocations must be an array."));
  }
  if (value.length > PROJECT_IDS.length) {
    return fail(toolError("invalid_input", "allocations accepts at most eight entries."));
  }
  const seen = new Set<ProjectId>();
  const result: Allocation[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return fail(toolError("invalid_input", "Each allocation must be an object."));
    }
    const record = entry as Record<string, unknown>;
    const extra = Object.keys(record).filter(
      (k) => k !== "projectId" && k !== "amount",
    );
    if (extra.length > 0) {
      return fail(
        toolError("invalid_input", `Allocation has unsupported field(s): ${extra.join(", ")}.`),
      );
    }
    if (!isProjectId(record.projectId)) {
      return fail(
        toolError("unknown_project", `"${String(record.projectId)}" is not a known project id.`),
      );
    }
    if (seen.has(record.projectId)) {
      return fail(toolError("duplicate_project", `${record.projectId} appears more than once.`));
    }
    seen.add(record.projectId);
    if (typeof record.amount !== "number" || !Number.isInteger(record.amount)) {
      return fail(
        toolError("invalid_input", `Amount for ${record.projectId} must be an integer.`),
      );
    }
    if (record.amount <= 0 || record.amount > MAX_PROJECT_COST) {
      return fail(
        toolError(
          "invalid_input",
          `Amount for ${record.projectId} must be between 1 and ${MAX_PROJECT_COST}.`,
        ),
      );
    }
    result.push({ projectId: record.projectId, amount: record.amount });
  }
  return ok(result);
}
