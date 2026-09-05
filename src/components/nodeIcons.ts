import {
  BrainCircuit,
  Cloud,
  DatabaseZap,
  Gauge,
  ScanFace,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { OrbitNode } from "../types/portfolio";

export const nodeIcons: Record<OrbitNode["id"], LucideIcon> = {
  rbac: ShieldCheck,
  dashboard: Gauge,
  async: DatabaseZap,
  streaming: BrainCircuit,
  biometric: ScanFace,
  cloud: Cloud,
};
