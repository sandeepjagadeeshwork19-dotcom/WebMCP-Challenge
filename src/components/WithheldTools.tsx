/**
 * The actions the assistant simply cannot do — because the functions that would
 * do them were never registered as tools. Collapsed by default; it's the one
 * place the *mechanism* (boundary by omission) is shown rather than asserted.
 */

const ONLY_YOU = [
  "set your priorities",
  "protect a work",
  "accept or send back a plan",
  "adopt the plan",
  "start over",
];

export function WithheldTools() {
  return (
    <details className="withheld">
      <summary className="withheld__summary">What the assistant can&rsquo;t do</summary>
      <p className="withheld__head">Only you can:</p>
      <ul className="withheld__list">
        {ONLY_YOU.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
      <p className="withheld__note">
        These aren&rsquo;t exposed to the assistant at all &mdash; there&rsquo;s no function for it
        to call.
      </p>
    </details>
  );
}
