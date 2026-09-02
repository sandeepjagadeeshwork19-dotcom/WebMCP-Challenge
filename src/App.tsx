import { useWebMcp } from "./webmcp/useWebMcp";
import { useAppState } from "./state/store";
import { selectStage } from "./state/selectors";
import { Masthead } from "./components/Masthead";
import { CommandBar } from "./components/CommandBar";
import { LeftRail } from "./components/LeftRail";
import { AssistantMargin } from "./components/AssistantMargin";
import { ComparePlans } from "./components/ComparePlans";
import { ResolutionSheet } from "./components/ResolutionSheet";
import { TheTurn } from "./components/TheTurn";
import { ReviewMode } from "./components/ReviewMode";
import { AdoptedRecord } from "./components/AdoptedRecord";
import { ScheduleOfWorks } from "./components/ScheduleOfWorks";
import { NextActionDock } from "./components/NextActionDock";

function Stage() {
  const stage = selectStage(useAppState());
  switch (stage) {
    case "priorities":
      // The plans stay hidden until the resident has weighed their priorities —
      // the eight works (rendered below) are the content of this screen.
      return null;
    case "compare":
      return <ComparePlans />;
    case "draft":
    case "invalid":
      return <ResolutionSheet />;
    case "replanning":
      return <TheTurn />;
    case "review":
      return <ReviewMode />;
    case "adopted":
      return <AdoptedRecord />;
    default:
      return null;
  }
}

export function App() {
  const webmcp = useWebMcp();
  const state = useAppState();
  const stage = selectStage(state);
  const latest = state.activityHistory.at(-1);
  const webmcpAvailable = webmcp.status === "registered";
  const dock = <NextActionDock webmcpAvailable={webmcpAvailable} />;
  const works = <ScheduleOfWorks />;
  const drafting = stage === "draft" || stage === "invalid" || stage === "replanning";

  return (
    <div className="app">
      <Masthead webmcp={webmcp} />

      {(webmcp.status === "unsupported" || webmcp.status === "error") && (
        <aside className="fallback-notice" role="note">
          <h2>No assistant in this browser</h2>
          <p>
            That&rsquo;s fine &mdash; you can set priorities, compare plans, and adopt one entirely
            by hand.
          </p>
        </aside>
      )}

      <CommandBar webmcpAvailable={webmcpAvailable} />

      <div aria-live="polite" className="visually-hidden">
        {latest ? `${latest.actor}: ${latest.summary}` : ""}
      </div>

      <LeftRail />
      <main className="layout">
        <div className={`stage stage--${stage}`} key={stage}>
          {/* priorities: read the works, then compare. compare: plans lead, the
              assistant option sits above them. drafting: act on the plan, then
              the works for reference. review: decide. */}
          {stage === "priorities" && (
            <>
              {works}
              {dock}
            </>
          )}
          {stage === "compare" && (
            <>
              {dock}
              <Stage />
              {works}
            </>
          )}
          {drafting && (
            <>
              <Stage />
              {dock}
              {works}
            </>
          )}
          {stage === "review" && (
            <>
              <Stage />
              {dock}
            </>
          )}
          {stage === "adopted" && <Stage />}
        </div>
        <AssistantMargin />
      </main>

      <footer className="app-footer">
        <p>A demo &mdash; no real money, no real vote.</p>
      </footer>
    </div>
  );
}
