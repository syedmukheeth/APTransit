import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog", () => {
  it("renders when open and triggers onOpenChange on Escape key", () => {
    const handleOpenChange = vi.fn();

    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent closeLabel="Close Dialog">
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this ticket?
            </DialogDescription>
          </DialogHeader>
          <button type="button">Yes, Cancel</button>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Confirm Cancellation")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to cancel this ticket?")
    ).toBeInTheDocument();

    const dialogContent = screen.getByRole("dialog");
    expect(dialogContent).toBeInTheDocument();

    // Trigger Escape
    fireEvent.keyDown(dialogContent, { key: "Escape", code: "Escape" });
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("can be opened via DialogTrigger", () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button type="button">Open Modal</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByRole("button", { name: "Open Modal" });
    fireEvent.click(trigger);

    expect(screen.getByText("Modal Title")).toBeInTheDocument();
  });
});
