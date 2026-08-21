import { useIncidentListParams } from "../hooks/useIncidentListParams";
import { useIncidentsQuery } from "../hooks/useIncidentsQuery";

export function IncidentListPage() {
  const params = useIncidentListParams();
  const incidentsQuery = useIncidentsQuery(params);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-slate-500">Operations</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Incidents
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor, prioritize, and manage service incidents.
        </p>
      </header>

      <section aria-label="Incident list">
        {incidentsQuery.isPending && (
          <p className="text-sm text-slate-600">Loading incidents…</p>
        )}

        {incidentsQuery.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {incidentsQuery.error.message}
            </p>

            <button
              type="button"
              className="mt-3 text-sm font-medium text-red-700 underline"
              onClick={() => void incidentsQuery.refetch()}
            >
              Try again
            </button>
          </div>
        )}

        {incidentsQuery.isSuccess && incidentsQuery.data.items.length === 0 && (
          <p className="text-sm text-slate-600">No incidents found.</p>
        )}

        {incidentsQuery.isSuccess && incidentsQuery.data.items.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {incidentsQuery.data.total} incidents
            </p>

            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {incidentsQuery.data.items.map((incident) => (
                <li key={incident.id} className="p-4">
                  <h2 className="font-medium text-slate-950">
                    {incident.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    {incident.service} · {incident.severity} · {incident.status}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
