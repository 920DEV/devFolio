import { ArrowUpRight } from "lucide-react";
import type { Profile } from "../types/portfolio";

type ClosingBandProps = {
  profile: Profile;
};

export function ClosingBand({ profile }: ClosingBandProps) {
  return (
    <section className="closing-band" aria-labelledby="closing-title">
      <div>
        <p className="eyebrow">Open to strong engineering teams</p>
        <h2 id="closing-title">Ready to build secure, fast, observable systems.</h2>
      </div>
      <a className="primary-link" href={profile.linkedin}>
        <ArrowUpRight size={18} aria-hidden="true" />
        Connect on LinkedIn
      </a>
    </section>
  );
}
