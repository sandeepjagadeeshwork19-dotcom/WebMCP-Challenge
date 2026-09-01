import { useEffect, useRef, useState } from "react";
import { getProject } from "../domain/projects";
import { selectCanFinalise, selectStage } from "../state/selectors";
import { useAppState, useDispatch } from "../state/store";
import { Icon } from "./Icon";

export function NextActionDock({ webmcpAvailable }: { webmcpAvailable: boolean }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const stage = selectStage(state);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const protectedNames = state.lockedAllocations.map((lock) => getProject(lock.projectId).shortName).join(", ");
  const changedSinceRejection = (state.agentProposal?.basedOnBudgetRevision ?? state.budgetRevision) < state.budgetRevision;

  const assistantPrompt =
    stage === "review" && state.proposalStatus !== "rejected"
      ? `Request resident review for the current fresh proposal at budget revision ${state.budgetRevision} and proposal revision ${state.proposalRevision}. Do not accept or adopt it.`
      : stage === "replanning" || state.proposalStatus === "rejected"
        ? `Re-read the current budget at revision ${state.budgetRevision}. Preserve every protected work${protectedNames ? ` (${protectedNames})` : ""}, simulate a valid replacement, propose it, and explain what changed from proposal ${state.proposalRevision}.`
        : stage === "invalid"
          ? `Read the validation failures for proposal ${state.proposalRevision}. Simulate a valid corrected allocation, propose it, and explain every change.`
          : "Read this budget, compare the valid directions, simulate the strongest allocation for my priorities, and propose it with the trade-offs.";

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(assistantPrompt);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };
  const copiedLabel = copyStatus === "copied" ? "Copied — paste into your browser assistant" : copyStatus === "failed" ? "Copy failed — select the request below" : null;

  if (stage === "adopted") return null;

  if (stage === "priorities") {
    return <Dock actor="resident" focusKey="priorities" eyebrow="YOUR NEXT MOVE" title="Set what matters, then compare">
      <p>0 = not weighted · 1 = consider · 2 = important · 3 = highest priority. Nothing is adopted.</p>
      <button className="btn btn--primary" type="button" onClick={() => dispatch({ type: "human/confirmPriorities" })}>Compare plans <Icon name="arrow" size={14} /></button>
    </Dock>;
  }

  if (stage === "compare") {
    return <Dock actor={webmcpAvailable ? "assistant" : "resident"} focusKey="compare" eyebrow={webmcpAvailable ? "ASSISTANT OPTION" : "CHOOSE A STARTING POINT"} title={webmcpAvailable ? "Ask for a tailored proposal" : "Open a ready-made example below"}>
      <p>{webmcpAvailable ? "After you paste and send this request, real WebMCP calls will appear in the evidence strip." : "Each example opens a draft; it is not the final decision."}</p>
      {webmcpAvailable && <button className="btn btn--agent" type="button" onClick={copyPrompt}><Icon name="copy" size={14} /> {copyStatus === "copied" ? "Request copied" : "Copy planning request"}</button>}
      <CopyStatus status={copiedLabel} prompt={copyStatus === "failed" ? assistantPrompt : null} />
    </Dock>;
  }

  if (stage === "draft") {
    return <Dock actor={webmcpAvailable ? "assistant" : "resident"} focusKey={`draft-${state.proposalRevision}`} eyebrow={webmcpAvailable ? "HAND OFF TO THE RESIDENT" : "YOUR NEXT MOVE"} title="Open this exact proposal for review">
      <p>Proposal {state.proposalRevision} will open in resident review. It will not be accepted or adopted.</p>
      {webmcpAvailable ? <button className="btn btn--agent" type="button" onClick={copyPrompt}><Icon name="copy" size={14} /> {copyStatus === "copied" ? "Handoff request copied" : "Copy assistant handoff request"}</button> : <button className="btn btn--primary" type="button" onClick={() => dispatch({ type: "human/openReview" })}>Open resident review <Icon name="arrow" size={14} /></button>}
      {webmcpAvailable && <button className="btn btn--quiet" type="button" onClick={() => dispatch({ type: "human/openReview" })}>Open review locally instead</button>}
      <CopyStatus status={copiedLabel} prompt={copyStatus === "failed" ? assistantPrompt : null} />
    </Dock>;
  }

  if (stage === "invalid" || stage === "replanning") {
    const invalid = stage === "invalid";
    return <Dock actor={webmcpAvailable ? "assistant" : "resident"} focusKey={`${stage}-${state.proposalRevision}`} eyebrow={webmcpAvailable ? "ASSISTANT’S NEXT MOVE" : "CONTINUE LOCALLY"} title={invalid ? "Correct the funding rules" : `Replan around ${protectedNames || "your protection"}`}>
      <p>After the next plan runs, expect a fresh validated proposal that preserves every protected work.</p>
      {webmcpAvailable ? <button className="btn btn--agent" type="button" onClick={copyPrompt}><Icon name="copy" size={14} /> {copyStatus === "copied" ? "Request copied" : invalid ? "Copy fix request" : "Copy redraft request"}</button> : <button className="btn btn--primary" type="button" onClick={() => dispatch({ type: "app/redraftAroundLocks" })}>Rebuild locally <Icon name="arrow" size={14} /></button>}
      {webmcpAvailable && <button className="btn btn--quiet" type="button" onClick={() => dispatch({ type: "app/redraftAroundLocks" })}>Continue locally without the assistant</button>}
      <CopyStatus status={copiedLabel} prompt={copyStatus === "failed" ? assistantPrompt : null} />
    </Dock>;
  }

  if (state.proposalStatus === "rejected") {
    return <Dock actor={webmcpAvailable ? "assistant" : "resident"} focusKey="rejected" eyebrow="CHANGES REQUESTED" title={webmcpAvailable ? "Create a revised proposal" : "Change a priority or protection first"}>
      <p>The rejection remains in the activity record. Change a priority/protection above, or tell the assistant what must change.</p>
      {webmcpAvailable ? <button className="btn btn--agent" type="button" onClick={copyPrompt}><Icon name="copy" size={14} /> {copyStatus === "copied" ? "Request copied" : "Copy redraft request"}</button> : <button className="btn btn--primary" type="button" disabled={!changedSinceRejection} onClick={() => dispatch({ type: "app/redraftAroundLocks" })}>Rebuild after my change</button>}
      {webmcpAvailable && <button className="btn btn--quiet" type="button" disabled={!changedSinceRejection} onClick={() => dispatch({ type: "app/redraftAroundLocks" })}>Rebuild locally after changing a priority or protection</button>}
      <CopyStatus status={copiedLabel} prompt={copyStatus === "failed" ? assistantPrompt : null} />
    </Dock>;
  }

  if (state.proposalStatus !== "accepted") {
    return <Dock actor="resident" focusKey="under-review" eyebrow="YOUR REVIEW" title="Decide on this proposal">
      <p>Accepting reveals the adoption acknowledgement. Requesting changes keeps the rejection in the activity record.</p>
      <button className="btn btn--primary" type="button" onClick={() => dispatch({ type: "human/acceptProposal" })}>Accept this proposal <Icon name="arrow" size={14} /></button>
      <button className="btn btn--quiet" type="button" onClick={() => dispatch({ type: "human/rejectProposal" })}>Request changes</button>
    </Dock>;
  }

  const canFinalise = selectCanFinalise(state);
  return <Dock actor="resident" focusKey={`accepted-${state.disclosureAcknowledged}`} eyebrow="RESIDENT AUTHORITY" title="Adopt the accepted resolution">
    <label className="action-dock__ack"><input type="checkbox" checked={state.disclosureAcknowledged} onChange={(e) => dispatch({ type: "human/setDisclosureAck", acknowledged: e.target.checked })} /> I understand this is a demonstration and allocates no real money.</label>
    <p>{canFinalise ? "Ready. No WebMCP tool can perform this action." : "Acknowledge the demonstration to enable adoption."}</p>
    <button className="btn btn--primary" type="button" disabled={!canFinalise} onClick={() => dispatch({ type: "human/finalise" })}>Adopt resolution WD-12</button>
  </Dock>;
}

function Dock({ actor, focusKey, eyebrow, title, children }: { actor: "resident" | "assistant"; focusKey: string; eyebrow: string; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) ref.current?.focus({ preventScroll: true });
    mounted.current = true;
  }, [focusKey]);
  return <section ref={ref} tabIndex={-1} className="action-dock" data-actor={actor} aria-label="Next action"><div><span>{eyebrow}</span><h2>{title}</h2></div><div className="action-dock__body">{children}</div></section>;
}

function CopyStatus({ status, prompt }: { status: string | null; prompt: string | null }) {
  return <>{status && <p className="action-dock__status" role="status">{status}</p>}{prompt && <textarea className="action-dock__prompt" readOnly value={prompt} aria-label="Assistant request" />}</>;
}
