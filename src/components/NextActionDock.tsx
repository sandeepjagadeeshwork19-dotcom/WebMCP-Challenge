import { useEffect, useRef, useState } from "react";
import { getProject } from "../domain/projects";
import { selectCanFinalise, selectStage } from "../state/selectors";
import { useAppState, useDispatch } from "../state/store";
import { Icon } from "./Icon";

/**
 * One honest next step per decision state. The resident's actions are vermilion;
 * the assistant's are slate. There is never more than one primary button.
 */
export function NextActionDock({ webmcpAvailable }: { webmcpAvailable: boolean }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const stage = selectStage(state);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const protectedNames = state.lockedAllocations
    .map((lock) => getProject(lock.projectId).shortName)
    .join(", ");
  const changedSinceRejection =
    (state.agentProposal?.basedOnBudgetRevision ?? state.budgetRevision) < state.budgetRevision;

  const assistantPrompt =
    stage === "review" && state.proposalStatus !== "rejected"
      ? `Open resident review for the current fresh plan at budget revision ${state.budgetRevision}, plan revision ${state.proposalRevision}. Do not accept or adopt it.`
      : stage === "replanning" || state.proposalStatus === "rejected"
        ? `Re-read the budget at revision ${state.budgetRevision}. Keep every protected work${protectedNames ? ` (${protectedNames})` : ""}, simulate a valid replacement, propose it, and explain what changed from plan ${state.proposalRevision}.`
        : stage === "invalid"
          ? `Read the validation issues for plan ${state.proposalRevision}. Simulate a valid corrected plan, propose it, and explain every change.`
          : "Read the budget, compare the valid plans, simulate the strongest one for my priorities, and propose it with the trade-offs.";

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(assistantPrompt);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };
  const copiedLabel =
    copyStatus === "copied"
      ? "Copied — paste into your browser assistant"
      : copyStatus === "failed"
        ? "Copy failed — select the request below"
        : null;
  const copyButtonLabel = copyStatus === "copied" ? "Request copied" : "Get an assistant request";

  if (stage === "adopted") return null;

  if (stage === "priorities") {
    const anyWeighted = Object.values(state.residentPriorities).some((weight) => weight > 0);
    return (
      <Dock actor="resident" focusKey="priorities" title="Choose your priorities, then compare">
        <p>
          Weight each priority 0–3 on the left. Then three plans are scored against your choices and
          shown here.
        </p>
        <button
          className="btn btn--primary"
          type="button"
          disabled={!anyWeighted}
          onClick={() => dispatch({ type: "human/confirmPriorities" })}
        >
          Compare plans <Icon name="arrow" size={14} />
        </button>
        {!anyWeighted && <p className="action-dock__status">Set at least one priority above.</p>}
      </Dock>
    );
  }

  if (stage === "compare") {
    return (
      <Dock
        actor="resident"
        focusKey="compare"
        title="Choose a starting plan"
      >
        <p>
          {webmcpAvailable
            ? "Open a plan below, or optionally ask the assistant to model one. Its calls appear in the trace."
            : "Opening a plan starts a draft — it is not the final decision."}
        </p>
        {webmcpAvailable && (
          <button className="btn btn--agent" type="button" onClick={copyPrompt}>
            <Icon name="copy" size={14} /> {copyButtonLabel}
          </button>
        )}
        <CopyStatus status={copiedLabel} prompt={copyStatus === "failed" ? assistantPrompt : null} />
      </Dock>
    );
  }

  if (stage === "draft") {
    return (
      <Dock
        actor="resident"
        focusKey={`draft-${state.proposalRevision}`}
        title="Send this plan to review"
      >
        <p>It opens in resident review. It will not be accepted or adopted.</p>
        <button
          className="btn btn--primary"
          type="button"
          onClick={() => dispatch({ type: "human/openReview" })}
        >
          Send to review <Icon name="arrow" size={14} />
        </button>
        {webmcpAvailable && (
          <button
            className="btn btn--quiet"
            type="button"
            onClick={copyPrompt}
          >
            <Icon name="copy" size={14} /> {copyButtonLabel}
          </button>
        )}
        <CopyStatus status={copiedLabel} prompt={copyStatus === "failed" ? assistantPrompt : null} />
      </Dock>
    );
  }

  if (stage === "invalid" || stage === "replanning") {
    const invalid = stage === "invalid";
    return (
      <Dock
        actor="resident"
        focusKey={`${stage}-${state.proposalRevision}`}
        title={invalid ? "Fix the funding rules" : `Rebuild around ${protectedNames || "your protected work"}`}
      >
        <p>The next plan will be valid and keep every protected work.</p>
        <button
          className="btn btn--primary"
          type="button"
          onClick={() => dispatch({ type: "app/redraftAroundLocks" })}
        >
          Rebuild the plan <Icon name="arrow" size={14} />
        </button>
        {webmcpAvailable && (
          <button
            className="btn btn--quiet"
            type="button"
            onClick={copyPrompt}
          >
            <Icon name="copy" size={14} /> {copyButtonLabel}
          </button>
        )}
        <CopyStatus status={copiedLabel} prompt={copyStatus === "failed" ? assistantPrompt : null} />
      </Dock>
    );
  }

  if (state.proposalStatus === "rejected") {
    return (
      <Dock
        actor="resident"
        focusKey="rejected"
        title="Change something, then rebuild"
      >
        <p>Change a priority or protection above, then build another valid draft.</p>
        <button
          className="btn btn--primary"
          type="button"
          disabled={!changedSinceRejection}
          onClick={() => dispatch({ type: "app/redraftAroundLocks" })}
        >
          Rebuild after my change
        </button>
        {webmcpAvailable && (
          <button
            className="btn btn--quiet"
            type="button"
            onClick={copyPrompt}
          >
            <Icon name="copy" size={14} /> {copyButtonLabel}
          </button>
        )}
        <CopyStatus status={copiedLabel} prompt={copyStatus === "failed" ? assistantPrompt : null} />
      </Dock>
    );
  }

  if (state.proposalStatus !== "accepted") {
    return (
      <Dock actor="resident" focusKey="under-review" title="Decide on this plan">
        <p>Accepting reveals the acknowledgement. Sending it back keeps a note in the record.</p>
        <button
          className="btn btn--primary"
          type="button"
          onClick={() => dispatch({ type: "human/acceptProposal" })}
        >
          Accept this plan <Icon name="arrow" size={14} />
        </button>
        <button
          className="btn btn--quiet"
          type="button"
          onClick={() => dispatch({ type: "human/rejectProposal" })}
        >
          Go back and change it
        </button>
      </Dock>
    );
  }

  const canFinalise = selectCanFinalise(state);
  return (
    <Dock
      actor="resident"
      focusKey={`accepted-${state.disclosureAcknowledged}`}
      title="Adopt Resolution WD-12"
    >
      <label className="action-dock__ack">
        <input
          type="checkbox"
          checked={state.disclosureAcknowledged}
          onChange={(e) => dispatch({ type: "human/setDisclosureAck", acknowledged: e.target.checked })}
        />{" "}
        I understand this is a demonstration and allocates no real money.
      </label>
      <p>
        {canFinalise
          ? "Ready. No WebMCP tool can do this — only you."
          : "Tick the box to enable adoption."}
      </p>
      <button
        className="btn btn--primary"
        type="button"
        disabled={!canFinalise}
        onClick={() => dispatch({ type: "human/finalise" })}
      >
        Adopt resolution WD-12
      </button>
    </Dock>
  );
}

function Dock({
  actor,
  focusKey,
  title,
  children,
}: {
  actor: "resident" | "assistant";
  focusKey: string;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const seen = useRef<string | null>(null);
  useEffect(() => {
    if (seen.current !== null && seen.current !== focusKey) {
      ref.current?.focus({ preventScroll: true });
    }
    seen.current = focusKey;
  }, [focusKey]);
  return (
    <section ref={ref} tabIndex={-1} className="action-dock" data-actor={actor} aria-label="Next step">
      <div>
        <span>{actor === "assistant" ? "ASSISTANT'S MOVE" : "YOUR MOVE"}</span>
        <h2>{title}</h2>
      </div>
      <div className="action-dock__body">{children}</div>
    </section>
  );
}

function CopyStatus({ status, prompt }: { status: string | null; prompt: string | null }) {
  return (
    <>
      {status && (
        <p className="action-dock__status" role="status">
          {status}
        </p>
      )}
      {prompt && (
        <textarea
          className="action-dock__prompt"
          readOnly
          value={prompt}
          aria-label="Assistant request"
        />
      )}
    </>
  );
}
