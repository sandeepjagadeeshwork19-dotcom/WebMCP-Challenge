import { useWebMcp } from "./webmcp/useWebMcp";
import { useAppState } from "./state/store";
import { ScenarioHeader } from "./components/ScenarioHeader";
import { UnsupportedWebMcpNotice } from "./components/UnsupportedWebMcpNotice";
import { BudgetSummary } from "./components/BudgetSummary";
import { PriorityControls } from "./components/PriorityControls";
import { ProjectList } from "./components/ProjectList";
import { CurrentAllocation } from "./components/CurrentAllocation";
import { AgentProposal } from "./components/AgentProposal";
import { ActivityHistory } from "./components/ActivityHistory";
import { HumanReview } from "./components/HumanReview";
import { FinalAllocationRecord } from "./components/FinalAllocationRecord";
import { ResetDemo } from "./components/ResetDemo";

export function App() {
  const webmcp = useWebMcp();
  const state = useAppState();
  const latest = state.activityHistory.at(-1);

  return (
    <div className="app-shell">
      <ScenarioHeader webmcp={webmcp} />
      <UnsupportedWebMcpNotice webmcp={webmcp} />

      <div aria-live="polite" className="visually-hidden">
        {latest ? `${latest.actor}: ${latest.summary}` : ""}
      </div>

      <main className="layout">
        <div className="layout__col">
          <BudgetSummary />
          <PriorityControls />
          <CurrentAllocation />
        </div>
        <div className="layout__col">
          <ProjectList />
        </div>
        <div className="layout__col">
          <AgentProposal />
          <HumanReview />
          <FinalAllocationRecord />
          <ActivityHistory />
          <ResetDemo />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Hypothetical demonstration only. No government data, no real funds, no vote. WebMCP does
          not provide a native human-confirmation primitive; human-only finalisation is enforced by
          this application registering no finalisation tool.
        </p>
      </footer>
    </div>
  );
}
