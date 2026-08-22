import { Link, useLocation } from "react-router";

import { Badge } from "@/shared/ui/atoms/Badge";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { formatRelativeTime } from "@/shared/lib/date";

import { SEVERITY_DOT, STATUS_TONE } from "./incident-display";
import type { Incident } from "../types/incident.types";

/** The small-screen presentation of the same data the table shows. */
export function IncidentCardList({
  incidents,
  isLoading = false,
}: {
  incidents: Incident[];
  isLoading?: boolean;
}) {
  const location = useLocation();

  if (isLoading) {
    return (
      <ul className="space-y-2">
        {Array.from({ length: 6 }, (_, index) => (
          <li
            key={index}
            className="space-y-2 rounded-panel border border-border bg-surface p-4 shadow-panel"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-2">
      {incidents.map((incident) => (
        <li
          key={incident.id}
          className="rounded-panel border border-border bg-surface p-4 shadow-panel"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-xs text-foreground-subtle">
              {incident.id}
            </span>

            <Badge tone={STATUS_TONE[incident.status]} className="capitalize">
              {incident.status}
            </Badge>
          </div>

          <h3 className="mt-1 font-medium">
            <Link
              to={incident.id}
              state={{ from: location.search }}
              className="hover:underline"
            >
              {incident.title}
            </Link>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground-muted">
            <span className="inline-flex items-center gap-1.5 capitalize">
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${SEVERITY_DOT[incident.severity]}`}
              />
              {incident.severity}
            </span>

            <span>{incident.service}</span>

            <span>{incident.assignee?.name ?? "Unassigned"}</span>
          </div>

          <p className="mt-2 text-xs text-foreground-subtle">
            Updated{" "}
            <time dateTime={incident.updatedAt}>
              {formatRelativeTime(incident.updatedAt)}
            </time>
          </p>
        </li>
      ))}
    </ul>
  );
}
