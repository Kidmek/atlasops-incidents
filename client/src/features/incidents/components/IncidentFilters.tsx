import { Button } from "@/shared/ui/atoms/Button";
import { Checkbox } from "@/shared/ui/atoms/Checkbox";
import { Input } from "@/shared/ui/atoms/Input";
import { Label } from "@/shared/ui/atoms/Label";
import { Select } from "@/shared/ui/atoms/Select";
import { useServicesQuery } from "../hooks/useIncidentsQuery";

import {
  incidentSeveritySchema,
  incidentStatusSchema,
} from "../schemas/incident.schema";
import type { IncidentListParams } from "../types/incident-list.types";

// Taken from the schemas so the filter options can never drift from the
// values the API actually accepts.
const STATUS_OPTIONS = incidentStatusSchema.options;
const SEVERITY_OPTIONS = incidentSeveritySchema.options;

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

interface IncidentFiltersProps {
  params: IncidentListParams;
  setParams: (patch: Partial<IncidentListParams>) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export function IncidentFilters({
  params,
  setParams,
  hasActiveFilters,
  clearFilters,
}: IncidentFiltersProps) {
  const servicesQuery = useServicesQuery();

  return (
    <div className="space-y-4 rounded-panel border border-border bg-surface p-4 shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="incident-search">Search</Label>
          <Input
            id="incident-search"
            type="search"
            placeholder="ID, title, service, or assignee"
            value={params.q ?? ""}
            onChange={(event) =>
              setParams({ q: event.target.value || undefined })
            }
          />
        </div>

        <div className="space-y-1.5 sm:w-56">
          <Label htmlFor="incident-service">Service</Label>
          <Select
            id="incident-service"
            value={params.service ?? ""}
            disabled={servicesQuery.isPending}
            onChange={(event) =>
              setParams({ service: event.target.value || undefined })
            }
          >
            <option value="">All services</option>
            {servicesQuery.data?.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
        <fieldset>
          <legend className="text-sm font-medium">Status</legend>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {STATUS_OPTIONS.map((status) => (
              <label
                key={status}
                className="inline-flex items-center gap-2 text-sm capitalize"
              >
                <Checkbox
                  checked={params.status.includes(status)}
                  onChange={() =>
                    setParams({ status: toggleValue(params.status, status) })
                  }
                />
                {status}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">Severity</legend>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {SEVERITY_OPTIONS.map((severity) => (
              <label
                key={severity}
                className="inline-flex items-center gap-2 text-sm capitalize"
              >
                <Checkbox
                  checked={params.severity.includes(severity)}
                  onChange={() =>
                    setParams({
                      severity: toggleValue(params.severity, severity),
                    })
                  }
                />
                {severity}
              </label>
            ))}
          </div>
        </fieldset>

        <Button
          size="sm"
          className="sm:ml-auto sm:self-end"
          disabled={!hasActiveFilters}
          onClick={clearFilters}
        >
          Clear all
        </Button>
      </div>
    </div>
  );
}
