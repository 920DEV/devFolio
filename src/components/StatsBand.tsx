import type { Stat } from "../types/portfolio";

type StatsBandProps = {
  stats: Stat[];
};

export function StatsBand({ stats }: StatsBandProps) {
  return (
    <section className="stats-band" aria-label="Resume highlights">
      {stats.map((stat) => (
        <article className="stat-card" key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <p>{stat.note}</p>
        </article>
      ))}
    </section>
  );
}
