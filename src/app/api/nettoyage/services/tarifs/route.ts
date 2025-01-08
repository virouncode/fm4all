import { db } from "@/db";
import { fournisseurs, nettoyageTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectNettoyageTarifsSchema } from "@/zod-schemas/nettoyageTarifs";
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
        ...getTableColumns(nettoyageTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(nettoyageTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, nettoyageTarifs.fournisseurId)
      )
      .where(eq(nettoyageTarifs.surface, parseInt(surface)));
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
      selectNettoyageTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / 10000,
      tauxHoraire: result.tauxHoraire / 10000,
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
