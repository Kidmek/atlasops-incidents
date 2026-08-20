import type { Incident, IncidentSeverity } from "../domain/incident.js";
import type { ListIncidentsQuery } from "../validation/list-incidents-query.js";

const SEVERITY_PRIORITY: Record<IncidentSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export interface ListIncidentsResult {
  items: Incident[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

function matchesSearch(incident: Incident, searchTerm: string): boolean {
  const normalizedSearchTerm = searchTerm.toLowerCase();

  return (
    incident.id.toLowerCase().includes(normalizedSearchTerm) ||
    incident.title.toLowerCase().includes(normalizedSearchTerm) ||
    incident.service.toLowerCase().includes(normalizedSearchTerm) ||
    (incident.assignee?.name.toLowerCase().includes(normalizedSearchTerm) ??
      false)
  );
}

function compareIncidents(
  firstIncident: Incident,
  secondIncident: Incident,
  query: ListIncidentsQuery
): number {
  let comparison: number;

  switch (query.sort) {
    case "severity":
      comparison =
        SEVERITY_PRIORITY[firstIncident.severity] -
        SEVERITY_PRIORITY[secondIncident.severity];
      break;

    case "createdAt":
      comparison = firstIncident.createdAt.localeCompare(
        secondIncident.createdAt
      );
      break;

    case "updatedAt":
      comparison = firstIncident.updatedAt.localeCompare(
        secondIncident.updatedAt
      );
      break;
  }

  if (comparison === 0) {
    comparison = firstIncident.id.localeCompare(secondIncident.id);
  }

  return query.order === "asc" ? comparison : -comparison;
}

export function listIncidents(
  incidents: readonly Incident[],
  query: ListIncidentsQuery
): ListIncidentsResult {
  const selectedStatuses = new Set(query.status);
  const selectedSeverities = new Set(query.severity);

  const filteredIncidents = incidents.filter((incident) => {
    if (query.q !== undefined && !matchesSearch(incident, query.q)) {
      return false;
    }

    if (selectedStatuses.size > 0 && !selectedStatuses.has(incident.status)) {
      return false;
    }

    if (
      selectedSeverities.size > 0 &&
      !selectedSeverities.has(incident.severity)
    ) {
      return false;
    }

    if (query.service !== undefined && incident.service !== query.service) {
      return false;
    }

    return true;
  });

  filteredIncidents.sort((firstIncident, secondIncident) =>
    compareIncidents(firstIncident, secondIncident, query)
  );

  const total = filteredIncidents.length;
  const totalPages = Math.ceil(total / query.pageSize);
  const pageStart = (query.page - 1) * query.pageSize;

  return {
    items: filteredIncidents.slice(pageStart, pageStart + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages,
  };
}
