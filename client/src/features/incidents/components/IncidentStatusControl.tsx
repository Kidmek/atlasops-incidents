import { ApiError } from "@/shared/api/api-error";
import { Button } from "@/shared/ui/atoms/Button";

import { useUpdateIncidentStatus } from "../hooks/useIncidentsMutation";
import type { Incident, IncidentStatus } from "../types/incident.types";

/** Mirrors the transitions the server accepts; anything else earns a 400. */
const NEXT_STATUSES: Record<IncidentStatus, readonly IncidentStatus[]> = {
  triggered: ["acknowledged"],
  acknowledged: ["investigating"],
  investigating: ["resolved"],
  resolved: ["investigating"],
};

export function IncidentStatusControl({ incident }: { incident: Incident }) {
  const mutation = useUpdateIncidentStatus(incident.id);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {NEXT_STATUSES[incident.status].map((status) => (
          <Button
            key={status}
            variant="primary"
            size="sm"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({ status, version: incident.version })
            }
          >
            {mutation.isPending ? "Updating…" : `Mark as ${status}`}
          </Button>
        ))}
      </div>

      <p aria-live="polite" className="min-h-5 text-sm">
        {mutation.isError ? (
          <span className="text-danger">
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : "The status could not be updated."}
          </span>
        ) : mutation.isSuccess ? (
          <span className="text-success">Status updated.</span>
        ) : null}
      </p>
    </div>
  );
}
