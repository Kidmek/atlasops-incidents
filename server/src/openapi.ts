const incidentStatuses = [
  "triggered",
  "acknowledged",
  "investigating",
  "resolved",
] as const;

const incidentSeverities = ["critical", "high", "medium", "low"] as const;

const services = [
  "payments-api",
  "checkout-web",
  "identity-service",
  "notification-worker",
  "reporting-api",
  "orders-api",
  "customer-portal",
  "inventory-service",
  "search-api",
  "billing-worker",
] as const;

const errorResponses = {
  400: { $ref: "#/components/responses/BadRequest" },
  404: { $ref: "#/components/responses/NotFound" },
  500: { $ref: "#/components/responses/InternalServerError" },
} as const;

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "AtlasOps Mock Incident API",
    version: "1.0.0",
    description:
      "Local mock API for the incident-management take-home exercise. Responses normally include 200–1200 ms of deterministic latency. In non-production environments, X-Mock-Delay can override the delay and X-Mock-Failure can force a 400, 404, 409, or 500 response.",
  },
  servers: [{ url: "/api", description: "Current server" }],
  tags: [
    { name: "System" },
    { name: "Incidents" },
    { name: "Reference data" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Check API health",
        responses: {
          200: {
            description: "The API is available.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
          500: errorResponses[500],
        },
      },
    },
    "/incidents": {
      get: {
        tags: ["Incidents"],
        summary: "List incidents",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Search by incident ID, title, service, or assignee.",
            schema: { type: "string", maxLength: 200 },
          },
          {
            name: "status",
            in: "query",
            description: "Comma-separated statuses.",
            schema: { type: "string", example: "triggered,acknowledged" },
          },
          {
            name: "severity",
            in: "query",
            description: "Comma-separated severities.",
            schema: { type: "string", example: "critical,high" },
          },
          {
            name: "service",
            in: "query",
            schema: { type: "string", enum: services },
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["updatedAt", "severity", "createdAt"],
              default: "updatedAt",
            },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 25,
            },
          },
        ],
        responses: {
          200: {
            description: "A filtered, sorted page of incidents.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IncidentList" },
              },
            },
          },
          ...errorResponses,
        },
      },
      post: {
        tags: ["Incidents"],
        summary: "Create an incident",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateIncidentInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Incident created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Incident" },
              },
            },
          },
          400: errorResponses[400],
          500: errorResponses[500],
        },
      },
    },
    "/incidents/{incidentId}": {
      get: {
        tags: ["Incidents"],
        summary: "Get an incident",
        parameters: [{ $ref: "#/components/parameters/IncidentId" }],
        responses: {
          200: {
            description: "Incident detail.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Incident" },
              },
            },
          },
          404: errorResponses[404],
          500: errorResponses[500],
        },
      },
    },
    "/incidents/{incidentId}/status": {
      patch: {
        tags: ["Incidents"],
        summary: "Update incident status",
        description:
          "When version is supplied, the API rejects a stale update with 409 Conflict. In non-production environments, X-Mock-Conflict: true forces that response.",
        parameters: [
          { $ref: "#/components/parameters/IncidentId" },
          {
            name: "X-Mock-Conflict",
            in: "header",
            description: "Force a conflict response in development.",
            schema: { type: "string", enum: ["true"] },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateStatusInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Status updated.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StatusUpdateResult" },
              },
            },
          },
          400: errorResponses[400],
          404: errorResponses[404],
          409: { $ref: "#/components/responses/Conflict" },
          500: errorResponses[500],
        },
      },
    },
    "/incidents/{incidentId}/assignee": {
      patch: {
        tags: ["Incidents"],
        summary: "Assign or unassign an incident",
        parameters: [{ $ref: "#/components/parameters/IncidentId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AssignIncidentInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Assignee updated.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Incident" },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    "/incidents/{incidentId}/notes": {
      post: {
        tags: ["Incidents"],
        summary: "Add a note",
        parameters: [{ $ref: "#/components/parameters/IncidentId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddNoteInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Note created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IncidentNote" },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    "/users": {
      get: {
        tags: ["Reference data"],
        summary: "List available assignees",
        responses: {
          200: {
            description: "Available users.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["items"],
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
          500: errorResponses[500],
        },
      },
    },
    "/services": {
      get: {
        tags: ["Reference data"],
        summary: "List available services",
        responses: {
          200: {
            description: "Available service names.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["items"],
                  properties: {
                    items: {
                      type: "array",
                      items: { type: "string", enum: services },
                    },
                  },
                },
              },
            },
          },
          500: errorResponses[500],
        },
      },
    },
  },
  components: {
    parameters: {
      IncidentId: {
        name: "incidentId",
        in: "path",
        required: true,
        description: "Incident identifier.",
        schema: { type: "string", example: "INC-1001" },
      },
    },
    responses: {
      BadRequest: {
        description: "The request is invalid.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "The incident or route does not exist.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Conflict: {
        description: "The supplied incident version is stale.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ConflictResponse" },
          },
        },
      },
      InternalServerError: {
        description: "The server could not complete the request.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
    schemas: {
      User: {
        type: "object",
        required: ["id", "name", "email"],
        properties: {
          id: { type: "string", example: "usr-2" },
          name: { type: "string", example: "Omar Hassan" },
          email: { type: "string", format: "email" },
          avatarUrl: { type: "string", format: "uri" },
        },
      },
      IncidentNote: {
        type: "object",
        required: ["id", "incidentId", "author", "message", "createdAt"],
        properties: {
          id: { type: "string", example: "note-1" },
          incidentId: { type: "string", example: "INC-1001" },
          author: { $ref: "#/components/schemas/User" },
          message: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Incident: {
        type: "object",
        required: [
          "id",
          "title",
          "description",
          "status",
          "severity",
          "service",
          "assignee",
          "createdAt",
          "updatedAt",
          "notes",
          "version",
        ],
        properties: {
          id: { type: "string", example: "INC-1001" },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: incidentStatuses },
          severity: { type: "string", enum: incidentSeverities },
          service: { type: "string", enum: services },
          assignee: {
            allOf: [{ $ref: "#/components/schemas/User" }],
            nullable: true,
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          notes: {
            type: "array",
            items: { $ref: "#/components/schemas/IncidentNote" },
          },
          version: { type: "integer", minimum: 1 },
        },
      },
      IncidentList: {
        type: "object",
        required: ["items", "page", "pageSize", "total", "totalPages"],
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Incident" },
          },
          page: { type: "integer", minimum: 1 },
          pageSize: { type: "integer", minimum: 1, maximum: 100 },
          total: { type: "integer", minimum: 0 },
          totalPages: { type: "integer", minimum: 0 },
        },
      },
      CreateIncidentInput: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "severity", "service", "status"],
        properties: {
          title: { type: "string", minLength: 5, maxLength: 120 },
          description: { type: "string", minLength: 20, maxLength: 2000 },
          severity: { type: "string", enum: incidentSeverities },
          service: { type: "string", enum: services },
          assigneeId: { type: "string", nullable: true },
          status: { type: "string", enum: incidentStatuses },
        },
      },
      UpdateStatusInput: {
        type: "object",
        additionalProperties: false,
        required: ["status"],
        properties: {
          status: { type: "string", enum: incidentStatuses },
          version: { type: "integer", minimum: 1 },
        },
      },
      StatusUpdateResult: {
        type: "object",
        required: ["id", "status", "updatedAt", "version"],
        properties: {
          id: { type: "string", example: "INC-1001" },
          status: { type: "string", enum: incidentStatuses },
          updatedAt: { type: "string", format: "date-time" },
          version: { type: "integer", minimum: 1 },
        },
      },
      AssignIncidentInput: {
        type: "object",
        additionalProperties: false,
        required: ["assigneeId"],
        properties: { assigneeId: { type: "string", nullable: true } },
      },
      AddNoteInput: {
        type: "object",
        additionalProperties: false,
        required: ["message"],
        properties: {
          message: { type: "string", minLength: 1, maxLength: 2000 },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: { type: "string", example: "VALIDATION_ERROR" },
          message: { type: "string" },
          fieldErrors: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
      ConflictResponse: {
        allOf: [
          { $ref: "#/components/schemas/ErrorResponse" },
          {
            type: "object",
            required: ["currentVersion"],
            properties: {
              currentVersion: { type: "integer", minimum: 1, example: 1 },
            },
          },
        ],
      },
    },
  },
} as const;
