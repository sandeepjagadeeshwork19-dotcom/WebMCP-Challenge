import { useAppState } from "../state/store";
import { selectStage, type Stage } from "../state/selectors";

const STEPS: { key: string; label: (s: Stage) => string; done: Stage[]; now: Stage[] }[] = [
  { key: "pri", label: () => "Set priorities", done: ["compare", "draft", "replanning", "invalid", "review", "adopted"], now: ["priorities"] },
  { key: "cmp", label: () => "Compare plans", done: ["draft", "replanning", "invalid", "review", "adopted"], now: ["compare"] },
  {
    key: "drf",
    label: (s) => (s === "replanning" ? "Rebuild the plan" : s === "invalid" ? "Fix the plan" : "Review the draft"),
    done: ["review", "adopted"],
    now: ["draft", "replanning", "invalid"],
  },
  { key: "rev", label: () => "Confirm", done: ["adopted"], now: ["review"] },
  { key: "adp", label: () => "Adopted", done: [], now: ["adopted"] },
];

export function StateLine() {
  const stage = selectStage(useAppState());

  return (
    <nav className="stateline" aria-label="Where you are">
      <span className="stateline__label">Where you are</span>
      {STEPS.map((step, i) => {
        const cls = step.now.includes(stage)
          ? "is-now"
          : step.done.includes(stage)
            ? "is-done"
            : "is-next";
        return (
          <span key={step.key} style={{ display: "contents" }}>
            <span className={`stateline__step ${cls}`} aria-current={cls === "is-now" ? "step" : undefined}>
              {step.label(stage)}
            </span>
            {i < STEPS.length - 1 && (
              <span className="stateline__sep" aria-hidden="true">
                &rarr;
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
