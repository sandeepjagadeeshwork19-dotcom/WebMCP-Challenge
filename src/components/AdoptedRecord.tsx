import { useState } from "react";
import { getProject } from "../domain/projects";
import { formatMoney, PRIORITY_LABELS } from "../format";
import { useAppState, useDispatch } from "../state/store";
import { Icon } from "./Icon";
import { useStageFocus } from "./useStageFocus";

export function AdoptedRecord() {
  const state = useAppState();
  const dispatch = useDispatch();
  const focusRef = useStageFocus<HTMLElement>();
  const record = state.finalAllocationRecord;
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  if (!record) return null;

  const json = JSON.stringify(record, null, 2);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="stage-block" aria-labelledby="adopted-band" ref={focusRef} tabIndex={-1}>
      <div className="adopted-band" id="adopted-band">
        <strong>
          <Icon name="badge" size={18} /> RESOLUTION WD-12 &mdash; ADOPTED
        </strong>
        <span>local record · not transmitted</span>
      </div>

      <div className="record">
        <p className="record__by">
          Adopted by the resident on {new Date(record.createdAt).toLocaleString()}. Record ID{" "}
          {record.recordId}.
        </p>
        <hr className="sheet__rule" />

        <div className="resolution-lines">
          {record.allocations.map((entry) => {
            const dep = record.appliedDependencies.find((d) => d.dependsOn === entry.projectId);
            const isProtected = record.lockedAllocations.some(
              (l) => l.projectId === entry.projectId,
            );
            return (
              <div key={entry.projectId} className="resolution-line">
                <span className="resolution-line__num" aria-hidden="true" />
                <span className="resolution-line__id">{entry.projectId}</span>
                <span className="resolution-line__name">
                  {getProject(entry.projectId).name}
                  {isProtected ? " · protected" : ""}
                  {dep ? " · applied dependency" : ""}
                </span>
                <span className="resolution-line__amount">{formatMoney(entry.amount)}</span>
              </div>
            );
          })}
        </div>

        <div className="record__grid">
          <p className="record-fact">
            <span>COMMITTED / UNALLOCATED</span>
            <b>
              {formatMoney(record.committedTotal)} / {formatMoney(record.unallocatedAmount)}
            </b>
          </p>
          <p className="record-fact">
            <span>PRIORITIES AT ADOPTION</span>
            <b>
              {(Object.keys(record.residentPriorities) as (keyof typeof record.residentPriorities)[])
                .map((k) => `${PRIORITY_LABELS[k]} ${record.residentPriorities[k]}`)
                .join(" · ")}
            </b>
          </p>
          <p className="record-fact">
            <span>PROTECTED</span>
            <b>
              {record.lockedAllocations.length
                ? record.lockedAllocations
                    .map((l) => `${l.projectId} ${getProject(l.projectId).shortName}`)
                    .join(", ")
                : "None"}
            </b>
          </p>
          <p className="record-fact">
            <span>REVISIONS</span>
            <b>
              budget rev {record.sourceBudgetRevision} · proposal rev {record.sourceProposalRevision}
            </b>
          </p>
        </div>

        <p className="record__validation">
          &#10003; Every rule of the fund passed at adoption.
        </p>

        <p className="record__attribution">
          Attribution: {record.actor}. The assistant modelled and drafted; the resident set
          priorities, protected works, reviewed and adopted. No WebMCP tool was registered to
          accept, adopt or reset; general browser automation sits outside that boundary.
        </p>

        <details className="record-json">
          <summary>Show the full record</summary>
          <pre>{json}</pre>
        </details>
      </div>

      <div className="stage-actions">
        <button type="button" className="btn" onClick={onCopy}>
          <Icon name="copy" size={14} /> {copied ? "Copied" : "Copy the record"}
        </button>
        {confirming ? (
          <div className="reset-confirm">
            <p>Reset the whole demonstration? This clears the record and returns to the start.</p>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                dispatch({ type: "human/reset" });
                setConfirming(false);
              }}
            >
              Confirm reset
            </button>
            <button type="button" className="btn" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn--dark" onClick={() => setConfirming(true)}>
            <Icon name="rotate" size={14} /> Reset &mdash; run the demonstration again
          </button>
        )}
      </div>
    </section>
  );
}
