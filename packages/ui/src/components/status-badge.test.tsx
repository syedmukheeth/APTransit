import * as React from "react";
import { DisplayStatus } from "@aptransit/shared";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  const allStatuses: DisplayStatus[] = DisplayStatus.options;

  it("renders icon and label for every status key", () => {
    allStatuses.forEach((status) => {
      const label = `Label for ${status}`;
      const { unmount } = render(
        <StatusBadge status={status} label={label} data-testid={`badge-${status}`} />
      );

      const badge = screen.getByTestId(`badge-${status}`);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(label);

      // SVG icon should be present inside the badge
      const icon = badge.querySelector("svg");
      expect(icon).toBeInTheDocument();

      unmount();
    });
  });

  it("supports solid variant", () => {
    render(
      <StatusBadge
        status="RUNNING"
        label="Running Bus"
        solid
        data-testid="solid-badge"
      />
    );

    const badge = screen.getByTestId("solid-badge");
    expect(badge).toHaveClass("bg-status-info-solid");
  });
});
