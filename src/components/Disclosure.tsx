import { HYPOTHETICAL_DISCLOSURE } from "../domain/disclosure";

export function Disclosure({ id }: { id?: string }) {
  return (
    <aside id={id} className="disclosure" role="note" aria-label="Hypothetical demonstration notice">
      <strong>Hypothetical demonstration:</strong> This workspace uses invented projects, costs,
      benefits, constraints, neighbourhoods and community-support indicators. It is not connected
      to, endorsed by or deployed for any government. Finalising records a demonstration choice
      only; it does not cast a vote or allocate real funds.
      <span className="visually-hidden">{HYPOTHETICAL_DISCLOSURE}</span>
    </aside>
  );
}

export function HypotheticalTag() {
  return <span className="hypothetical-tag">Hypothetical data</span>;
}
