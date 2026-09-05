import type { OrbitNode, Profile, Project, SkillGroup, Stat } from "../types/portfolio";

export const profile: Profile = {
  name: "Dev Kumar Choudhary",
  role: "Software Engineer",
  initials: "DC",
  email: "devc0440@gmail.com",
  phone: "+91 9205223246",
  github: "https://github.com/920DEV",
  linkedin: "https://linkedin.com/in/dev-choudhary-150551207",
  tagline: "Java, Spring Boot, React, AWS",
  summary:
    "Software engineer building scalable backend systems and full-stack tools for enterprise teams, with production work across Cisco Systems and JPMorgan Chase.",
};

export const orbitNodes: OrbitNode[] = [
  {
    id: "rbac",
    label: "RBAC Engine",
    orbit: "Cisco UCDM",
    value: "Owned microservice",
    detail:
      "Spring Boot authorization layer with OAuth 2.0, JWT, role-driven masking, and PL/SQL approver routing.",
    tech: ["Java", "Spring Boot", "OAuth 2.0", "JWT", "PL/SQL"],
    position: [-2.8, 1.2, 0.4],
    color: "#37d7b2",
  },
  {
    id: "dashboard",
    label: "Data Dashboard",
    orbit: "React cockpit",
    value: "50% built",
    detail:
      "Customer data visualization dashboard for enterprise teams using React and Redux.",
    tech: ["React", "Redux", "REST APIs"],
    position: [2.6, 0.9, -0.2],
    color: "#f1c84b",
  },
  {
    id: "async",
    label: "Async Writes",
    orbit: "Performance path",
    value: "800ms -> 300ms",
    detail:
      "Converted sequential writes to Solr, Oracle, and MongoDB into parallel CompletableFuture calls.",
    tech: ["Java", "CompletableFuture", "Solr", "Oracle", "MongoDB"],
    position: [1.4, -1.9, 0.8],
    color: "#ff7a59",
  },
  {
    id: "streaming",
    label: "AI Streaming APIs",
    orbit: "U Learning",
    value: "58% faster perceived load",
    detail:
      "Chunked FastAPI responses progressively rendered AI-generated content instead of waiting for full output.",
    tech: ["FastAPI", "Python", "SSO", "OAuth 2.0"],
    position: [-1.1, -2.3, -1.1],
    color: "#8fb8ff",
  },
  {
    id: "biometric",
    label: "Biometric Auth",
    orbit: "JPMorgan Chase",
    value: "Device + POC",
    detail:
      "Integrated PopID SDK and built facial embedding similarity APIs using FaceNet and vector databases.",
    tech: ["Kotlin", "Java SDK", "FaceNet", "Flask", "pgvector"],
    position: [0.3, 2.4, -1.6],
    color: "#d989ff",
  },
  {
    id: "cloud",
    label: "Cloud Tracker",
    orbit: "Internal systems",
    value: "Dockerized AWS deploy",
    detail:
      "Angular and Spring Boot monitoring app on EC2 with MySQL and scheduled backup automation.",
    tech: ["AWS EC2", "Docker", "MySQL", "Spring Boot"],
    position: [-2.2, -0.5, -1.7],
    color: "#6ee56f",
  },
];

export const projects: Project[] = [
  {
    name: "Cisco UCDM",
    company: "Accenture / Relanto.AI",
    focus: "RBAC, data masking, approver-generation, customer dashboards",
    impact: "Shared authorization foundation adopted across multiple Cisco departments.",
    stack: ["Spring Boot", "React", "Redux", "Oracle", "MongoDB", "Solr"],
  },
  {
    name: "Cisco U Learning Platform",
    company: "Relanto.AI",
    focus: "AI assistant modules, streaming REST APIs, SSO authentication",
    impact: "Reduced perceived content load time by 58% through progressive rendering.",
    stack: ["FastAPI", "OAuth 2.0", "Python", "REST"],
  },
  {
    name: "JPMorgan Chase Blade",
    company: "Relanto.AI",
    focus: "Device-side biometric authentication and facial matching POC",
    impact: "Delivered Java SDK integration and a scalable vector search direction.",
    stack: ["Kotlin", "Java", "Flask", "FaceNet", "pgvector"],
  },
];

export const stats: Stat[] = [
  { label: "Experience", value: "2 years", note: "Backend + full-stack engineering" },
  { label: "Enterprise projects", value: "5+", note: "Cisco and JPMorgan Chase work" },
  { label: "DSA practice", value: "200+", note: "LeetCode problems solved" },
  { label: "Education", value: "8.1 CGPA", note: "BCA, GGSIPU" },
];

export const skillGroups: SkillGroup[] = [
  {
    label: "Backend",
    items: ["Java", "Spring Boot", "REST APIs", "Microservices", "FastAPI", "Flask"],
  },
  {
    label: "Data",
    items: ["Oracle", "MongoDB", "MySQL", "Solr", "Vector DBs", "PL/SQL"],
  },
  {
    label: "Frontend",
    items: ["React", "Redux", "JavaScript", "Angular"],
  },
  {
    label: "Cloud and security",
    items: ["AWS EC2", "S3", "Docker", "CI/CD", "OAuth 2.0", "JWT", "SSO"],
  },
];
