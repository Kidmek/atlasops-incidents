import express from "express";
import compression from "compression";
import swaggerUi from "swagger-ui-express";

import { incidentStore, type IncidentStore } from "./data/incident-store.js";
import { createMockBehaviorMiddleware } from "./middleware/mock-behavior.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { createApiRouter } from "./routes/api-router.js";
import { IncidentService } from "./services/incident-service.js";
import { openApiDocument } from "./openapi.js";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

interface CreateAppOptions {
  store?: IncidentStore;
  serveClient?: boolean;
  now?: () => Date;
  simulateLatency?: boolean;
  enableFailureControls?: boolean;
  randomFailureRate?: number;
}

// Resolves to <repo>/client/dist from both src/ (tsx) and dist/ (compiled).
const CLIENT_DIST_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../client/dist"
);

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const serveClient =
    options.serveClient ??
    existsSync(path.join(CLIENT_DIST_PATH, "index.html"));

  const enableFailureControls =
    options.enableFailureControls ??
    (process.env.ENABLE_MOCK_CONTROLS === "true" ||
      process.env.NODE_ENV !== "production");

  const randomFailureRate =
    options.randomFailureRate ??
    (process.env.MOCK_RANDOM_FAILURES === "true" ? 0.03 : 0);

  const incidentService = new IncidentService(
    options.store ?? incidentStore,
    options.now
  );

  app.disable("x-powered-by");
  app.use(compression());

  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
    });
  });

  app.get("/api/openapi.json", (_request, response) => {
    response.json(openApiDocument);
  });
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "AtlasOps API documentation",
    })
  );

  // Scoped to /api. Global would delay every JS and CSS file by up to 1.2s.
  app.use(
    "/api",
    createMockBehaviorMiddleware({
      simulateLatency:
        options.simulateLatency ?? process.env.NODE_ENV !== "test",
      enableFailureControls,
      randomFailureRate,
    })
  );

  app.use("/api", createApiRouter(incidentService, { enableFailureControls }));

  if (serveClient) {
    // Vite content-hashes these filenames, so a change produces a new name —
    // the bytes at a given name can never change, hence immutable.
    app.use(
      "/assets",
      express.static(path.join(CLIENT_DIST_PATH, "assets"), {
        maxAge: "1y",
        immutable: true,
      })
    );

    // index.html must stay uncached; it points at the hashed asset names.
    app.use(express.static(CLIENT_DIST_PATH));

    // Non-API GETs fall back to index.html so client routes survive a refresh.
    app.use((request, response, next) => {
      if (
        request.method !== "GET" ||
        request.path.startsWith("/api") ||
        request.path.startsWith("/assets")
      ) {
        next();
        return;
      }

      response.sendFile(path.join(CLIENT_DIST_PATH, "index.html"));
    });
  }
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
