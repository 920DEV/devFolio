import { ChipList } from "./ChipList";
import type { Project } from "../types/portfolio";

type ProjectsSectionProps = {
  projects: Project[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="content-section" id="projects" aria-labelledby="projects-title">
      <div className="section-intro">
        <p className="eyebrow">Selected enterprise work</p>
        <h2 id="projects-title">Production systems with measurable outcomes</h2>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.name}>
            <div>
              <p>{project.company}</p>
              <h3>{project.name}</h3>
            </div>
            <p>{project.focus}</p>
            <strong>{project.impact}</strong>
            <ChipList items={project.stack} />
          </article>
        ))}
      </div>
    </section>
  );
}
