import { ERROR_HTTP_STATUS, type ErrorCode } from "@aptransit/shared";

/** Business error with a stable code from packages/shared. The filter turns it into docs/06 shape. */
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }

  get status(): number {
    return ERROR_HTTP_STATUS[this.code];
  }
}
