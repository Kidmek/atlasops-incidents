import type { z } from "zod";

import type {
  incidentNoteSchema,
  incidentSchema,
  incidentSeveritySchema,
  incidentStatusSchema,
  incidentStatusUpdateSchema,
  userSummarySchema,
} from "../schemas/incident.schema";

export type IncidentStatus = z.infer<typeof incidentStatusSchema>;
export type IncidentSeverity = z.infer<typeof incidentSeveritySchema>;
export type UserSummary = z.infer<typeof userSummarySchema>;
export type IncidentNote = z.infer<typeof incidentNoteSchema>;
export type Incident = z.infer<typeof incidentSchema>;
export type IncidentStatusUpdate = z.infer<typeof incidentStatusUpdateSchema>;
