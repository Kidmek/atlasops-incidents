import { Router } from "express";

import { ApiError } from "../errors/api-error.js";
import { SERVICES, USERS } from "../data/reference-data.js";
import { IncidentService } from "../services/incident-service.js";
import {
  addNoteSchema,
  assignIncidentSchema,
  createIncidentSchema,
  updateStatusSchema,
} from "../validation/incident-mutations.js";
import { listIncidentsQuerySchema } from "../validation/list-incidents-query.js";
import { parseRequest } from "../validation/parse-request.js";

interface ApiRouterOptions {
  enableFailureControls: boolean;
}

export function createApiRouter(
  incidentService: IncidentService,
  options: ApiRouterOptions
) {
  const router = Router();

  router.get("/incidents", (request, response) => {
    const query = parseRequest(
      listIncidentsQuerySchema,
      request.query,
      "The incident query is invalid."
    );

    response.json(incidentService.list(query));
  });

  router.get("/incidents/:incidentId", (request, response) => {
    response.json(incidentService.getById(request.params.incidentId));
  });

  router.post("/incidents", (request, response) => {
    const input = parseRequest(
      createIncidentSchema,
      request.body,
      "The submitted incident is invalid."
    );

    response.status(201).json(incidentService.create(input));
  });

  router.patch("/incidents/:incidentId/status", (request, response) => {
    const input = parseRequest(
      updateStatusSchema,
      request.body,
      "The submitted status update is invalid."
    );

    if (
      options.enableFailureControls &&
      request.get("X-Mock-Conflict") === "true"
    ) {
      const incident = incidentService.getById(request.params.incidentId);
      throw new ApiError(
        409,
        "INCIDENT_VERSION_CONFLICT",
        "The incident was changed by another user.",
        { details: { currentVersion: incident.version } }
      );
    }

    response.json(
      incidentService.updateStatus(request.params.incidentId, input)
    );
  });

  router.patch("/incidents/:incidentId/assignee", (request, response) => {
    const input = parseRequest(
      assignIncidentSchema,
      request.body,
      "The submitted assignee update is invalid."
    );

    response.json(incidentService.assign(request.params.incidentId, input));
  });

  router.post("/incidents/:incidentId/notes", (request, response) => {
    const input = parseRequest(
      addNoteSchema,
      request.body,
      "The submitted note is invalid."
    );

    response
      .status(201)
      .json(incidentService.addNote(request.params.incidentId, input));
  });

  router.get("/users", (_request, response) => {
    response.json({ items: structuredClone(USERS) });
  });

  router.get("/services", (_request, response) => {
    response.json({ items: [...SERVICES] });
  });

  return router;
}
