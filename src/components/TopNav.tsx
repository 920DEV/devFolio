import { Github, Linkedin, Mail } from "lucide-react";
import type { Profile } from "../types/portfolio";

type TopNavProps = {
  profile: Profile;
};

export function TopNav({ profile }: TopNavProps) {
  return (
    <nav className="topbar" aria-label="Primary">
      <a className="brand-lockup" href="#hero-title" aria-label={`${profile.name} home`}>
        <span className="brand-mark">{profile.initials}</span>
        <span>
          <strong>{profile.name}</strong>
          <small>{profile.role}</small>
        </span>
      </a>
      <div className="nav-actions">
        <a href={`mailto:${profile.email}`} aria-label="Email Dev">
          <Mail size={18} aria-hidden="true" />
        </a>
        <a href={profile.github} aria-label="Open GitHub profile">
          <Github size={18} aria-hidden="true" />
        </a>
        <a href={profile.linkedin} aria-label="Open LinkedIn profile">
          <Linkedin size={18} aria-hidden="true" />
        </a>
      </div>
    </nav>
  );
}
