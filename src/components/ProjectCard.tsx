import { P06_ALLOWED_AMOUNTS } from "../domain/projects";
import type { Project } from "../domain/types";
import { useAppState, useDispatch } from "../state/store";
import { selectManualValidation } from "../state/selectors";
import { formatMoney } from "../format";
import { HypotheticalTag } from "./Disclosure";

export function ProjectCard({ project }: { project: Project }) {
  const state = useAppState();
  const dispatch = useDispatch();

  const entry = state.manualAllocations.find((a) => a.projectId === project.id);
  const selected = !!entry && entry.amount > 0;
  const locked = state.lockedAllocations.some((l) => l.projectId === project.id);
  const phased = project.fundingRule.kind === "phased";
  const defaultAmount = phased ? P06_ALLOWED_AMOUNTS[0] : project.cost;

  const issues = selectManualValidation(state).issues.filter((i) =>
    i.projectIds.includes(project.id),
  );

  return (
    <article className={`project-card ${selected ? "project-card--selected" : ""}`} aria-labelledby={`proj-${project.id}`}>
      <div className="project-card__head">
        <h3 id={`proj-${project.id}`}>
          <span className="project-id">{project.id}</span> {project.name}
        </h3>
        <HypotheticalTag />
      </div>
      <p>{project.description}</p>

      <dl className="project-facts">
        <div><dt>Cost</dt><dd>{phased ? `Up to ${formatMoney(project.cost)}` : formatMoney(project.cost)}</dd></div>
        <div><dt>Neighbourhood</dt><dd>{project.neighbourhood}</dd></div>
        <div><dt>Category</dt><dd>{project.category}</dd></div>
        <div><dt>People served</dt><dd>{project.peopleServed}</dd></div>
        <div><dt>Safety benefit</dt><dd>{project.benefits.safety}</dd></div>
        <div><dt>Accessibility benefit</dt><dd>{project.benefits.accessibility}</dd></div>
        <div><dt>Climate benefit</dt><dd>{project.benefits.climate}</dd></div>
        <div><dt>Community support</dt><dd>{project.communitySupport}</dd></div>
        <div><dt>Funding rule</dt><dd>{project.minimumViableFunding}</dd></div>
        {project.dependencies.length > 0 && (
          <div><dt>Requires</dt><dd>{project.dependencies.join(", ")} at full funding</dd></div>
        )}
        {project.incompatibilities.length > 0 && (
          <div><dt>Incompatible with</dt><dd>{project.incompatibilities.join(", ")}</dd></div>
        )}
      </dl>

      <div className="project-card__controls">
        {selected ? (
          <>
            <span className="allocated-amount">
              Funded at {formatMoney(entry!.amount)}
              {locked && <span className="lock-badge"> · 🔒 Locked</span>}
            </span>
            {phased && (
              <fieldset className="phase-picker" disabled={locked}>
                <legend>Phase amount for {project.id}</legend>
                {P06_ALLOWED_AMOUNTS.map((amount) => (
                  <label key={amount} className="chip">
                    <input
                      type="radio"
                      name={`phase-${project.id}`}
                      checked={entry!.amount === amount}
                      onChange={() =>
                        dispatch({ type: "human/setAllocation", projectId: project.id, amount })
                      }
                    />
                    {formatMoney(amount)}
                  </label>
                ))}
              </fieldset>
            )}
            <button
              type="button"
              onClick={() =>
                dispatch(
                  locked
                    ? { type: "human/unlockProject", projectId: project.id }
                    : { type: "human/lockProject", projectId: project.id },
                )
              }
            >
              {locked ? "Unlock" : "Lock"} {project.id}
            </button>
            <button
              type="button"
              className="danger-text"
              disabled={locked}
              onClick={() => dispatch({ type: "human/removeAllocation", projectId: project.id })}
            >
              Remove {project.id}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "human/setAllocation", projectId: project.id, amount: defaultAmount })
            }
          >
            Fund {project.id} ({formatMoney(defaultAmount)})
          </button>
        )}
      </div>

      {issues.length > 0 && (
        <ul className="inline-issues">
          {issues.map((issue, index) => (
            <li key={index}>⚠️ {issue.message}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
