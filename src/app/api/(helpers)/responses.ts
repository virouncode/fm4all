import { NextResponse } from "next/server";
import { ApiErr, ApiOk, ApiResponse } from "../types/apiResponse";

export function errorResponse(
  code: ApiErr["error"]["code"],
  message: string,
  init?: { status?: number; details?: unknown; requestId?: string },
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message, details: init?.details },
      meta: init?.requestId ? { requestId: init.requestId } : undefined,
    },
    { status: init?.status ?? 400 },
  );
}

export function successResponse<T>(
  data: T,
  init?: { status?: number; message?: string; requestId?: string },
): NextResponse<ApiOk<T>> {
  return NextResponse.json(
    {
      ok: true,
      data,
      message: init?.message,
      meta: init?.requestId ? { requestId: init.requestId } : undefined,
    },
    { status: init?.status ?? 200 },
  );
}
