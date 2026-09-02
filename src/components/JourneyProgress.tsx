import type { Stage } from "../state/selectors";

const STEPS = [
  { label: "Set priorities", summary: "Choose your priorities." },
  { label: "Compare directions", summary: "See three valid starting points." },
  { label: "Build a draft", summary: "The assistant models a plan around your choices." },
  { label: "Resident review", summary: "Only you can accept the plan." },
  { label: "Your record", summary: "Adopt a local demonstration record." },
] as const;

function stepIndex(stage: Stage): number {
  switch (stage) {
    case "priorities": return 0;
    case "compare": return 1;
    case "draft":
    case "invalid":
    case "replanning":
    case "rejected": return 2;
    case "review": return 3;
    case "adopted": return 4;
  }
}

/** A compact, non-clickable map of the real state-machine journey. */
export function JourneyProgress({ stage }: { stage: Stage }) {
  const current = stepIndex(stage);
  const active = STEPS[current];

  return (
    <nav className="journey" aria-label="Resident decision journey">
      <div className="journey__intro">
        <p className="journey__kicker">RESIDENT JOURNEY</p>
        <p className="journey__now">
          <span>Step {current + 1} of {STEPS.length}</span>
          <b>{active.label}</b>
          <small>{active.summary}</small>
        </p>
      </div>
      <ol className="journey__steps">
        {STEPS.map((step, index) => {
          const state = index < current ? "complete" : index === current ? "current" : "upcoming";
          return (
            <li key={step.label} data-state={state} aria-current={index === current ? "step" : undefined}>
              <span className="journey__number">{index + 1}</span>
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
