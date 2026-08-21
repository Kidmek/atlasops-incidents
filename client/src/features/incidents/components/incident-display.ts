import type { BadgeTone } from "@/shared/ui/atoms/Badge";

import type { IncidentSeverity, IncidentStatus } from "../types/incident.types";

/** How incident domain values map to the design system. */
export const STATUS_TONE: Record<IncidentStatus, BadgeTone> = {
  triggered: "danger",
  acknowledged: "warning",
  investigating: "info",
  resolved: "success",
};

export const SEVERITY_TONE: Record<IncidentSeverity, BadgeTone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};

export const SEVERITY_DOT: Record<IncidentSeverity, string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
};
