import { useMemo } from "react";
import { useSearchParams } from "react-router";

import { incidentListParamsSchema } from "../schemas/incident-list.schema";
import type { IncidentListParams } from "../types/incident-list.types";

const DEFAULT_PARAMS = incidentListParamsSchema.parse({});

/** URL values are untrusted, so unknown values fall back via the schema's .catch(). */
export function parseListParams(
  searchParams: URLSearchParams
): IncidentListParams {
  return incidentListParamsSchema.parse({
    q: searchParams.get("q") ?? undefined,
    status:
      searchParams
        .get("status")
        ?.split(",")
        .map((value) => value.trim())
        .filter(Boolean) ?? [],
    severity:
      searchParams
        .get("severity")
        ?.split(",")
        .map((value) => value.trim())
        .filter(Boolean) ?? [],
    service: searchParams.get("service") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    order: searchParams.get("order") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

/** Defaults are omitted so a clean list stays at `/incidents`, not a wall of query string. */
export function serializeListParams(
  params: IncidentListParams
): URLSearchParams {
  const searchParams = new URLSearchParams();

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

  if (params.sort !== DEFAULT_PARAMS.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.order !== DEFAULT_PARAMS.order) {
    searchParams.set("order", params.order);
  }

  if (params.page !== DEFAULT_PARAMS.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== DEFAULT_PARAMS.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  return searchParams;
}

export function useIncidentListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => parseListParams(searchParams), [searchParams]);

  const setParams = (patch: Partial<IncidentListParams>) => {
    setSearchParams(
      (current) => {
        const next = { ...parseListParams(current), ...patch };

        if (patch.page === undefined) {
          next.page = 1;
        }

        return serializeListParams(next);
      },
      { replace: true }
    );
  };

  const hasActiveFilters =
    Boolean(params.q) ||
    Boolean(params.service) ||
    params.status.length > 0 ||
    params.severity.length > 0;

  const clearFilters = () =>
    setParams({ q: undefined, service: undefined, status: [], severity: [] });

  return { params, setParams, hasActiveFilters, clearFilters };
}
