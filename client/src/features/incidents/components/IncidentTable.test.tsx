import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { IncidentTable } from "./IncidentTable";
import userEvent from "@testing-library/user-event";
import { buildIncident } from "@/test/incidents";

describe("IncidentTable", () => {
  it("renders a row for each incident", () => {
    const incidents = [
      buildIncident(),
      buildIncident({
        id: "INC-1002",
        title: "Checkout latency increased",
        assignee: {
          id: "usr-2",
          name: "Kidus Mekonnen",
          email: "kidus@example.com",
        },
      }),
    ];
    render(
      <MemoryRouter>
        <IncidentTable incidents={incidents} />
      </MemoryRouter>
    );
    expect(screen.getAllByRole("row")).toHaveLength(incidents.length + 1);
    expect(
      screen.getByText("Elevated payment failure rate")
    ).toBeInTheDocument();
    expect(screen.getByText("Checkout latency increased")).toBeInTheDocument();
    expect(screen.getByText("Kidus Mekonnen")).toBeInTheDocument();
  });

  it("sorts by severity, updatedAt, and createdAt when their headers are clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <IncidentTable incidents={[buildIncident()]} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("columnheader", { name: "Severity" })
    ).toHaveAttribute("aria-sort");

    // Default sort is updatedAt desc.
    expect(
      screen.getByRole("columnheader", { name: "Updated" })
    ).toHaveAttribute("aria-sort", "descending");
    expect(
      screen.getByRole("columnheader", { name: "Created" })
    ).toHaveAttribute("aria-sort");

    // Default sort is updatedAt desc, so severity starts unsorted.
    expect(
      screen.getByRole("columnheader", { name: "Severity" })
    ).toHaveAttribute("aria-sort", "none");

    await user.click(screen.getByRole("button", { name: "Severity" }));

    expect(
      screen.getByRole("columnheader", { name: "Severity" })
    ).toHaveAttribute("aria-sort", "descending");

    // Sorting is exclusive — the previous column resets.
    expect(
      screen.getByRole("columnheader", { name: "Updated" })
    ).toHaveAttribute("aria-sort", "none");
  });

  it("sorts from the keyboard", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <IncidentTable incidents={[buildIncident()]} />
      </MemoryRouter>
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "Severity" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Created" })).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("columnheader", { name: "Created" })
    ).toHaveAttribute("aria-sort", "descending");
  });
});
