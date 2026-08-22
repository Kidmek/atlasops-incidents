import { Link, useLocation, useParams } from "react-router";

import { ApiError } from "@/shared/api/api-error";
import { Badge } from "@/shared/ui/atoms/Badge";
import { Button } from "@/shared/ui/atoms/Button";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { formatRelativeTime } from "@/shared/lib/date";

import { useIncidentQuery } from "../hooks/useIncidentsQuery";
import { STATUS_TONE, SEVERITY_TONE } from "../components/incident-display";
import { IncidentStatusControl } from "../components/IncidentStatusControl";
import { IncidentAssigneeControl } from "../components/IncidentAssigneeControl";
import { IncidentNoteForm } from "../components/IncidentNoteForm";

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-72" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-28 w-full rounded-panel" />
          <Skeleton className="h-48 w-full rounded-panel" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-panel" />
          <Skeleton className="h-36 w-full rounded-panel" />
        </div>
      </div>
    </div>
  );
}

export function IncidentDetailPage() {
  const { incidentId = "" } = useParams();
  const location = useLocation();
  const incidentQuery = useIncidentQuery(incidentId);

  // The list search string is handed over in link state so the back link
  // restores filters, sort, and page. Browser Back does this on its own.
  const backTo = {
    pathname: "/incidents",
    search: (location.state as { from?: string } | null)?.from ?? "",
  };

  const notFound =
    incidentQuery.error instanceof ApiError &&
    incidentQuery.error.status === 404;

  return (
    <div className="space-y-6">
      <Link
        to={backTo}
        className="inline-block text-sm text-foreground-muted hover:underline"
      >
        ← Back to incidents
      </Link>

      {incidentQuery.isPending && <DetailSkeleton />}

      {incidentQuery.isError && (
        <div
          role="alert"
          className="rounded-panel border border-danger bg-danger-subtle p-4"
        >
          <p className="text-sm text-danger">
            {notFound
              ? "This incident does not exist. It may have been removed."
              : incidentQuery.error instanceof ApiError
              ? incidentQuery.error.message
              : "This incident could not be loaded. Check your connection."}
          </p>

          {!notFound && (
            <Button
              size="sm"
              className="mt-3"
              onClick={() => void incidentQuery.refetch()}
            >
              Try again
            </Button>
          )}
        </div>
      )}

      {incidentQuery.data && (
        <article className="space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-xs text-foreground-subtle">
                {incidentQuery.data.id}
              </p>

              <h1 className="text-2xl font-semibold tracking-tight">
                {incidentQuery.data.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  tone={STATUS_TONE[incidentQuery.data.status]}
                  className="capitalize"
                >
                  {incidentQuery.data.status}
                </Badge>
                <Badge
                  tone={SEVERITY_TONE[incidentQuery.data.severity]}
                  className="capitalize"
                >
                  {incidentQuery.data.severity} severity
                </Badge>
              </div>
            </div>

            <IncidentStatusControl incident={incidentQuery.data} />
          </header>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="space-y-2 rounded-panel border border-border bg-surface p-4 shadow-panel">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="whitespace-pre-wrap text-sm text-foreground-muted">
                  {incidentQuery.data.description}
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold">
                  Notes ({incidentQuery.data.notes.length})
                </h2>

                {incidentQuery.data.notes.length === 0 ? (
                  <p className="text-sm text-foreground-muted">No notes yet.</p>
                ) : (
                  <ol className="space-y-3">
                    {[...incidentQuery.data.notes]
                      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                      .map((note) => (
                        <li
                          key={note.id}
                          className="rounded-panel border border-border bg-surface p-3 shadow-panel"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-sm font-medium">
                              {note.author.name}
                            </span>
                            <time
                              dateTime={note.createdAt}
                              className="text-xs text-foreground-subtle"
                            >
                              {formatRelativeTime(note.createdAt)}
                            </time>
                          </div>

                          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground-muted">
                            {note.message}
                          </p>
                        </li>
                      ))}
                  </ol>
                )}

                <IncidentNoteForm incidentId={incidentId} />
              </section>
            </div>

            <aside className="space-y-4">
              <div className="rounded-panel border border-border bg-surface p-4 shadow-panel">
                <IncidentAssigneeControl incident={incidentQuery.data} />
              </div>

              <dl className="space-y-3 rounded-panel border border-border bg-surface p-4 shadow-panel">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground-subtle">
                    Service
                  </dt>
                  <dd className="mt-1 text-sm">{incidentQuery.data.service}</dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground-subtle">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm">
                    <time dateTime={incidentQuery.data.createdAt}>
                      {formatRelativeTime(incidentQuery.data.createdAt)}
                    </time>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground-subtle">
                    Updated
                  </dt>
                  <dd className="mt-1 text-sm">
                    <time dateTime={incidentQuery.data.updatedAt}>
                      {formatRelativeTime(incidentQuery.data.updatedAt)}
                    </time>
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </article>
      )}
    </div>
  );
}
