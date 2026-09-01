/**
 * The tools that were deliberately not registered. The human/agent boundary in
 * this project is enforced by omission — these are the functions that do not
 * exist on `document.modelContext`, so a cooperative agent has no way to call
 * them. Showing the list is what makes the omission read as a choice.
 */

const WITHHELD = [
  { name: "set_priorities", human: "You set the priority weights." },
  { name: "protect_work", human: "You protect a work into every draft." },
  { name: "accept_proposal", human: "You accept, send back, or reject." },
  { name: "adopt_resolution", human: "You adopt the resolution." },
  { name: "reset", human: "You reset the demonstration." },
];

export function WithheldTools() {
  return (
    <section className="withheld" aria-labelledby="withheld-heading">
      <hr className="margin__rule" />
      <p className="withheld__kicker" id="withheld-heading">
        NOT REGISTERED AS TOOLS
      </p>
      <ul className="withheld__list">
        {WITHHELD.map((tool) => (
          <li key={tool.name}>
            <code>{tool.name}</code>
            <span>{tool.human}</span>
          </li>
        ))}
      </ul>
      <p className="withheld__note">
        Not gated by a dialog — these functions are not on <code>document.modelContext</code>. A
        cooperative assistant has nothing to call.
      </p>
    </section>
  );
}
