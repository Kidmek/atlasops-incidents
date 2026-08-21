import { useSearchParams } from "react-router";

import { incidentListParamsSchema } from "../schemas/incident-list.schema";
import type { IncidentListParams } from "../types/incident-list.types";

export function useIncidentListParams(): IncidentListParams {
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");
  const severity = searchParams.get("severity");

  return incidentListParamsSchema.parse({
    q: searchParams.get("q") ?? undefined,
    status: status
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    severity: severity
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    service: searchParams.get("service") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    order: searchParams.get("order") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}
