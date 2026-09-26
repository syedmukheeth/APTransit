import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../cn";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      id,
      label,
      hint,
      error,
      required = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    // Enhance the child element with id, aria-describedby, and aria-invalid
    const childWithA11y = React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          id,
          "aria-describedby": describedBy,
          "aria-invalid": error ? "true" : undefined,
        })
      : children;

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        <label
          htmlFor={id}
          className="text-body font-medium text-fg flex items-center gap-1 select-none"
        >
          <span>{label}</span>
          {required && (
            <span className="text-status-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {childWithA11y}

        {error && (
          <div
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-small text-status-danger mt-0.5"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {!error && hint && (
          <div id={hintId} className="text-small text-subtle mt-0.5">
            {hint}
          </div>
        )}
      </div>
    );
  }
);

Field.displayName = "Field";
