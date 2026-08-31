/** Presentation helpers. Currency is shown to the nearest ₹10,000. */

import { inr } from "./domain/money";
import type { PriorityKey } from "./domain/types";

export function formatMoney(amount: number): string {
  const rounded = Math.round(amount / 10_000) * 10_000;
  return inr(rounded);
}

export function formatSignedMoney(amount: number): string {
  if (amount === 0) return "₹0";
  const rounded = Math.round(Math.abs(amount) / 10_000) * 10_000;
  return `${amount > 0 ? "+" : "-"}${inr(rounded)}`;
}

export const PRIORITY_LABELS: Record<PriorityKey, string> = {
  safety: "Safety",
  accessibility: "Accessibility",
  climate: "Climate",
  communitySupport: "Community support",
};
