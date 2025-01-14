import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { fournisseurs, nettoyageRepasseTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectRepasseTarifsSchema } from "@/zod-schemas/nettoyageRepasse";
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
        ...getTableColumns(nettoyageRepasseTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(nettoyageRepasseTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, nettoyageRepasseTarifs.fournisseurId)
      )
      .where(eq(nettoyageRepasseTarifs.surface, parseInt(surface)));

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
      selectRepasseTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
      tauxHoraire: result.tauxHoraire / RATIO,
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
