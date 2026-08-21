import { useQuery, keepPreviousData } from "@tanstack/react-query";

import {
  getIncident,
  getIncidents,
  getServices,
  getUsers,
} from "../api/incident-api";
import type { IncidentListParams } from "../types/incident-list.types";
import { incidentQueryKeys } from "../api/incident-query-keys";
import { ApiError } from "@/shared/api/api-error";

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

export function useIncidentQuery(incidentId: string) {
  return useQuery({
    queryKey: incidentQueryKeys.detail(incidentId),
    queryFn: ({ signal }) => getIncident(incidentId, signal),
    retry: (failureCount, error) => {
      // A 404 or 400 will not become a 200 on retry.
      if (error instanceof ApiError && error.status < 500) {
        return false;
      }

      return failureCount < 1;
    },
  });
}

export function useUsersQuery() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
    staleTime: Infinity,
  });
}
