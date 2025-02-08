import { db } from "@/db";
import { incendieQuantites } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { selectIncendieQuantitesSchema } from "../../../../zod-schemas/incendieQuantites";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const surface = searchParams.get("surface");
  if (!surface) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Requête invalide, vous devez fournir une surface",
        },
      },
      { status: 400 }
    );
  }
  try {
    const results = await db
      .select()
      .from(incendieQuantites)
      .where(eq(incendieQuantites.surface, parseInt(surface)));
    if (results.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "Aucune donnée trouvée pour cette surface",
        },
        { status: 200 }
      );
    }
    const validatedResult = selectIncendieQuantitesSchema.parse(results[0]);

    return NextResponse.json(
      {
        success: true,
        data: validatedResult,
        message: "Données récupérées avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    errorHandler(err);
  }
}
