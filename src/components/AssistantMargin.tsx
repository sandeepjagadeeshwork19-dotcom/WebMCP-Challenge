import { getProject } from "../domain/projects";
import { STRATEGY_PRESETS, describeStrategy } from "../domain/strategies";
import { committedTotal } from "../domain/validation";
import { formatMoney } from "../format";
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
        THE ASSISTANT&rsquo;S MARGIN <Icon name="pen" size={13} />
      </p>
      <hr className="margin__rule" />
      <Body stage={stage} state={state} />
      <WebMcpActivity />
      <WithheldTools />
    </aside>
  );
}

function Body({ stage, state }: { stage: string; state: ReturnType<typeof useAppState> }) {
  switch (stage) {
    case "priorities":
      return (
        <>
          <p className="lede">Tell me what the ward should weigh, and I&rsquo;ll model the options.</p>
          <p className="muted">
            Through WebMCP I can read, simulate, propose and request review. Choosing priorities,
            protecting work and adopting have no WebMCP tool.
          </p>
        </>
      );

    case "compare": {
      return (
        <>
          <p className="lede">
            Three directions that hold up against your priorities. Each gives up something different:
          </p>
          {STRATEGY_PRESETS.map((preset) => {
            const v = describeStrategy(preset, state.residentPriorities);
            return (
              <p key={v.id} className="muted">
                <b>{v.label}.</b> {v.mainSacrifice}
              </p>
            );
          })}
          <div className="margin__note">
            <span className="kicker">The score won&rsquo;t decide this</span>
            <p className="muted">
              Protect any work first and I&rsquo;ll build the rest around it.
            </p>
          </div>
        </>
      );
    }

    case "draft":
      return (
        <>
          <p className="lede">
            Draft ready &mdash; keeps your protected work, clears every rule.
          </p>
          <p className="muted">
            Take it into review, or send it back and I&rsquo;ll redraft.
          </p>
        </>
      );

    case "invalid":
      return (
        <>
          <p className="lede">The engine rejected that draft.</p>
          <p className="muted">
            {state.constraintValidation?.issues.map((x) => x.message).join(" ")}
          </p>
          <p className="muted">Ask me for a plan that clears every rule.</p>
        </>
      );

    case "replanning": {
      const before = state.previousProposal;
      const after = state.agentProposal;
      return (
        <>
          <p className="lede">I&rsquo;m redrafting around your protected work.</p>
          <hr className="margin__rule" />
          <span className="kicker">The assistant&rsquo;s working</span>
          {before && (
            <div className="margin__ba">
              <b>BEFORE</b>{" "}
              <span className="meta">
                rev {before.proposalRevision} · {formatMoney(committedTotal(before.allocations))}
              </span>
              <p>
                {before.allocations
                  .filter((a) => a.amount > 0)
                  .map((a) => getProject(a.projectId).shortName)
                  .join(" · ")}
              </p>
            </div>
          )}
          {after && (
            <div className="margin__ba margin__ba--after">
              <b>AFTER</b>{" "}
              <span className="meta">
                rev {after.proposalRevision} · {formatMoney(committedTotal(after.allocations))}
              </span>
              <p>
                {after.allocations
                  .filter((a) => a.amount > 0)
                  .map((a) => getProject(a.projectId).shortName)
                  .join(" · ")}
              </p>
            </div>
          )}
        </>
      );
    }

    case "review":
      return (
        <>
          <p className="lede">I&rsquo;ve stepped back. This step is yours.</p>
          <p className="muted">
            Within WebMCP, my handoff ends here. Accepting and adopting have no registered tool;
            the visible controls are the resident&rsquo;s.
          </p>
          <hr className="margin__rule" />
          <p className="waiting">&mdash; waiting for the resident &mdash;</p>
        </>
      );

    case "adopted":
      return (
        <>
          <p className="lede">
            Recorded. I did the arithmetic; the resolution is the resident&rsquo;s.
          </p>
          <p className="muted">
            Seven tools on this page &mdash; read, list, compare, simulate, propose, explain, request
            review. None of them adopts.
          </p>
        </>
      );

    default:
      return null;
  }
}
