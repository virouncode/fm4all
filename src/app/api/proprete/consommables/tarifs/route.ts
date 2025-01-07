import { db } from "@/db";
import { fournisseurs, propreteConsoTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectPropreteConsoTarifsSchema } from "@/zod-schemas/propreteConsoTarifs";
import { and, eq, getTableColumns } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const effectif = searchParams.get("effectif");
  const fournisseurId = searchParams.get("fournisseurId");

  if (!effectif || !fournisseurId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message:
            "Requête invalide, vous devez fournir un fournisseurId et un effectif",
        },
      },
      { status: 400 }
    );
  }
  try {
    const results = await db
      .select({
        ...getTableColumns(propreteConsoTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(propreteConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(propreteConsoTarifs.fournisseurId, fournisseurs.id)
      )
      .where(
        and(
          eq(propreteConsoTarifs.effectif, parseInt(effectif)),
          eq(propreteConsoTarifs.fournisseurId, parseInt(fournisseurId))
        )
      );
    if (results.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "Aucune donnée trouvée pour ce fournisseur et cet effectif",
        },
        { status: 200 }
      );
    }
    const validatedResults = results.map((result) =>
      selectPropreteConsoTarifsSchema.parse(result)
    );
    return NextResponse.json(
      {
        success: true,
        data: validatedResults,
        message: "Données récupérées avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    errorHandler(err);
  }
}
