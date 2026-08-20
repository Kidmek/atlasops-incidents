import { ApiError } from "../errors/api-error.js";
import type {
  Incident,
  IncidentNote,
  IncidentStatus,
} from "../domain/incident.js";
import { IncidentStore } from "../data/incident-store.js";
import { CURRENT_USER, USERS } from "../data/reference-data.js";
import type { ListIncidentsQuery } from "../validation/list-incidents-query.js";
import type {
  AddNoteInput,
  AssignIncidentInput,
  CreateIncidentInput,
  UpdateStatusInput,
} from "../validation/incident-mutations.js";
import { listIncidents, type ListIncidentsResult } from "./list-incidents.js";

const ALLOWED_STATUS_TRANSITIONS: Record<
  IncidentStatus,
  readonly IncidentStatus[]
> = {
  triggered: ["acknowledged"],
  acknowledged: ["investigating"],
  investigating: ["resolved"],
  resolved: ["investigating"],
};

type Clock = () => Date;

export interface UpdateStatusResult {
  id: string;
  status: IncidentStatus;
  updatedAt: string;
  version: number;
}

export class IncidentService {
  constructor(
    private readonly store: IncidentStore,
    private readonly now: Clock = () => new Date()
  ) {}

  list(query: ListIncidentsQuery): ListIncidentsResult {
    return listIncidents(this.store.getAll(), query);
  }

  getById(incidentId: string): Incident {
    const incident = this.store.getById(incidentId);

    if (incident === undefined) {
      throw new ApiError(
        404,
        "INCIDENT_NOT_FOUND",
        "The requested incident does not exist."
      );
    }

    return incident;
  }

  create(input: CreateIncidentInput): Incident {
    const assignee = this.findAssignee(input.assigneeId ?? null);
    const timestamp = this.now().toISOString();
    const incident: Incident = {
      id: this.nextIncidentId(),
      title: input.title,
      description: input.description,
      status: input.status,
      severity: input.severity,
      service: input.service,
      assignee,
      createdAt: timestamp,
      updatedAt: timestamp,
      notes: [],
      version: 1,
    };

    return this.store.create(incident);
  }

  updateStatus(
    incidentId: string,
    input: UpdateStatusInput
  ): UpdateStatusResult {
    const incident = this.getById(incidentId);

    if (input.version !== undefined && input.version !== incident.version) {
      throw new ApiError(
        409,
        "INCIDENT_VERSION_CONFLICT",
        "The incident was changed by another user.",
        { details: { currentVersion: incident.version } }
      );
    }

    if (!ALLOWED_STATUS_TRANSITIONS[incident.status].includes(input.status)) {
      throw new ApiError(
        400,
        "INVALID_STATUS_TRANSITION",
        `Cannot change status from ${incident.status} to ${input.status}.`,
        { fieldErrors: { status: ["Select a valid next status."] } }
      );
    }

    incident.status = input.status;
    incident.updatedAt = this.now().toISOString();
    incident.version += 1;
    this.store.update(incident);

    return {
      id: incident.id,
      status: incident.status,
      updatedAt: incident.updatedAt,
      version: incident.version,
    };
  }

  assign(
    incidentId: string,
    input: AssignIncidentInput
  ): Incident {
    const incident = this.getById(incidentId);
    incident.assignee = this.findAssignee(input.assigneeId);
    incident.updatedAt = this.now().toISOString();
    incident.version += 1;
    this.store.update(incident);

    return incident;
  }

  addNote(incidentId: string, input: AddNoteInput): IncidentNote {
    const incident = this.getById(incidentId);
    const timestamp = this.now().toISOString();
    const note: IncidentNote = {
      id: this.nextNoteId(),
      incidentId,
      author: CURRENT_USER,
      message: input.message,
      createdAt: timestamp,
    };

    incident.notes.push(note);
    incident.updatedAt = timestamp;
    incident.version += 1;
    this.store.update(incident);

    return structuredClone(note);
  }

  private findAssignee(assigneeId: string | null) {
    if (assigneeId === null) {
      return null;
    }

    const assignee = USERS.find((user) => user.id === assigneeId);

    if (assignee === undefined) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "The submitted assignee is invalid.",
        { fieldErrors: { assigneeId: ["Select a valid assignee."] } }
      );
    }

    return structuredClone(assignee);
  }

  private nextIncidentId(): string {
    const highestId = this.store
      .getAll()
      .reduce((highestValue, incident) => {
        const numericId = Number.parseInt(incident.id.replace("INC-", ""), 10);
        return Number.isNaN(numericId)
          ? highestValue
          : Math.max(highestValue, numericId);
      }, 1_000);

    return `INC-${highestId + 1}`;
  }

  private nextNoteId(): string {
    const highestId = this.store
      .getAll()
      .flatMap((incident) => incident.notes)
      .reduce((highestValue, note) => {
        const numericId = Number.parseInt(note.id.replace("note-", ""), 10);
        return Number.isNaN(numericId)
          ? highestValue
          : Math.max(highestValue, numericId);
      }, 0);

    return `note-${highestId + 1}`;
  }
}
