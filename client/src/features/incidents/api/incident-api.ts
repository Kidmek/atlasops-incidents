import { toApiError } from "@/shared/api/api-error";

import { incidentListResponseSchema } from "../schemas/incident-list.schema";
import type {
  IncidentListParams,
  IncidentListResponse,
} from "../types/incident-list.types";

export async function getIncidents(
  params: IncidentListParams,
  signal?: AbortSignal
): Promise<IncidentListResponse> {
  const searchParams = new URLSearchParams({
    sort: params.sort,
    order: params.order,
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.status.length > 0) {
    searchParams.set("status", params.status.join(","));
  }

  if (params.severity.length > 0) {
    searchParams.set("severity", params.severity.join(","));
  }

  if (params.service) {
    searchParams.set("service", params.service);
  }

  const response = await fetch(`/api/incidents?${searchParams.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data: unknown = await response.json();

  return incidentListResponseSchema.parse(data);
}
