import { ApiError } from "@/shared/api/api-error";
import { Label } from "@/shared/ui/atoms/Label";
import { Select } from "@/shared/ui/atoms/Select";

import { useAssignIncident } from "../hooks/useIncidentsMutation";
import { useUsersQuery } from "../hooks/useIncidentsQuery";
import type { Incident } from "../types/incident.types";

export function IncidentAssigneeControl({ incident }: { incident: Incident }) {
  const usersQuery = useUsersQuery();
  const mutation = useAssignIncident(incident.id);

  return (
    <div className="space-y-1.5 sm:max-w-xs">
      <Label htmlFor="incident-assignee">Assignee</Label>

      <Select
        id="incident-assignee"
        value={incident.assignee?.id ?? ""}
        disabled={usersQuery.isPending || mutation.isPending}
        onChange={(event) =>
          mutation.mutate(
            usersQuery.data?.find((user) => user.id === event.target.value) ??
              null
          )
        }
      >
        <option value="">Unassigned</option>
        {usersQuery.data?.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </Select>

      <p aria-live="polite" className="text-sm text-center">
        {mutation.isError ? (
          <span className="text-danger">
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : "The assignee could not be updated."}
          </span>
        ) : mutation.isSuccess ? (
          <span className="text-success">Assignee updated.</span>
        ) : null}
      </p>
    </div>
  );
}
