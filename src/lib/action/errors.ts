import "server-only";

import type { ApiError, FieldErrors } from "./result";

export const errors = {
  forbidden: (message = "Forbidden.", details?: unknown) =>
    ({ code: "FORBIDDEN", message, details }) as const satisfies ApiError,

  unauthorized: (message = "Unauthorized.", details?: unknown) =>
    ({ code: "UNAUTHORIZED", message, details }) as const satisfies ApiError,

  notFound: (resource = "Resource", details?: unknown) =>
    ({
      code: "NOT_FOUND",
      message: `${resource} not found.`,
      details,
    }) as const satisfies ApiError,

  conflict: (message = "Conflict.", details?: unknown) =>
    ({ code: "CONFLICT", message, details }) as const satisfies ApiError,

  internal: (message = "Unexpected error.", details?: unknown) =>
    ({
      code: "INTERNAL_ERROR",
      message,
      details,
      retryable: false,
    }) as const satisfies ApiError,

  dependency: (message = "Temporary issue, please retry.", details?: unknown) =>
    ({
      code: "DEPENDENCY_ERROR",
      message,
      details,
      retryable: true,
    }) as const satisfies ApiError,

  // Optionnel : si tu veux des fieldErrors côté métier (hors zod)
  validation: (
    message = "Invalid input.",
    fieldErrors?: FieldErrors,
    details?: unknown,
  ) =>
    ({
      code: "VALIDATION_ERROR",
      message,
      fieldErrors,
      details,
    }) as const satisfies ApiError,
} as const;
