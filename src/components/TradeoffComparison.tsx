import type { TradeoffSummary } from "../domain/types";
import { PRIORITY_LABELS, formatSignedMoney } from "../format";

const ARROW: Record<TradeoffSummary["benefitDeltas"][number]["direction"], string> = {
  up: "▲ increases",
  down: "▼ decreases",
  unchanged: "– unchanged",
};

export function TradeoffComparison({
  summary,
  title,
}: {
  summary: TradeoffSummary;
  title: string;
}) {
  return (
    <div className="tradeoff">
      <h3>{title}</h3>
      <p className="illustrative-label">Illustrative comparison — not an objective optimum.</p>

      <div className="tradeoff-grid">
        <div>
          <h4>Added</h4>
          <p>{summary.added.length ? summary.added.join(", ") : "None"}</p>
        </div>
        <div>
          <h4>Removed</h4>
          <p>{summary.removed.length ? summary.removed.join(", ") : "None"}</p>
        </div>
        <div>
          <h4>Funding changed</h4>
          <p>
            {summary.fundingChanged.length
              ? summary.fundingChanged
                  .map((c) => `${c.projectId}: ${formatSignedMoney(c.toAmount - c.fromAmount)}`)
                  .join(", ")
              : "None"}
          </p>
        </div>
        <div>
          <h4>Cost change</h4>
          <p>{formatSignedMoney(summary.costDelta)}</p>
        </div>
        <div>
          <h4>Unallocated funds change</h4>
          <p>{formatSignedMoney(summary.remainingFundsDelta)}</p>
        </div>
      </div>

      <h4>Directional benefit changes</h4>
      <ul className="benefit-deltas">
        {summary.benefitDeltas.map((delta) => (
          <li key={delta.priority}>
            {PRIORITY_LABELS[delta.priority]}: {ARROW[delta.direction]} ({delta.fromScore} →{" "}
            {delta.toScore})
          </li>
        ))}
      </ul>

      {summary.opportunityCosts.length > 0 && (
        <>
          <h4>Opportunity costs</h4>
          <ul className="opportunity-costs">
            {summary.opportunityCosts.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </>
      )}

      <h4>Caveats</h4>
      <ul className="caveats">
        {summary.caveats.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
