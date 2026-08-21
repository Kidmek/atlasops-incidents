import { z } from "zod";

export type FieldErrors = Record<string, string[]>;

/**
 * The error body the mock API returns. It is untrusted input, so it is parsed
 * rather than cast.
 */
const apiErrorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
  fieldErrors: z.record(z.array(z.string())).optional(),
});

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldErrors | undefined;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: FieldErrors
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Builds an ApiError from a failed Response. An unreadable or unexpected body
 * falls back to a safe generic message so nothing internal reaches the user.
 */
export async function toApiError(response: Response): Promise<ApiError> {
  const fallback = new ApiError(
    response.status,
    "UNKNOWN_ERROR",
    `The request failed (${response.status}).`
  );

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return fallback;
  }

  const parsed = apiErrorBodySchema.safeParse(body);

  if (!parsed.success) {
    return fallback;
  }

  return new ApiError(
    response.status,
    parsed.data.code,
    parsed.data.message,
    parsed.data.fieldErrors
  );
}
