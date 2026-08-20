import * as z from "zod";

import { ApiError, type FieldErrors } from "../errors/api-error.js";

function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const fieldName = String(issue.path[0] ?? "request");
    const messages = fieldErrors[fieldName] ?? [];
    messages.push(issue.message);
    fieldErrors[fieldName] = messages;
  }

  return fieldErrors;
}

export function parseRequest<T>(
  schema: z.ZodType<T>,
  input: unknown,
  message: string
): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new ApiError(400, "VALIDATION_ERROR", message, {
      fieldErrors: toFieldErrors(result.error),
    });
  }

  return result.data;
}
