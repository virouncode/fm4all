import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { fournisseurs, incendieTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectIncendieTarifsSchema } from "@/zod-schemas/incendieTarifs";
import { eq, getTableColumns } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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
      .select({
        ...getTableColumns(incendieTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(incendieTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, incendieTarifs.fournisseurId)
      )
      .where(eq(incendieTarifs.surface, parseInt(surface)));
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
    const validatedResults = results.map((result) =>
      selectIncendieTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      prixParExtincteur: result.prixParExtincteur / RATIO,
      prixParBaes: result.prixParBaes / RATIO,
      prixParTelBaes: result.prixParTelBaes / RATIO,
      fraisDeplacement: result.fraisDeplacement / RATIO,
    }));
    return NextResponse.json(
      {
        success: true,
        data,
        message: "Données récupérées avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    errorHandler(err);
  }
}
