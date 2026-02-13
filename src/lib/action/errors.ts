import "server-only";

import type { ApiError, FieldErrors } from "./result";

// Classe d'erreur personnalisée qui contient les métadonnées ApiError
export class AppError extends Error {
  public readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "AppError";
    this.apiError = apiError;

    // Préserve la stack trace correctement
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export const errors = {
  forbidden: (message = "Forbidden.", details?: unknown) => {
    const apiError: ApiError = { code: "FORBIDDEN", message, details };
    return new AppError(apiError);
  },

  unauthorized: (message = "Unauthorized.", details?: unknown) => {
    const apiError: ApiError = { code: "UNAUTHORIZED", message, details };
    return new AppError(apiError);
  },

  notFound: (resource = "Resource", details?: unknown) => {
    const apiError: ApiError = {
      code: "NOT_FOUND",
      message: `${resource} not found.`,
      details,
    };
    return new AppError(apiError);
  },

  conflict: (message = "Conflict.", details?: unknown) => {
    const apiError: ApiError = { code: "CONFLICT", message, details };
    return new AppError(apiError);
  },

  internal: (message = "Unexpected error.", details?: unknown) => {
    const apiError: ApiError = {
      code: "INTERNAL_ERROR",
      message,
      details,
      retryable: false,
    };
    return new AppError(apiError);
  },

  dependency: (message = "Temporary issue, please retry.", details?: unknown) => {
    const apiError: ApiError = {
      code: "DEPENDENCY_ERROR",
      message,
      details,
      retryable: true,
    };
    return new AppError(apiError);
  },

  // Optionnel : si tu veux des fieldErrors côté métier (hors zod)
  validation: (
    message = "Invalid input.",
    fieldErrors?: FieldErrors,
    details?: unknown,
  ) => {
    const apiError: ApiError = {
      code: "VALIDATION_ERROR",
      message,
      fieldErrors,
      details,
    };
    return new AppError(apiError);
  },
} as const;
