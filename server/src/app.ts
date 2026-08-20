import express from "express";

import { incidentStore, type IncidentStore } from "./data/incident-store.js";
import { createMockBehaviorMiddleware } from "./middleware/mock-behavior.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";
import { createApiRouter } from "./routes/api-router.js";
import { IncidentService } from "./services/incident-service.js";

interface CreateAppOptions {
  store?: IncidentStore;
  now?: () => Date;
  simulateLatency?: boolean;
  enableFailureControls?: boolean;
  randomFailureRate?: number;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const enableFailureControls =
    options.enableFailureControls ?? process.env.NODE_ENV !== "production";
  const randomFailureRate =
    options.randomFailureRate ??
    (process.env.MOCK_RANDOM_FAILURES === "true" ? 0.03 : 0);
  const incidentService = new IncidentService(
    options.store ?? incidentStore,
    options.now
  );

  app.disable("x-powered-by");
  app.use(
    createMockBehaviorMiddleware({
      simulateLatency:
        options.simulateLatency ?? process.env.NODE_ENV !== "test",
      enableFailureControls,
      randomFailureRate,
    })
  );
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
    });
  });

  app.use(
    "/api",
    createApiRouter(incidentService, { enableFailureControls })
  );
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
