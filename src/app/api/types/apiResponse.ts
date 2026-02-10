export type ApiOk<T = unknown> = {
  ok: true;
  data: T;
  message?: string;
  meta?: { requestId?: string };
};

export type ApiErr = {
  ok: false;
  error: {
    code:
      | "VALIDATION"
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "CONFLICT"
      | "CONFIG"
      | "DEPENDENCY"
      | "INTERNAL";
    message: string;
    details?: unknown;
  };
  meta?: { requestId?: string };
};

export type ApiResponse<T = unknown> = ApiOk<T> | ApiErr;
