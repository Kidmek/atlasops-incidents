import * as z from "zod";

import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
} from "../domain/incident.js";
import { SERVICES } from "../data/reference-data.js";

export const createIncidentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Title must contain at least 5 characters.")
      .max(120, "Title must contain at most 120 characters."),
    description: z
      .string()
      .trim()
      .min(20, "Description must contain at least 20 characters.")
      .max(2_000, "Description must contain at most 2,000 characters."),
    severity: z.enum(INCIDENT_SEVERITIES),
    service: z.enum(SERVICES),
    assigneeId: z.string().trim().min(1).nullable().optional(),
    status: z.enum(INCIDENT_STATUSES),
  })
  .strict();

export const updateStatusSchema = z
  .object({
    status: z.enum(INCIDENT_STATUSES),
    version: z.number().int().positive().optional(),
  })
  .strict();

export const assignIncidentSchema = z
  .object({
    assigneeId: z.string().trim().min(1).nullable(),
  })
  .strict();

export const addNoteSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, "Note must not be empty.")
      .max(2_000, "Note must contain at most 2,000 characters."),
  })
  .strict();

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignIncidentInput = z.infer<typeof assignIncidentSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
