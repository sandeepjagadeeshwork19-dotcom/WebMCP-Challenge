import { PROJECTS } from "../domain/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectList() {
  return (
    <section className="panel project-list" aria-labelledby="projects-heading">
      <h2 id="projects-heading">Project comparison</h2>
      <p className="panel-note">
        Eight hypothetical projects compete for the fixed fund. Fund, adjust and lock projects
        here; the deterministic engine reports every constraint inline.
      </p>
      <div className="project-grid">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
