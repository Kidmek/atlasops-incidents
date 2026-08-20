import type { RequestHandler } from "express";

export interface MockBehaviorOptions {
  simulateLatency: boolean;
  enableFailureControls: boolean;
  randomFailureRate: number;
}

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 1_200;
const MAX_FORCED_DELAY_MS = 10_000;

function deterministicDelay(method: string, url: string): number {
  const value = `${method}:${url}`;
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return MIN_DELAY_MS + (hash % (MAX_DELAY_MS - MIN_DELAY_MS + 1));
}

function forcedDelay(headerValue: string | undefined): number | undefined {
  if (headerValue === undefined || !/^\d+$/.test(headerValue)) {
    return undefined;
  }

  return Math.min(Number(headerValue), MAX_FORCED_DELAY_MS);
}

export function createMockBehaviorMiddleware(
  options: MockBehaviorOptions
): RequestHandler {
  return (request, response, next) => {
    const requestedDelay = options.enableFailureControls
      ? forcedDelay(request.get("X-Mock-Delay"))
      : undefined;
    const delay =
      requestedDelay ??
      (options.simulateLatency
        ? deterministicDelay(request.method, request.originalUrl)
        : 0);

    const timer = setTimeout(() => {
      if (request.aborted) {
        return;
      }

      const forcedStatus = options.enableFailureControls
        ? Number(request.get("X-Mock-Failure"))
        : 0;

      if ([400, 404, 409, 500].includes(forcedStatus)) {
        response.status(forcedStatus).json({
          code: "MOCK_FAILURE",
          message: `A ${forcedStatus} response was requested by a development failure control.`,
        });
        return;
      }

      if (
        options.randomFailureRate > 0 &&
        Math.random() < options.randomFailureRate
      ) {
        response.status(500).json({
          code: "MOCK_INTERNAL_ERROR",
          message: "The mock API encountered a simulated failure.",
        });
        return;
      }

      next();
    }, delay);

    request.once("aborted", () => {
      clearTimeout(timer);
    });
  };
}
