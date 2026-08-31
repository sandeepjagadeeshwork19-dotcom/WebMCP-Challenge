import { useWebMcp } from "./webmcp/useWebMcp";
import { useAppState } from "./state/store";
import { selectStage } from "./state/selectors";
import { Masthead } from "./components/Masthead";
import { CommandBar } from "./components/CommandBar";
import { StateLine } from "./components/StateLine";
import { LeftRail } from "./components/LeftRail";
import { AssistantMargin } from "./components/AssistantMargin";
import { CompareDirections } from "./components/CompareDirections";
import { ResolutionSheet } from "./components/ResolutionSheet";
import { TheTurn } from "./components/TheTurn";
import { ReviewMode } from "./components/ReviewMode";
import { AdoptedRecord } from "./components/AdoptedRecord";
import { ScheduleOfWorks } from "./components/ScheduleOfWorks";

function Stage() {
  const stage = selectStage(useAppState());
  switch (stage) {
    case "priorities":
    case "compare":
      return <CompareDirections />;
    case "draft":
    case "invalid":
      return <ResolutionSheet />;
    case "replanning":
      return <TheTurn />;
    case "review":
      return <ReviewMode />;
    case "adopted":
      return <AdoptedRecord />;
  }
}

export function App() {
  const webmcp = useWebMcp();
  const state = useAppState();
  const stage = selectStage(state);
  const latest = state.activityHistory.at(-1);

  return (
    <div className="app">
      <Masthead webmcp={webmcp} />

      {(webmcp.status === "unsupported" || webmcp.status === "error") && (
        <aside className="fallback-notice" role="note">
          <h2>Assistant tools unavailable</h2>
          <p>
            Agent tools are unavailable in this browser; the full manual workspace still works. Every
            priority, direction, protection, review, adoption and reset flow is functional. Choosing
            a direction loads it as an application-attributed example draft. No project or constraint
            information is hidden, and no tool registration is claimed.
          </p>
        </aside>
      )}

      <CommandBar />
      <StateLine />

      <div aria-live="polite" className="visually-hidden">
        {latest ? `${latest.actor}: ${latest.summary}` : ""}
      </div>

      <main className="layout">
        <LeftRail />
        <div className="stage">
          <Stage />
          {stage !== "adopted" && <ScheduleOfWorks />}
        </div>
        <AssistantMargin />
      </main>

      <footer className="app-footer">
        <p>
          Hypothetical demonstration only. No government data, no real funds, no vote. WebMCP does
          not provide a native human-confirmation primitive; the human-only boundary is enforced by
          this application registering no tool to accept, adopt or reset.
        </p>
      </footer>
    </div>
  );
}
