export const INCIDENT_STATUSES = [
  "triggered",
  "acknowledged",
  "investigating",
  "resolved",
] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_SEVERITIES = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface IncidentNote {
  id: string;
  incidentId: string;
  author: UserSummary;
  message: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  service: string;
  assignee: UserSummary | null;
  createdAt: string;
  updatedAt: string;
  notes: IncidentNote[];
  version: number;
}
