import { ChipList } from "./ChipList";
import type { SkillGroup } from "../types/portfolio";

type SkillsSectionProps = {
  skillGroups: SkillGroup[];
};

export function SkillsSection({ skillGroups }: SkillsSectionProps) {
  return (
    <section className="content-section skills-section" aria-labelledby="skills-title">
      <div className="section-intro">
        <p className="eyebrow">Technical range</p>
        <h2 id="skills-title">Backend depth with enough frontend to ship the full loop</h2>
      </div>
      <div className="skills-grid">
        {skillGroups.map((group) => (
          <article key={group.label}>
            <h3>{group.label}</h3>
            <ChipList items={group.items} />
          </article>
        ))}
      </div>
    </section>
  );
}
