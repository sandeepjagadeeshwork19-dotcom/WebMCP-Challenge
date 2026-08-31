import { useState } from "react";
import { useAppState, useDispatch } from "../state/store";

export function ResetDemo() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="panel reset-demo" aria-labelledby="reset-heading">
      <h2 id="reset-heading">Reset demonstration</h2>
      <p className="panel-note">
        Restores the exact initial scenario: priorities, allocations, locks, proposal, review,
        history and final record. Reset version is now {state.demoResetVersion}.
      </p>
      {confirming ? (
        <div className="reset-confirm">
          <p>Reset the whole demonstration? This clears the current allocation and any record.</p>
          <button
            type="button"
            className="danger"
            onClick={() => {
              dispatch({ type: "human/reset" });
              setConfirming(false);
            }}
          >
            Confirm reset
          </button>
          <button type="button" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className="danger" onClick={() => setConfirming(true)}>
          Reset demo
        </button>
      )}
    </section>
  );
}
