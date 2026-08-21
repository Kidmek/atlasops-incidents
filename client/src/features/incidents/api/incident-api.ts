import { toApiError } from "@/shared/api/api-error";

import {
  incidentListResponseSchema,
  servicesResponseSchema,
  usersResponseSchema,
} from "../schemas/incident-list.schema";
import type {
  IncidentListParams,
  IncidentListResponse,
} from "../types/incident-list.types";
import {
  incidentSchema,
  incidentStatusUpdateSchema,
  incidentNoteSchema,
} from "../schemas/incident.schema";
import type {
  CreateIncident,
  Incident,
  IncidentNote,
  IncidentStatus,
  IncidentStatusUpdate,
  UserSummary,
} from "../types/incident.types";

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

export async function updateIncidentStatus(
  incidentId: string,
  input: {
    status: IncidentStatus;
    version: number;
  }
): Promise<IncidentStatusUpdate> {
  const response = await fetch(
    `/api/incidents/${encodeURIComponent(incidentId)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data: unknown = await response.json();

  return incidentStatusUpdateSchema.parse(data);
}

export async function getUsers(signal?: AbortSignal): Promise<UserSummary[]> {
  const response = await fetch("/api/users", { signal });

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data: unknown = await response.json();

  return usersResponseSchema.parse(data).items;
}

export async function assignIncident(
  incidentId: string,
  assigneeId: string | null
): Promise<Incident> {
  const response = await fetch(
    `/api/incidents/${encodeURIComponent(incidentId)}/assignee`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId }),
    }
  );

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data: unknown = await response.json();

  return incidentSchema.parse(data);
}

export async function addIncidentNote(
  incidentId: string,
  message: string
): Promise<IncidentNote> {
  const response = await fetch(
    `/api/incidents/${encodeURIComponent(incidentId)}/notes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data: unknown = await response.json();

  return incidentNoteSchema.parse(data);
}

export async function createIncident(input: CreateIncident): Promise<Incident> {
  const response = await fetch("/api/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      // The form uses "" for unassigned; the server wants null.
      assigneeId: input.assigneeId || null,
    }),
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data: unknown = await response.json();

  return incidentSchema.parse(data);
}
