import { toApiError } from "@/shared/api/api-error";

import {
  incidentListResponseSchema,
  servicesResponseSchema,
} from "../schemas/incident-list.schema";
import type {
  IncidentListParams,
  IncidentListResponse,
} from "../types/incident-list.types";
import { incidentSchema } from "../schemas/incident.schema";
import type { Incident } from "../types/incident.types";

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

export async function getServices(): Promise<string[]> {
  const response = await fetch("/api/services");

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data: unknown = await response.json();

  return servicesResponseSchema.parse(data).items;
}

export async function getIncident(
  incidentId: string,
  signal?: AbortSignal
): Promise<Incident> {
  // The id comes from the route, so it is encoded before it reaches the URL.
  const response = await fetch(
    `/api/incidents/${encodeURIComponent(incidentId)}`,
    { signal }
  );

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data: unknown = await response.json();

  return incidentSchema.parse(data);
}
