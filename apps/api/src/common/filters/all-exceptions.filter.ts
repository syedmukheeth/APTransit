import { ErrorCode, type ErrorResponse } from "@aptransit/shared";
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AppError } from "../errors/app-error";

interface NormalisedError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

const CODE_BY_STATUS: Record<number, ErrorCode> = {
  400: ErrorCode.VALIDATION_FAILED,
  401: ErrorCode.UNAUTHENTICATED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  413: ErrorCode.VALIDATION_FAILED,
  415: ErrorCode.VALIDATION_FAILED,
  429: ErrorCode.RATE_LIMITED,
};

function statusFromUnknown(exception: unknown): number | undefined {
  if (typeof exception !== "object" || exception === null) return undefined;
  const candidate = (exception as { status?: unknown; statusCode?: unknown }).status ??
    (exception as { statusCode?: unknown }).statusCode;
  return typeof candidate === "number" && candidate >= 400 && candidate < 600 ? candidate : undefined;
}

export function normaliseError(exception: unknown): NormalisedError {
  if (exception instanceof AppError) {
    return {
      status: exception.status,
      code: exception.code,
      message: exception.message,
      details: exception.details,
    };
  }

  const status =
    exception instanceof HttpException ? exception.getStatus() : statusFromUnknown(exception);

  if (status !== undefined && status < 500) {
    return {
      status,
      code: CODE_BY_STATUS[status] ?? ErrorCode.VALIDATION_FAILED,
      message: exception instanceof Error ? exception.message : "Request failed",
    };
  }

  // 5xx and unknown errors never leak internals to the client.
  return {
    status: status ?? HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCode.INTERNAL,
    message: "Something went wrong on our side",
  };
}

/** Turns every error into the docs/06 error shape. No stack traces in responses, ever. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("Errors");

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request & { id?: string | number }>();
    const response = http.getResponse<Response>();
    const error = normaliseError(exception);
    const requestId = String(request.id ?? response.getHeader("x-request-id") ?? "unknown");

    if (error.status >= 500) {
      this.logger.error(
        { requestId, err: exception },
        exception instanceof Error ? exception.message : "Unknown error",
      );
    }

    const body: ErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
        requestId,
      },
    };
    response.status(error.status).json(body);
  }
}
