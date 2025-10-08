import { ApiResponseBody } from "@/app/api/types/apiResponseBody";
import { NextResponse } from "next/server";
import { z } from "zod";

export const errorHandler = (err: unknown): NextResponse<ApiResponseBody> => {
  if (err instanceof z.ZodError) {
    const messages = err.issues
      .map((issue) => `${issue.path[0]} : ${issue.message}`)
      .join(", ");
    console.error(`Erreurs de validation du schéma : ${messages}`);

    const responseBody: ApiResponseBody = {
      success: false,
      code: "VALIDATION_ERROR",
      message: `Erreurs de validation du schema : ${messages}`,
    };
    return NextResponse.json(responseBody, { status: 422 });
  }
  if (err instanceof Error)
    console.error(`Erreur : ${err.message} ${err}`, { stack: err.stack }); //Don't send the error back but log

  const responseBody: ApiResponseBody = {
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Une erreur interne est survenue",
  };
  return NextResponse.json(responseBody, { status: 500 });
};
