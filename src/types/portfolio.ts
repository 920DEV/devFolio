export type OrbitNode = {
  id: "rbac" | "dashboard" | "async" | "streaming" | "biometric" | "cloud";
  label: string;
  orbit: string;
  value: string;
  detail: string;
  tech: string[];
  position: [number, number, number];
  color: string;
};

export type Project = {
  name: string;
  company: string;
  focus: string;
  impact: string;
  stack: string[];
};

export type Stat = {
  label: string;
  value: string;
  note: string;
};

export type SkillGroup = {
  label: string;
  items: string[];
};

export type Profile = {
  name: string;
  role: string;
  initials: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  tagline: string;
  summary: string;
};
