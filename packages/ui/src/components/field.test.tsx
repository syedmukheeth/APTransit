import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./field";
import { Input } from "./input";

describe("Field", () => {
  it("renders label and associates with child input", () => {
    render(
      <Field id="test-name" label="Full Name">
        <Input placeholder="Enter name" />
      </Field>
    );

    const input = screen.getByLabelText("Full Name");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "test-name");
  });

  it("links the error to the input via aria-describedby and sets aria-invalid", () => {
    render(
      <Field
        id="test-email"
        label="Email Address"
        error="Please enter a valid email"
      >
        <Input type="email" />
      </Field>
    );

    const input = screen.getByLabelText("Email Address");
    const errorMsg = screen.getByRole("alert");

    expect(errorMsg).toHaveTextContent("Please enter a valid email");
    expect(errorMsg).toHaveAttribute("id", "test-email-error");
    expect(input).toHaveAttribute("aria-describedby", "test-email-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("shows hint when there is no error", () => {
    render(
      <Field
        id="test-phone"
        label="Phone Number"
        hint="10-digit mobile number"
      >
        <Input type="tel" />
      </Field>
    );

    const input = screen.getByLabelText("Phone Number");
    const hint = screen.getByText("10-digit mobile number");

    expect(hint).toHaveAttribute("id", "test-phone-hint");
    expect(input).toHaveAttribute("aria-describedby", "test-phone-hint");
  });
});
