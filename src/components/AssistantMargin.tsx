import { useAppState } from "../state/store";
import { selectStage } from "../state/selectors";
import { Icon } from "./Icon";
import { WebMcpActivity } from "./WebMcpActivity";
import { WithheldTools } from "./WithheldTools";

export function AssistantMargin() {
  const state = useAppState();
  const stage = selectStage(state);

  return (
    <aside className="margin" aria-label="The assistant's margin">
      <p className="margin__kicker">
        LIVE SESSION <Icon name="pen" size={13} />
      </p>
      <Body stage={stage} protectedCount={state.lockedAllocations.length} />
      <WebMcpActivity />
      <WithheldTools />
    </aside>
  );
}

function Body({ stage, protectedCount }: { stage: string; protectedCount: number }) {
  switch (stage) {
    case "priorities":
      return (
        <>
          <p className="lede">Tell me what matters to you and I&rsquo;ll draft some plans.</p>
          <p className="muted">
            I can read the budget, model options, and draft a plan. Setting priorities,
            protecting a work, and adopting are yours. There&rsquo;s no button here for me to press
            and no function for me to call.
          </p>
        </>
      );

    case "compare":
      return (
        <p className="lede">
          Each plan trades off something different. The cards show what. Protect a work first
          if you want me to build around it.
        </p>
      );

    case "draft":
      return (
        <p className="lede">
          {protectedCount > 0
            ? "Done. Your protected works are in and everything’s valid."
            : "Done. This draft is valid and ready for your review."}
        </p>
      );

    case "invalid":
      return (
        <p className="muted">
          That plan broke a rule. Ask me to fix it and I&rsquo;ll redraft.
        </p>
      );

    case "replanning":
      return (
        <p className="lede">
          Working on it: keeping your protected works, rebalancing the rest.
        </p>
      );

    case "review":
      return (
        <>
          <p className="lede">This part&rsquo;s yours. I&rsquo;ll wait.</p>
          <hr className="margin__rule" />
          <p className="waiting">Waiting for you</p>
        </>
      );

    case "adopted":
      return (
        <p className="lede">
          Recorded. I did the sums; the decision was yours.
        </p>
      );

    default:
      return null;
  }
}
