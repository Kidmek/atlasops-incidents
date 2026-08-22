import type { Incident } from "@/features/incidents/types/incident.types";

export function buildIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: "INC-1001",
    title: "Elevated payment failure rate",
    description: "Payment authorization failures are above the threshold.",
    status: "triggered",
    severity: "critical",
    service: "payments-api",
    assignee: { id: "usr-1", name: "Maya Chen", email: "maya@example.com" },
    createdAt: "2026-08-01T08:42:00.000Z",
    updatedAt: "2026-08-01T09:18:00.000Z",
    notes: [],
    version: 1,
    ...overrides,
  };
}
