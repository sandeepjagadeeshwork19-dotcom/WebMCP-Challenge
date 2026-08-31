/** Presentation helpers. Currency is shown to the nearest $10,000. */

import type { PriorityKey, PriorityWeight } from "./domain/types";

export function formatMoney(amount: number): string {
  const rounded = Math.round(amount / 10_000) * 10_000;
  const sign = rounded < 0 ? "-" : "";
  return `${sign}$${Math.abs(rounded).toLocaleString("en-US")}`;
}

export function formatSignedMoney(amount: number): string {
  if (amount === 0) return "$0";
  return `${amount > 0 ? "+" : "-"}${formatMoney(Math.abs(amount))}`;
}

export const PRIORITY_LABELS: Record<PriorityKey, string> = {
  safety: "Safety",
  accessibility: "Accessibility",
  climate: "Climate",
  communitySupport: "Community support",
};

export const PRIORITY_DESCRIPTIONS: Record<PriorityKey, string> = {
  safety: "How much weight to give reduced injury risk and safer streets.",
  accessibility: "How much weight to give step-free access and inclusive design.",
  climate: "How much weight to give heat relief, drainage and lower emissions.",
  communitySupport:
    "How much weight to give the fictional demonstration community-support indicator.",
};

export const WEIGHT_LABELS: Record<PriorityWeight, string> = {
  0: "Not prioritised",
  1: "Consider",
  2: "Important",
  3: "Most important",
};

export function weightLabel(weight: number): string {
  return WEIGHT_LABELS[weight as PriorityWeight] ?? String(weight);
}
