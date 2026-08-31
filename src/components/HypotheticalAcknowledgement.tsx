import { useAppState, useDispatch } from "../state/store";

export function HypotheticalAcknowledgement() {
  const state = useAppState();
  const dispatch = useDispatch();

  return (
    <label className="ack-checkbox">
      <input
        type="checkbox"
        checked={state.disclosureAcknowledged}
        onChange={(event) =>
          dispatch({ type: "human/setDisclosureAck", acknowledged: event.target.checked })
        }
      />
      I understand this is a hypothetical demonstration. Finalising records a demonstration choice
      only; it does not cast a vote or allocate real funds.
    </label>
  );
}
