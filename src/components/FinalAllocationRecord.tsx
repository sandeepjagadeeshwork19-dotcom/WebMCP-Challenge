import { useState } from "react";
import { getProject } from "../domain/projects";
import { useAppState } from "../state/store";
import { formatMoney, PRIORITY_LABELS } from "../format";

export function FinalAllocationRecord() {
  const state = useAppState();
  const record = state.finalAllocationRecord;
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const copyText = JSON.stringify(record, null, 2);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="panel final-record" aria-labelledby="final-record-heading">
      <h2 id="final-record-heading">Final allocation record</h2>
      <p className="disclosure-inline">{record.disclosure}</p>

      <dl className="stat-grid">
        <div><dt>Record ID</dt><dd>{record.recordId}</dd></div>
        <div><dt>Created</dt><dd>{record.createdAt}</dd></div>
        <div><dt>Dataset</dt><dd>{record.datasetVersion}</dd></div>
        <div><dt>Committed total</dt><dd>{formatMoney(record.committedTotal)}</dd></div>
        <div><dt>Unallocated</dt><dd>{formatMoney(record.unallocatedAmount)}</dd></div>
        <div><dt>Source proposal revision</dt><dd>{record.sourceProposalRevision}</dd></div>
        <div><dt>Source budget revision</dt><dd>{record.sourceBudgetRevision}</dd></div>
        <div><dt>Allocation hash</dt><dd>{record.allocationHash}</dd></div>
        <div><dt>Attribution</dt><dd>{record.actor}</dd></div>
      </dl>

      <h3>Final project allocations</h3>
      <table className="allocation-table">
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {record.allocations.map((entry) => (
            <tr key={entry.projectId}>
              <th scope="row">
                {entry.projectId} — {getProject(entry.projectId).name}
              </th>
              <td>{formatMoney(entry.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {record.appliedDependencies.length > 0 && (
        <p>
          Applied dependencies:{" "}
          {record.appliedDependencies.map((d) => `${d.projectId} → ${d.dependsOn}`).join(", ")}
        </p>
      )}

      <h3>Resident priority snapshot</h3>
      <ul>
        {(Object.keys(record.residentPriorities) as (keyof typeof record.residentPriorities)[]).map(
          (key) => (
            <li key={key}>
              {PRIORITY_LABELS[key]}: {record.residentPriorities[key]}
            </li>
          ),
        )}
      </ul>

      <h3>Locked-project snapshot</h3>
      <p>
        {record.lockedAllocations.length === 0
          ? "None"
          : record.lockedAllocations
              .map((l) => `${l.projectId} at ${formatMoney(l.amount)}`)
              .join(", ")}
      </p>

      <button type="button" onClick={onCopy}>
        {copied ? "Copied ✓" : "Copy record JSON"}
      </button>
      <details className="record-json">
        <summary>Show record JSON</summary>
        <pre>{copyText}</pre>
      </details>
    </section>
  );
}
