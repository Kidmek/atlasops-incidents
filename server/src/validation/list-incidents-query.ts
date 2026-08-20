import * as z from "zod";

import { INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "../domain/incident.js";
import { SERVICES } from "../data/reference-data.js";

function splitCommaSeparated(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOptionalString(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue === "" ? undefined : normalizedValue;
}

function parseInteger(value: unknown): unknown {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return value;
  }

  return Number(value);
}

const statusFilterSchema = z.preprocess(
  splitCommaSeparated,
  z.array(z.enum(INCIDENT_STATUSES)).default([])
);

const severityFilterSchema = z.preprocess(
  splitCommaSeparated,
  z.array(z.enum(INCIDENT_SEVERITIES)).default([])
);

const serviceFilterSchema = z.preprocess(
  normalizeOptionalString,
  z.enum(SERVICES).optional()
);

const searchSchema = z.preprocess(
  normalizeOptionalString,
  z.string().max(200).optional()
);

const pageSchema = z.preprocess(
  parseInteger,
  z.number().int().min(1).default(1)
);

const pageSizeSchema = z.preprocess(
  parseInteger,
  z.number().int().min(1).max(100).default(25)
);

export const listIncidentsQuerySchema = z.object({
  q: searchSchema,
  status: statusFilterSchema,
  severity: severityFilterSchema,
  service: serviceFilterSchema,
  sort: z.enum(["updatedAt", "severity", "createdAt"]).default("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export type ListIncidentsQuery = z.infer<typeof listIncidentsQuerySchema>;
