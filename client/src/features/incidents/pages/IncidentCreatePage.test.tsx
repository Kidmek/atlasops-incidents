import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render";
import { IncidentCreatePage } from "./IncidentCreatePage";

const submitButton = () =>
  screen.getByRole("button", { name: "Create incident" });

describe("IncidentCreatePage", () => {
  it("reports validation errors instead of submitting an empty form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<IncidentCreatePage />, "/incidents/new");

    await user.click(submitButton());

    expect(
      await screen.findByText("Title must contain at least 5 characters.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Description must contain at least 20 characters.")
    ).toBeInTheDocument();
    expect(screen.getByText("Select a service.")).toBeInTheDocument();
  });

  it("moves focus to the first invalid field", async () => {
    const user = userEvent.setup();
    renderWithProviders(<IncidentCreatePage />, "/incidents/new");

    await user.click(submitButton());

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Title" })).toHaveFocus()
    );

    await user.type(screen.getByRole("textbox", { name: "Title" }), "Testing");
    await user.click(submitButton());

    expect(
      await screen.findByText(
        "Description must contain at least 20 characters."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveFocus();
  });
});
