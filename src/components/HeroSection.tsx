import { Mail, Workflow } from "lucide-react";
import { ChipList } from "./ChipList";
import { nodeIcons } from "./nodeIcons";
import { SystemsScene } from "./SystemsScene";
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
      <SystemsScene nodes={nodes} selectedId={selectedId} onSelect={onSelect} />
      <TopNav profile={profile} />

      <div className="hero-grid">
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
      </div>

      <div className="orbit-selector" aria-label="Select portfolio system">
        {nodes.map((node) => {
          const NodeIcon = nodeIcons[node.id];
          return (
            <button
              className={node.id === selectedId ? "is-active" : ""}
              key={node.id}
              onClick={() => onSelect(node.id)}
              type="button"
            >
              <NodeIcon size={17} aria-hidden="true" />
              <span>{node.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
