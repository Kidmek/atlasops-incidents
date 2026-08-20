import type { Incident } from "../domain/incident.js";
import { generateIncidents } from "./generate-incidents.js";

function cloneIncident(incident: Incident): Incident {
  return structuredClone(incident);
}

export class IncidentStore {
  private readonly incidentsById = new Map<string, Incident>();

  constructor(initialIncidents: readonly Incident[] = generateIncidents()) {
    for (const incident of initialIncidents) {
      this.incidentsById.set(incident.id, cloneIncident(incident));
    }
  }

  get size(): number {
    return this.incidentsById.size;
  }

  getAll(): Incident[] {
    return Array.from(this.incidentsById.values(), cloneIncident);
  }

  getById(incidentId: string): Incident | undefined {
    const incident = this.incidentsById.get(incidentId);

    return incident === undefined ? undefined : cloneIncident(incident);
  }

  create(incident: Incident): Incident {
    if (this.incidentsById.has(incident.id)) {
      throw new Error(`Incident ${incident.id} already exists`);
    }

    const storedIncident = cloneIncident(incident);
    this.incidentsById.set(storedIncident.id, storedIncident);

    return cloneIncident(storedIncident);
  }

  update(incident: Incident): Incident | undefined {
    if (!this.incidentsById.has(incident.id)) {
      return undefined;
    }

    const storedIncident = cloneIncident(incident);
    this.incidentsById.set(storedIncident.id, storedIncident);

    return cloneIncident(storedIncident);
  }
}

export const incidentStore = new IncidentStore();
