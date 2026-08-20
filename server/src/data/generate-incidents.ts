import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  type Incident,
  type IncidentNote,
} from "../domain/incident.js";
import { SERVICES, USERS } from "./reference-data.js";

const DEFAULT_INCIDENT_COUNT = 1_043;
const REFERENCE_TIME_MS = Date.parse("2026-08-01T12:00:00.000Z");
const MINUTE_IN_MS = 60_000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;

const INCIDENT_SCENARIOS = [
  {
    title: "Elevated payment failure rate",
    description:
      "Payment authorization failures are above the normal operating threshold.",
  },
  {
    title: "Checkout latency increased",
    description:
      "Checkout response times have exceeded the expected service-level threshold.",
  },
  {
    title: "Intermittent authentication errors",
    description:
      "Some customers are receiving unexpected errors while signing in.",
  },
  {
    title: "Notification delivery backlog",
    description:
      "The notification worker queue is growing faster than messages are processed.",
  },
  {
    title: "Delayed reporting data",
    description:
      "New reporting data is taking longer than expected to become available.",
  },
  {
    title: "Order processing failures",
    description:
      "A subset of newly submitted orders cannot complete processing successfully.",
  },
  {
    title: "Customer portal unavailable",
    description:
      "The customer portal is returning unavailable responses for some requests.",
  },
  {
    title: "Inventory synchronization lag",
    description:
      "Inventory changes are not propagating to downstream services quickly enough.",
  },
  {
    title: "Search results incomplete",
    description:
      "Search responses are missing some recently indexed customer records.",
  },
  {
    title: "Billing jobs timing out",
    description:
      "Scheduled billing jobs are exceeding their maximum execution time.",
  },
] as const;

const NOTE_MESSAGES = [
  "Initial investigation is underway and service metrics are being reviewed.",
  "The issue appears limited to one deployment region.",
  "Recent deployment changes are being compared with the failure timeline.",
  "The affected worker pool has been restarted and recovery is being monitored.",
  "Error rates are decreasing, but the incident remains under observation.",
] as const;

function pickByIndex<T>(values: readonly T[], index: number): T {
  const value = values[index % values.length];

  if (value === undefined) {
    throw new Error("Cannot select a value from an empty collection");
  }

  return value;
}

function createNotes(
  incidentId: string,
  index: number,
  createdAtMs: number,
  updatedAtMs: number
): IncidentNote[] {
  if (index % 8 !== 0) {
    return [];
  }

  const noteCreatedAtMs =
    createdAtMs + Math.floor((updatedAtMs - createdAtMs) / 2);

  return [
    {
      id: `note-${index + 1}`,
      incidentId,
      author: pickByIndex(USERS, index + 2),
      message: pickByIndex(NOTE_MESSAGES, index),
      createdAt: new Date(noteCreatedAtMs).toISOString(),
    },
  ];
}

export function generateIncidents(count = DEFAULT_INCIDENT_COUNT): Incident[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("Incident count must be a non-negative integer");
  }

  return Array.from({ length: count }, (_, index) => {
    const incidentId = `INC-${String(1_001 + index).padStart(4, "0")}`;

    const createdAtMs = REFERENCE_TIME_MS - (index + 1) * 6 * HOUR_IN_MS;

    const updatedAtMs = createdAtMs + ((index % 8) + 1) * 30 * MINUTE_IN_MS;

    const scenario = pickByIndex(INCIDENT_SCENARIOS, index);

    return {
      id: incidentId,
      title: scenario.title,
      description: scenario.description,
      status: pickByIndex(INCIDENT_STATUSES, index),
      severity: pickByIndex(
        INCIDENT_SEVERITIES,
        Math.floor(index / INCIDENT_STATUSES.length)
      ),
      service: pickByIndex(
        SERVICES,
        Math.floor(
          index / (INCIDENT_STATUSES.length * INCIDENT_SEVERITIES.length)
        )
      ),
      assignee: index % 6 === 0 ? null : pickByIndex(USERS, index),
      createdAt: new Date(createdAtMs).toISOString(),
      updatedAt: new Date(updatedAtMs).toISOString(),
      notes: createNotes(incidentId, index, createdAtMs, updatedAtMs),
      version: (index % 8) + 1,
    };
  });
}
