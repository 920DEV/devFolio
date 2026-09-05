import { useMemo, useState } from "react";
import { ClosingBand } from "./components/ClosingBand";
import { HeroSection } from "./components/HeroSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { SkillsSection } from "./components/SkillsSection";
import { StatsBand } from "./components/StatsBand";
import { orbitNodes, profile, projects, skillGroups, stats } from "./data/portfolio";
import type { OrbitNode } from "./types/portfolio";

function App() {
  const [selectedId, setSelectedId] = useState<OrbitNode["id"]>(orbitNodes[0].id);
  const selected = useMemo(
    () => orbitNodes.find((node) => node.id === selectedId) ?? orbitNodes[0],
    [selectedId],
  );

  return (
    <main className="portfolio">
      <HeroSection
        profile={profile}
        nodes={orbitNodes}
        selected={selected}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <StatsBand stats={stats} />
      <ProjectsSection projects={projects} />
      <SkillsSection skillGroups={skillGroups} />
      <ClosingBand profile={profile} />
    </main>
  );
}

export default App;
