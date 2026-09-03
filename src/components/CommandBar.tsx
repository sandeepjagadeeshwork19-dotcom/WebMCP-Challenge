import { FUND_LIMIT } from "../domain/projects";
import { committedTotal } from "../domain/validation";
import { formatMoney } from "../format";
import { useAppState } from "../state/store";
import { selectActiveAllocation, selectStatusLabel, selectTurn } from "../state/selectors";
import { Icon } from "./Icon";

export function CommandBar({ webmcpAvailable }: { webmcpAvailable?: boolean }) {
  const state = useAppState();
  const allocated = committedTotal(selectActiveAllocation(state));
  const status = selectStatusLabel(state);
  let turn = selectTurn(state);

  // With no assistant connected, never tell the resident it's "the assistant's
  // move" - point them at the by-hand control instead.
  if (webmcpAvailable === false && turn.actor === "assistant") {
    turn = { actor: "you", text: "Your move - rebuild the plan below to fit your protected work" };
  }

  return (
    <div className="commandbar">
      <p className="commandbar__fund">
        {formatMoney(allocated)} <span>spent</span> &nbsp;·&nbsp;{" "}
        {formatMoney(FUND_LIMIT - allocated)} <span>left</span> &nbsp;·&nbsp;{" "}
        <span>of {formatMoney(FUND_LIMIT)}</span>
      </p>

      <p className="commandbar__stamp" data-status={status}>
        {status}
      </p>

      <p
        className={`commandbar__turn commandbar__turn--${turn.actor}`}
        role="status"
        aria-live="polite"
      >
        <Icon name={turn.actor === "done" ? "check" : "arrow"} size={13} />
        {turn.text}
      </p>
    </div>
  );
}
