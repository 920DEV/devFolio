import type { CSSProperties } from "react";
import { nodeIcons } from "./nodeIcons";
import type { OrbitNode } from "../types/portfolio";

type AccentStyle = CSSProperties & { "--accent"?: string };

type AchievementRingProps = {
  items: OrbitNode[];
  activeId: OrbitNode["id"];
  onSelect: (id: OrbitNode["id"]) => void;
};

export function AchievementRing({ items, activeId, onSelect }: AchievementRingProps) {
  const step = 360 / items.length;

  return (
    <div className="achievement-ring" role="list" aria-label="Systems and achievements">
      {items.map((item, index) => {
        const angle = step * index - 90;
        const Icon = nodeIcons[item.id];
        const isActive = item.id === activeId;

        return (
          <div
            className="ring-slot"
            key={item.id}
            style={{
              transform: `rotate(${angle}deg) translate(var(--ring-radius)) rotate(${-angle}deg)`,
            }}
          >
            <button
              type="button"
              className={isActive ? "ring-card is-active" : "ring-card"}
              style={{ "--accent": item.color } as AccentStyle}
              onMouseEnter={() => onSelect(item.id)}
              onFocus={() => onSelect(item.id)}
              onClick={() => onSelect(item.id)}
              role="listitem"
              aria-pressed={isActive}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
