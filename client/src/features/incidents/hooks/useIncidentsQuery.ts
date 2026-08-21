import { useQuery } from "@tanstack/react-query";

import { getIncidents } from "../api/incident-api";
import type { IncidentListParams } from "../types/incident-list.types";
import { incidentQueryKeys } from "../api/incident-query-keys";

export function useIncidentsQuery(params: IncidentListParams) {
  return useQuery({
    queryKey: incidentQueryKeys.list(params),
    queryFn: ({ signal }) => getIncidents(params, signal),
  });
}
