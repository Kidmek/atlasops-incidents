import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const MOCK_SERVICES = ["payments-api", "checkout-web"];

export const MOCK_USERS = [
  { id: "usr-1", name: "Maya Chen", email: "maya@example.com" },
];
// Defaults every test gets for free. Individual tests override with server.use().
export const server = setupServer(
  http.get("/api/services", () => HttpResponse.json({ items: MOCK_SERVICES })),
  http.get("/api/users", () =>
    HttpResponse.json({
      items: MOCK_USERS,
    })
  )
);
