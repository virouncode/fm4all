import { NextResponse } from "next/server";
import { z } from "zod";

export const errorHandler = (err: unknown) => {
  if (err instanceof z.ZodError) {
    const messages = err.issues
      .map((issue) => `${issue.path[0]} : ${issue.message}`)
      .join(", ");
    console.error(`Erreurs de validation du schéma : ${messages}`);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Erreurs de validation : ${messages}`,
        },
      },
      { status: 422 }
    );
  }
  if (err instanceof Error)
    console.error(`Erreur : ${err.message}`, { stack: err.stack }); //Don't send the error back

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Une erreur interne est survenue",
      },
    },
    { status: 500 }
  );
};
