/**
 * Deterministic, order-independent hash of an allocation set.
 *
 * Used to bind a proposal, its validation result, review and finalisation to a
 * specific set of {projectId, amount} pairs. Not cryptographic; it only needs to
 * be stable and collision-resistant enough to detect an allocation edit.
 */

import type { Allocation } from "./types";

export function canonicaliseAllocations(allocations: Allocation[]): Allocation[] {
  return [...allocations]
    .map((a) => ({ projectId: a.projectId, amount: a.amount }))
    .sort((a, b) => a.projectId.localeCompare(b.projectId));
}

/** FNV-1a 32-bit, rendered as an 8-char hex string with a short prefix. */
export function allocationHash(allocations: Allocation[]): string {
  const canonical = canonicaliseAllocations(allocations);
  const serialised = JSON.stringify(canonical);
  let hash = 0x811c9dc5;
  for (let i = 0; i < serialised.length; i += 1) {
    hash ^= serialised.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `alloc-${hex}`;
}
