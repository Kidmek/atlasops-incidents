import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "./app.js";
import { generateIncidents } from "./data/generate-incidents.js";
import { IncidentStore } from "./data/incident-store.js";

const FIXED_TIME = "2026-08-02T10:00:00.000Z";

function buildTestApp(incidentCount = 64) {
  return createApp({
    store: new IncidentStore(generateIncidents(incidentCount)),
    now: () => new Date(FIXED_TIME),
    simulateLatency: false,
    enableFailureControls: true,
    randomFailureRate: 0,
  });
}

describe("AtlasOps mock API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = buildTestApp();
  });

  it("reports health without exposing the Express header", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("returns a paginated incident list", async () => {
    const response = await request(buildTestApp(1_043)).get(
      "/api/incidents?page=1&pageSize=25"
    );

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(25);
    expect(response.body).toMatchObject({
      page: 1,
      pageSize: 25,
      total: 1_043,
      totalPages: 42,
    });
  });

  it("searches and combines incident filters", async () => {
    const response = await request(app).get(
      "/api/incidents?q=payment&status=triggered&severity=critical&service=payments-api"
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBeGreaterThan(0);

    for (const incident of response.body.items) {
      expect(incident.title.toLowerCase()).toContain("payment");
      expect(incident.status).toBe("triggered");
      expect(incident.severity).toBe("critical");
      expect(incident.service).toBe("payments-api");
    }
  });

  it("sorts severities using domain priority", async () => {
    const response = await request(app).get(
      "/api/incidents?sort=severity&order=desc&pageSize=64"
    );

    expect(response.status).toBe(200);
    expect(response.body.items[0].severity).toBe("critical");
    expect(response.body.items.at(-1).severity).toBe("low");
  });

  it("rejects invalid list query values", async () => {
    const response = await request(app).get(
      "/api/incidents?status=unknown&page=zero"
    );

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(response.body.fieldErrors).toHaveProperty("status");
    expect(response.body.fieldErrors).toHaveProperty("page");
  });

  it("returns incident details and a useful not-found response", async () => {
    const existingResponse = await request(app).get(
      "/api/incidents/INC-1001"
    );
    const missingResponse = await request(app).get(
      "/api/incidents/INC-9999"
    );

    expect(existingResponse.status).toBe(200);
    expect(existingResponse.body.id).toBe("INC-1001");
    expect(missingResponse.status).toBe(404);
    expect(missingResponse.body.code).toBe("INCIDENT_NOT_FOUND");
  });

  it("lists users and services", async () => {
    const usersResponse = await request(app).get("/api/users");
    const servicesResponse = await request(app).get("/api/services");

    expect(usersResponse.status).toBe(200);
    expect(usersResponse.body.items).toContainEqual(
      expect.objectContaining({ id: "usr-1", name: "Maya Chen" })
    );
    expect(servicesResponse.status).toBe(200);
    expect(servicesResponse.body.items).toContain("payments-api");
  });

  it("creates a valid incident", async () => {
    const response = await request(app).post("/api/incidents").send({
      title: "Checkout latency increased",
      description:
        "The 95th percentile latency has exceeded the configured alert threshold.",
      status: "triggered",
      severity: "high",
      service: "checkout-web",
      assigneeId: "usr-1",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: "INC-1065",
      title: "Checkout latency increased",
      status: "triggered",
      assignee: { id: "usr-1" },
      version: 1,
      createdAt: FIXED_TIME,
    });
  });

  it("returns field errors for an invalid incident", async () => {
    const response = await request(app).post("/api/incidents").send({
      title: "Bad",
      description: "Too short",
      status: "triggered",
      severity: "high",
      service: "checkout-web",
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(response.body.fieldErrors).toHaveProperty("title");
    expect(response.body.fieldErrors).toHaveProperty("description");
  });

  it("updates an allowed status transition", async () => {
    const response = await request(app)
      .patch("/api/incidents/INC-1001/status")
      .send({ status: "acknowledged", version: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "INC-1001",
      status: "acknowledged",
      updatedAt: FIXED_TIME,
      version: 2,
    });
  });

  it("rejects stale and invalid status updates", async () => {
    const conflictResponse = await request(app)
      .patch("/api/incidents/INC-1001/status")
      .send({ status: "acknowledged", version: 99 });
    const transitionResponse = await request(app)
      .patch("/api/incidents/INC-1001/status")
      .send({ status: "resolved", version: 1 });

    expect(conflictResponse.status).toBe(409);
    expect(conflictResponse.body).toMatchObject({
      code: "INCIDENT_VERSION_CONFLICT",
      currentVersion: 1,
    });
    expect(transitionResponse.status).toBe(400);
    expect(transitionResponse.body.code).toBe("INVALID_STATUS_TRANSITION");
  });

  it("assigns and unassigns an incident", async () => {
    const assignResponse = await request(app)
      .patch("/api/incidents/INC-1001/assignee")
      .send({ assigneeId: "usr-2" });
    const unassignResponse = await request(app)
      .patch("/api/incidents/INC-1001/assignee")
      .send({ assigneeId: null });

    expect(assignResponse.status).toBe(200);
    expect(assignResponse.body.assignee.id).toBe("usr-2");
    expect(unassignResponse.status).toBe(200);
    expect(unassignResponse.body.assignee).toBeNull();
  });

  it("adds plain-text notes and rejects empty notes", async () => {
    const emptyResponse = await request(app)
      .post("/api/incidents/INC-1001/notes")
      .send({ message: "   " });
    const noteMessage = "<script>alert('still text')</script>";
    const validResponse = await request(app)
      .post("/api/incidents/INC-1001/notes")
      .send({ message: noteMessage });

    expect(emptyResponse.status).toBe(400);
    expect(emptyResponse.body.fieldErrors).toHaveProperty("message");
    expect(validResponse.status).toBe(201);
    expect(validResponse.body.message).toBe(noteMessage);
    expect(validResponse.body.author.id).toBe("usr-current");
  });

  it("supports explicit development failure controls", async () => {
    const failureResponse = await request(app)
      .get("/api/incidents")
      .set("X-Mock-Failure", "500");
    const conflictResponse = await request(app)
      .patch("/api/incidents/INC-1001/status")
      .set("X-Mock-Conflict", "true")
      .send({ status: "acknowledged", version: 1 });

    expect(failureResponse.status).toBe(500);
    expect(failureResponse.body.code).toBe("MOCK_FAILURE");
    expect(conflictResponse.status).toBe(409);
    expect(conflictResponse.body.currentVersion).toBe(1);
  });

  it("handles invalid JSON and unknown routes safely", async () => {
    const jsonResponse = await request(app)
      .post("/api/incidents")
      .set("Content-Type", "application/json")
      .send('{"title":');
    const routeResponse = await request(app).get("/api/unknown");

    expect(jsonResponse.status).toBe(400);
    expect(jsonResponse.body.code).toBe("INVALID_JSON");
    expect(routeResponse.status).toBe(404);
    expect(routeResponse.body.code).toBe("ROUTE_NOT_FOUND");
  });
});
