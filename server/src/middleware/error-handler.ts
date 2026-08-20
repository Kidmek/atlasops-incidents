import type { ErrorRequestHandler, RequestHandler } from "express";

import { ApiError } from "../errors/api-error.js";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    code: "ROUTE_NOT_FOUND",
    message: "The requested API route does not exist.",
  });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (error instanceof ApiError) {
    const body: Record<string, unknown> = {
      code: error.code,
      message: error.message,
    };

    if (error.fieldErrors !== undefined) {
      body.fieldErrors = error.fieldErrors;
    }

    if (error.details !== undefined) {
      Object.assign(body, error.details);
    }

    response.status(error.status).json(body);
    return;
  }

  if (error instanceof SyntaxError) {
    response.status(400).json({
      code: "INVALID_JSON",
      message: "The request body contains invalid JSON.",
    });
    return;
  }

  if (process.env.NODE_ENV !== "test") {
    console.error("Unhandled API error", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
  }

  response.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "The server could not complete the request.",
  });
};
