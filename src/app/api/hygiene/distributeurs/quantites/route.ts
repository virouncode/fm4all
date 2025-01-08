import { db } from "@/db";
import { hygieneDistribQuantites } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectHygieneDistribQuantiteSchema } from "@/zod-schemas/hygieneDistribQuantite";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const effectif = searchParams.get("effectif");
  if (!effectif) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Requête invalide, vous devez fournir un effectif",
        },
      },
      { status: 400 }
    );
  }
  try {
    const results = await db
      .select()
      .from(hygieneDistribQuantites)
      .where(eq(hygieneDistribQuantites.effectif, parseInt(effectif)));
    if (results.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "Aucune donnée trouvée pour cet effectif",
        },
        { status: 200 }
      );
    }
    const validatedResult = selectHygieneDistribQuantiteSchema.parse(
      results[0]
    );
    return NextResponse.json(
      {
        success: true,
        data: {
          ...validatedResult,
          nbDistribDesinfectant: validatedResult.nbDistribPh,
          nbDistribParfum: validatedResult.nbDistribEmp,
          nbDistribBalai: validatedResult.nbDistribPh,
          nbDistribPoubelle: Math.ceil(validatedResult?.nbDistribPh / 2),
        },
        message: "Données récupérées avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    errorHandler(err);
  }
}
