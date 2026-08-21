import type { z } from "zod";

import type {
  incidentListParamsSchema,
  incidentListResponseSchema,
} from "../schemas/incident-list.schema";

export type IncidentListResponse = z.infer<typeof incidentListResponseSchema>;

export type IncidentListParams = z.infer<typeof incidentListParamsSchema>;

export type IncidentSortField = IncidentListParams["sort"];
export type SortDirection = IncidentListParams["order"];
