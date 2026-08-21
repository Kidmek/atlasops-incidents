import { Link } from "react-router";

import { Badge } from "@/shared/ui/atoms/Badge";
import { formatRelativeTime } from "@/shared/lib/date";

import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "../types/incident.types";
import { INCIDENT_TABLE_COLUMNS } from "./incident-table-columns";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { useIncidentListParams } from "../hooks/useIncidentListParams";
import type { IncidentSortField } from "../types/incident-list.types";

const STATUS_TONE: Record<
  IncidentStatus,
  "danger" | "warning" | "info" | "success"
> = {
  triggered: "danger",
  acknowledged: "warning",
  investigating: "info",
  resolved: "success",
};

const SEVERITY_DOT: Record<IncidentSeverity, string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
};

export function IncidentTable({
  incidents,
  isLoading = false,
}: {
  incidents: Incident[];
  isLoading?: boolean;
}) {
  const { params, setParams } = useIncidentListParams();

  const handleSort = (field: IncidentSortField) =>
    setParams({
      sort: field,
      order: params.sort === field && params.order === "desc" ? "asc" : "desc",
    });

  return (
    <div className="rounded-panel border border-border bg-surface shadow-panel">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">Incidents</caption>

        <colgroup>
          <col className="w-24" />
          <col />
          <col className="w-32" />
          <col className="w-36" />
          <col className="w-40" />
          <col className="w-40" />
          <col className="w-32" />
        </colgroup>

        <thead className="bg-surface-subtle text-foreground-muted">
          <tr>
            {INCIDENT_TABLE_COLUMNS.map((column) => {
              const sortField =
                "sortField" in column ? column.sortField : undefined;

              if (sortField === undefined) {
                return (
                  <th key={column.key} scope="col" className="px-3 py-2">
                    {column.label}
                  </th>
                );
              }

              const isActive = params.sort === sortField;

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    isActive
                      ? params.order === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => handleSort(sortField)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {column.label}
                    <span aria-hidden="true">
                      {isActive ? (params.order === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: 10 }, (_, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border">
                  {INCIDENT_TABLE_COLUMNS.map((column) => (
                    <td key={column.key} className="px-3 py-2.5">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-t border-border hover:bg-surface-subtle"
                >
                  <td className="truncate px-3 py-2.5 font-mono text-xs text-foreground-subtle">
                    {incident.id}
                  </td>

                  <td className="px-3 py-2.5 font-medium">
                    <Link
                      to={incident.id}
                      className="block truncate hover:underline"
                    >
                      {incident.title}
                    </Link>
                  </td>

                  <td className="px-3 py-2.5 capitalize">
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${
                          SEVERITY_DOT[incident.severity]
                        }`}
                      />
                      {incident.severity}
                    </span>
                  </td>

                  <td className="px-3 py-2.5">
                    <Badge
                      tone={STATUS_TONE[incident.status]}
                      className="capitalize"
                    >
                      {incident.status}
                    </Badge>
                  </td>

                  <td className="truncate px-3 py-2.5">{incident.service}</td>

                  <td className="truncate px-3 py-2.5">
                    {incident.assignee?.name ?? (
                      <span className="text-foreground-subtle">Unassigned</span>
                    )}
                  </td>

                  <td className="truncate px-3 py-2.5 text-foreground-muted">
                    <time dateTime={incident.createdAt}>
                      {formatRelativeTime(incident.createdAt)}
                    </time>
                  </td>

                  <td className="truncate px-3 py-2.5 text-foreground-muted">
                    <time dateTime={incident.updatedAt}>
                      {formatRelativeTime(incident.updatedAt)}
                    </time>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
