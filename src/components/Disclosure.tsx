import { HYPOTHETICAL_DISCLOSURE } from "../domain/disclosure";

export function Disclosure({ id }: { id?: string }) {
  const [lead, ...rest] = HYPOTHETICAL_DISCLOSURE.split(": ");
  return (
    <aside id={id} className="disclosure" role="note" aria-label="Hypothetical demonstration notice">
      <strong>{lead}:</strong> {rest.join(": ")}
    </aside>
  );
}

export function HypotheticalTag() {
  return <span className="hypothetical-tag">Hypothetical data</span>;
}
