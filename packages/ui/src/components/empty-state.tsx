import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon, title, hint, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center",
          className
        )}
        {...props}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted mb-4">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="text-h3 font-semibold text-fg">{title}</h3>
        {hint && (
          <p className="mt-1.5 max-w-sm text-small text-subtle">{hint}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
