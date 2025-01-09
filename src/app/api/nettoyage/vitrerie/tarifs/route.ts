import { RATIO } from "@/constants/ratio";
import { db } from "@/db";
import { fournisseurs, nettoyageVitrerieTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";

import { selectVitrerieTarifsSchema } from "@/zod-schemas/nettoyageVitrerie";
import { eq, getTableColumns } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await db
      .select({
        ...getTableColumns(nettoyageVitrerieTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(nettoyageVitrerieTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, nettoyageVitrerieTarifs.fournisseurId)
      );

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
      selectVitrerieTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      tauxHoraire: result.tauxHoraire / RATIO,
      minFacturation: result.minFacturation / RATIO,
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
