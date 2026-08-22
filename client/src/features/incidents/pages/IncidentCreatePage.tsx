import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";

import { ApiError } from "@/shared/api/api-error";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Select } from "@/shared/ui/atoms/Select";
import { Textarea } from "@/shared/ui/atoms/Textarea";
import { FormField } from "@/shared/ui/molecules/FormField";

import { useCreateIncident } from "../hooks/useIncidentsMutation";
import { useServicesQuery, useUsersQuery } from "../hooks/useIncidentsQuery";
import {
  createIncidentSchema,
  incidentSeveritySchema,
  incidentStatusSchema,
} from "../schemas/incident.schema";
import type { CreateIncident } from "../types/incident.types";

export function IncidentCreatePage() {
  const navigate = useNavigate();
  const servicesQuery = useServicesQuery();
  const usersQuery = useUsersQuery();
  const mutation = useCreateIncident();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<CreateIncident>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "high",
      service: "",
      assigneeId: "",
      status: "triggered",
    },
  });

  const backTo = {
    pathname: "/incidents",
    search: (location.state as { from?: string } | null)?.from ?? "",
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const incident = await mutation.mutateAsync(values);
      navigate(`/incidents/${incident.id}`, { replace: true });
    } catch (error) {
      // The server's field names match the form's, so they map straight over.
      if (error instanceof ApiError && error.fieldErrors) {
        const fields = Object.keys(
          error.fieldErrors
        ) as (keyof CreateIncident)[];

        for (const field of fields) {
          setError(field, { message: error.fieldErrors[field]?.[0] });
        }

        if (fields[0]) {
          setFocus(fields[0]);
        }
      }
      // Anything else is surfaced by the summary below.
    }
  });

  const isBusy = isSubmitting || mutation.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={backTo}
        className="inline-block text-sm text-foreground-muted hover:underline"
      >
        ← Back to incidents
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">New incident</h1>

      {mutation.isError && (
        <div
          role="alert"
          className="rounded-panel border border-danger bg-danger-subtle p-4 text-sm text-danger"
        >
          {mutation.error instanceof ApiError
            ? mutation.error.message
            : "The incident could not be created. Check your connection."}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FormField label="Title" required error={errors.title?.message}>
          {(field) => <Input {...field} {...register("title")} />}
        </FormField>

        <FormField
          label="Description"
          required
          error={errors.description?.message}
        >
          {(field) => (
            <Textarea rows={5} {...field} {...register("description")} />
          )}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Severity" required error={errors.severity?.message}>
            {(field) => (
              <Select
                {...field}
                {...register("severity")}
                className="capitalize"
              >
                {incidentSeveritySchema.options.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField
            label="Initial status"
            required
            error={errors.status?.message}
          >
            {(field) => (
              <Select {...field} {...register("status")} className="capitalize">
                {incidentStatusSchema.options.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField label="Service" required error={errors.service?.message}>
            {(field) => (
              <Select
                {...field}
                {...register("service")}
                disabled={servicesQuery.isPending}
              >
                <option value="">Select a service</option>
                {servicesQuery.data?.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField label="Assignee" error={errors.assigneeId?.message}>
            {(field) => (
              <Select
                {...field}
                {...register("assigneeId")}
                disabled={usersQuery.isPending}
              >
                <option value="">Unassigned</option>
                {usersQuery.data?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>

        <Button
          className="w-full sm:w-auto"
          type="submit"
          variant="primary"
          disabled={isBusy}
        >
          {isBusy ? "Creating…" : "Create incident"}
        </Button>
      </form>
    </div>
  );
}
