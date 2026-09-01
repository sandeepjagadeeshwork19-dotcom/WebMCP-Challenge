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

function Stage({ webmcpAvailable }: { webmcpAvailable: boolean }) {
  const stage = selectStage(useAppState());
  switch (stage) {
    case "priorities":
    case "compare":
      return <CompareDirections />;
    case "draft":
    case "invalid":
      return <ResolutionSheet />;
    case "replanning":
      return <TheTurn webmcpAvailable={webmcpAvailable} />;
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
  const webmcpAvailable = webmcp.status === "registered";

  return (
    <div className="app">
      <Masthead webmcp={webmcp} />

      {(webmcp.status === "unsupported" || webmcp.status === "error") && (
        <aside className="fallback-notice" role="note">
          <h2>Assistant tools unavailable</h2>
          <p>
            This browser has no WebMCP runtime. The workspace still works manually &mdash; loading an
            example direction creates a clearly application-attributed draft.
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
          <Stage webmcpAvailable={webmcpAvailable} />
          {stage !== "adopted" && <ScheduleOfWorks />}
        </div>
        <AssistantMargin />
      </main>

      <footer className="app-footer">
        <p>
          Hypothetical demonstration &mdash; no real funds, no vote. WebMCP authority boundary: the
          page registers no WebMCP tool to accept, adopt or reset. General browser automation sits
          outside that tool boundary.
        </p>
      </footer>
    </div>
  );
}
