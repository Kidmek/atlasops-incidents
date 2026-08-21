import { z } from "zod";

import {
  incidentSchema,
  incidentSeveritySchema,
  incidentStatusSchema,
} from "./incident.schema";

export const incidentListResponseSchema = z.object({
  items: z.array(incidentSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const incidentListParamsSchema = z.object({
  q: z.string().trim().min(1).max(200).optional().catch(undefined),
  status: z.array(incidentStatusSchema).default([]).catch([]),
  severity: z.array(incidentSeveritySchema).default([]).catch([]),
  service: z.string().trim().min(1).max(100).optional().catch(undefined),
  sort: z
    .enum(["updatedAt", "severity", "createdAt"])
    .default("updatedAt")
    .catch("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc").catch("desc"),
  page: z.coerce.number().int().min(1).default(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25).catch(25),
});

export const servicesResponseSchema = z.object({ items: z.array(z.string()) });
