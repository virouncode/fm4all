// src/lib/action/result.ts
import { randomUUID } from "crypto";

export type FieldErrors = Record<string, string | string[]>;

export type ApiError<Code extends string = string> = {
  code: Code;
  message: string;
  details?: unknown;
  fieldErrors?: FieldErrors;
  retryable?: boolean;
};

export type ApiMeta = {
  requestId: string;
  // tu pourras enrichir plus tard : tenant, actor, etc.
  tenant?: {
    orgId: string;
    scope?: "client" | "fournisseur" | "fm4all" | "mixed";
  };
};

export type ApiOk<T> = { ok: true; data: T; meta: ApiMeta };
export type ApiFail<Code extends string = string> = {
  ok: false;
  error: ApiError<Code>;
  meta: ApiMeta;
};
export type ApiResult<T, Code extends string = string> =
  | ApiOk<T>
  | ApiFail<Code>;

export function meta(partial?: Partial<ApiMeta>): ApiMeta {
  return {
    requestId: partial?.requestId ?? `req_${randomUUID()}`,
    tenant: partial?.tenant,
  };
}

export const ok = <T>(data: T, m: ApiMeta): ApiOk<T> => ({
  ok: true,
  data,
  meta: m,
});
export const fail = <Code extends string>(
  error: ApiError<Code>,
  m: ApiMeta,
): ApiFail<Code> => ({
  ok: false,
  error,
  meta: m,
});
