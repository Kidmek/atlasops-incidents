import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import { IncidentFilters } from "./IncidentFilters";
import { MOCK_SERVICES } from "@/test/server";
import { renderWithProviders } from "@/test/render";

function IncidentFiltersWithProbe() {
  const location = useLocation();
  return (
    <>
      <IncidentFilters />
      <output data-testid="url">{location.search}</output>
    </>
  );
}

function urlParams() {
  const search = screen.getByTestId("url").textContent ?? "";
  return Object.fromEntries(new URLSearchParams(search));
}

describe("IncidentFilters", () => {
  it("renders the services options", async () => {
    renderWithProviders(<IncidentFiltersWithProbe />);

    await screen.findByRole("option", { name: MOCK_SERVICES[0] });

    const service = screen.getByRole("combobox", { name: "Service" });
    const options = within(service).getAllByRole("option");
    expect(options).toHaveLength(MOCK_SERVICES.length + 1);
  });

  it("reflects the filters already in the URL", () => {
    renderWithProviders(
      <IncidentFiltersWithProbe />,
      "/incidents?q=payments&status=triggered,resolved"
    );

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue(
      "payments"
    );
    expect(screen.getByRole("checkbox", { name: "triggered" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "resolved" })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "investigating" })
    ).not.toBeChecked();
  });

  it("applies a status filter when its checkbox is ticked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<IncidentFiltersWithProbe />);

    const triggered = screen.getByRole("checkbox", { name: "triggered" });
    expect(triggered).not.toBeChecked();

    await user.click(triggered);

    expect(screen.getByRole("checkbox", { name: "triggered" })).toBeChecked();
  });

  it("filters from the keyboard", async () => {
    const user = userEvent.setup();
    renderWithProviders(<IncidentFiltersWithProbe />);

    await user.tab();
    await screen.findByRole("option", { name: MOCK_SERVICES[0] });

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus();

    await user.keyboard("payments");

    await user.tab();
    expect(screen.getByRole("combobox", { name: "Service" })).toHaveFocus();

    await user.tab();
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "triggered" })).toHaveFocus();

    await user.keyboard(" ");

    expect(urlParams()).toEqual({
      q: "payments",
      status: "triggered",
    });
  });

  it("updates the URL when the filter is changed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<IncidentFiltersWithProbe />);

    await screen.findByRole("option", { name: MOCK_SERVICES[0] });

    const service = screen.getByRole("combobox", { name: "Service" });
    await user.selectOptions(service, MOCK_SERVICES[0]);

    expect(urlParams()).toEqual({
      service: MOCK_SERVICES[0],
    });
    const triggered = screen.getByRole("checkbox", { name: "triggered" });
    await user.click(triggered);

    expect(urlParams()).toEqual({
      service: MOCK_SERVICES[0],
      status: "triggered",
    });

    const resolved = screen.getByRole("checkbox", { name: "resolved" });
    await user.click(resolved);

    expect(urlParams()).toEqual({
      service: MOCK_SERVICES[0],
      status: "triggered,resolved",
    });

    const critical = screen.getByRole("checkbox", { name: "critical" });
    await user.click(critical);

    expect(urlParams()).toEqual({
      service: MOCK_SERVICES[0],
      status: "triggered,resolved",
      severity: "critical",
    });
  });
});
