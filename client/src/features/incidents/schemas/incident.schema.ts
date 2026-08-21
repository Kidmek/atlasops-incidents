import { z } from "zod";

export const incidentStatusSchema = z.enum([
  "triggered",
  "acknowledged",
  "investigating",
  "resolved",
]);

export const incidentSeveritySchema = z.enum([
  "critical",
  "high",
  "medium",
  "low",
]);

export const userSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
});

export const incidentNoteSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  author: userSummarySchema,
  message: z.string(),
  createdAt: z.string().datetime(),
});

export const incidentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: incidentStatusSchema,
  severity: incidentSeveritySchema,
  service: z.string(),
  assignee: userSummarySchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  notes: z.array(incidentNoteSchema),
  version: z.number().int().positive(),
});
