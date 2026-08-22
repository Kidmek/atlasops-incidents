import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { buildIncident } from "@/test/incidents";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";

import { IncidentDetailPage } from "./IncidentDetailPage";

function renderDetail() {
  return renderWithProviders(
    <Routes>
      <Route path="/incidents/:incidentId" element={<IncidentDetailPage />} />
    </Routes>,
    "/incidents/INC-1001"
  );
}

describe("IncidentDetailPage status updates", () => {
  it("applies a status change and confirms it", async () => {
    const user = userEvent.setup();

    let incident = buildIncident({ status: "triggered" });

    server.use(
      http.get("/api/incidents/:incidentId", () => HttpResponse.json(incident)),
      http.patch("/api/incidents/:incidentId/status", () => {
        incident = { ...incident, status: "acknowledged", version: 2 };
        return HttpResponse.json({
          id: incident.id,
          status: incident.status,
          updatedAt: incident.updatedAt,
          version: incident.version,
        });
      })
    );

    renderDetail();

    await user.click(
      await screen.findByRole("button", { name: "Mark as acknowledged" })
    );

    // The button now offers the next transition — only true if the status moved.
    expect(
      await screen.findByRole("button", { name: "Mark as investigating" })
    ).toBeInTheDocument();
    expect(screen.getByText("Status updated.")).toBeInTheDocument();
  });

  it("rolls back and surfaces the error when the server rejects the change", async () => {
    const user = userEvent.setup();
    const incident = buildIncident({ status: "triggered" });

    server.use(
      http.get("/api/incidents/:incidentId", () => HttpResponse.json(incident)),
      http.patch("/api/incidents/:incidentId/status", async () => {
        await delay(50);
        return HttpResponse.json(
          {
            code: "INCIDENT_VERSION_CONFLICT",
            message: "The incident was changed by another user.",
          },
          { status: 409 }
        );
      })
    );

    renderDetail();

    await user.click(
      await screen.findByRole("button", { name: "Mark as acknowledged" })
    );

    expect(await screen.findByText("acknowledged")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("triggered")).toBeInTheDocument()
    );
    expect(
      screen.getByText("The incident was changed by another user.")
    ).toBeInTheDocument();
  });
});
