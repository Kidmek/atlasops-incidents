import { useMemo } from "react";

import { ApiError } from "@/shared/api/api-error";
import { Button } from "@/shared/ui/atoms/Button";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

import { IncidentTable } from "../components/IncidentTable";
import { useIncidentListParams } from "../hooks/useIncidentListParams";
import { useIncidentsQuery } from "../hooks/useIncidentsQuery";
import { IncidentFilters } from "../components/IncidentFilters";
import { Pagination } from "@/shared/ui/molecules/Pagination";

export function IncidentListPage() {
  const { params, setParams, hasActiveFilters, clearFilters } =
    useIncidentListParams();
  const debouncedSearch = useDebouncedValue(params.q, 300);

  const queryParams = useMemo(
    () => ({ ...params, q: debouncedSearch }),
    [params, debouncedSearch]
  );

  const incidentsQuery = useIncidentsQuery(queryParams);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Incidents</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Monitor, prioritize, and manage service incidents.
        </p>
      </header>

      <IncidentFilters
        params={params}
        setParams={setParams}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      <section aria-label="Incident list" className="space-y-3">
        {incidentsQuery.isError && (
          <div
            role="alert"
            className="rounded-panel border border-danger-border bg-danger-subtle p-4"
          >
            <p className="text-sm text-danger">
              {incidentsQuery.error instanceof ApiError
                ? incidentsQuery.error.message
                : "Incidents could not be loaded. Check your connection."}
            </p>

            <Button
              size="sm"
              className="mt-3"
              onClick={() => void incidentsQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        )}

        {incidentsQuery.isPending && <IncidentTable incidents={[]} isLoading />}

        {incidentsQuery.data && (
          <>
            <p aria-live="polite" className="text-sm text-foreground-muted">
              {incidentsQuery.data.total} incident
              {incidentsQuery.data.total === 1 ? "" : "s"}
              {incidentsQuery.isFetching && " · refreshing…"}
            </p>

            {incidentsQuery.data.items.length === 0 ? (
              <div className="rounded-panel border border-border bg-surface p-8 text-center">
                <p className="text-sm font-medium">
                  {hasActiveFilters
                    ? "No incidents match these filters."
                    : "No incidents yet."}
                </p>

                {hasActiveFilters && (
                  <Button size="sm" className="mt-3" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div
                  aria-busy={incidentsQuery.isPlaceholderData}
                  className={
                    incidentsQuery.isPlaceholderData ? "opacity-60" : undefined
                  }
                >
                  <IncidentTable incidents={incidentsQuery.data.items} />
                </div>
                <Pagination
                  page={incidentsQuery.data.page}
                  pageSize={incidentsQuery.data.pageSize}
                  total={incidentsQuery.data.total}
                  totalPages={incidentsQuery.data.totalPages}
                  onPageChange={(page) => setParams({ page })}
                />
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
