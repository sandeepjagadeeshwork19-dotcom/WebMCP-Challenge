import type { ValidationIssue } from "../domain/types";

export function ConstraintMessages({
  issues,
  heading,
  emptyText = "No constraint issues.",
}: {
  issues: ValidationIssue[];
  heading: string;
  emptyText?: string;
}) {
  return (
    <div className="constraint-messages">
      <h3>{heading}</h3>
      {issues.length === 0 ? (
        <p className="status-ok">✓ {emptyText}</p>
      ) : (
        <ul>
          {issues.map((issue, index) => (
            <li key={index} className={`issue issue--${issue.code}`}>
              <span aria-hidden="true">⚠️ </span>
              <span className="issue-code">[{issue.code}]</span> {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
