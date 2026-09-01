import { FUND_LIMIT } from "../domain/projects";
import { committedTotal } from "../domain/validation";
import { formatMoney } from "../format";
import { useAppState } from "../state/store";
import { selectActiveAllocation, selectStatusLabel, selectTurn } from "../state/selectors";
import { Icon } from "./Icon";

export function CommandBar() {
  const state = useAppState();
  const allocated = committedTotal(selectActiveAllocation(state));
  const status = selectStatusLabel(state);
  const turn = selectTurn(state);

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
        <Icon name={turn.actor === "assistant" ? "pen" : turn.actor === "done" ? "check" : "pen"} size={14} />
        {turn.text}
      </p>
    </div>
  );
}
