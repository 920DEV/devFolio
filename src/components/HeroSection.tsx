import { Mail, Workflow } from "lucide-react";
import { AchievementRing } from "./AchievementRing";
import { AvatarScene } from "./AvatarScene";
import { ChipList } from "./ChipList";
import { nodeIcons } from "./nodeIcons";
import { ResumeAssistant } from "./ResumeAssistant";
import { TopNav } from "./TopNav";
import type { OrbitNode, Profile } from "../types/portfolio";

type HeroSectionProps = {
  profile: Profile;
  nodes: OrbitNode[];
  selected: OrbitNode;
  selectedId: OrbitNode["id"];
  onSelect: (id: OrbitNode["id"]) => void;
};

export function HeroSection({
  profile,
  nodes,
  selected,
  selectedId,
  onSelect,
}: HeroSectionProps) {
  const SelectedIcon = nodeIcons[selected.id];

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <TopNav profile={profile} />

      <div className="hero-copy">
        <p className="eyebrow">{profile.tagline}</p>
        <h1 id="hero-title">{profile.name}</h1>
        <p className="hero-summary">{profile.summary}</p>
        <div className="hero-actions">
          <a className="primary-link" href={`mailto:${profile.email}`}>
            <Mail size={18} aria-hidden="true" />
            Contact Dev
          </a>
          <a className="secondary-link" href="#projects">
            <Workflow size={18} aria-hidden="true" />
            View systems
          </a>
        </div>
      </div>

      <div className="orbit-stage">
        <AvatarScene accentColor={selected.color} />
        <AchievementRing items={nodes} activeId={selectedId} onSelect={onSelect} />
      </div>
      <p className="orbit-hint">Say hi — hover nearby and it'll wave back. Hover a system to explore it.</p>

      <ResumeAssistant />

      <aside className="system-panel" aria-label="Selected system detail">
        <div className="panel-heading">
          <SelectedIcon size={24} aria-hidden="true" />
          <div>
            <p>{selected.orbit}</p>
            <h2>{selected.label}</h2>
          </div>
        </div>
        <strong>{selected.value}</strong>
        <p>{selected.detail}</p>
        <ChipList items={selected.tech} />
      </aside>
    </section>
  );
}
