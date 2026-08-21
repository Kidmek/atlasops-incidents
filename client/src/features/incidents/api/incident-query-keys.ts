import type { IncidentListParams } from "../types/incident-list.types";

export const incidentQueryKeys = {
  all: ["incidents"] as const,
  lists: ["incidents", "list"] as const,

  list: (params: IncidentListParams) =>
    [...incidentQueryKeys.lists, params] as const,

  details: ["incidents", "detail"] as const,

  detail: (incidentId: string) =>
    [...incidentQueryKeys.details, incidentId] as const,
};
