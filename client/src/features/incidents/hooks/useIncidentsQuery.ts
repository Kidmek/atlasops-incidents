import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { getIncidents, getServices } from "../api/incident-api";
import type { IncidentListParams } from "../types/incident-list.types";
import { incidentQueryKeys } from "../api/incident-query-keys";

export function useIncidentsQuery(params: IncidentListParams) {
  return useQuery({
    queryKey: incidentQueryKeys.list(params),
    queryFn: ({ signal }) => getIncidents(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useServicesQuery() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => getServices(),
    staleTime: Infinity,
  });
}
