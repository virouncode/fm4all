import { errorHandler } from "@/lib/errorHandler";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
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
    const [quantitesResponse, tarifsResponse] = await Promise.all([
      fetch(
        `${process.env.MY_URL}/api/nettoyage/services/quantites?surface=${surface}`
      ),
      fetch(
        `${process.env.MY_URL}/api/nettoyage/services/tarifs?surface=${surface}`
      ),
    ]);

    if (!quantitesResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EXTERNAL_API_ERROR",
            message: `Erreur lors de la récupération des quantités : ${quantitesResponse.statusText}`,
          },
        },
        { status: quantitesResponse.status }
      );
    }

    if (!tarifsResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EXTERNAL_API_ERROR",
            message: `Erreur lors de la récupération des tarifs : ${tarifsResponse.statusText}`,
          },
        },
        { status: tarifsResponse.status }
      );
    }

    const quantitesJson = await quantitesResponse.json();
    const tarifsJson = await tarifsResponse.json();

    if (!quantitesJson.success || !tarifsJson.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: quantitesJson.error.code || tarifsJson.error.code,
            message: quantitesJson.error.message || tarifsJson.error.message,
          },
        },
        { status: 400 }
      );
    }

    const quantites: SelectNettoyageQuantitesType[] = quantitesJson.data;
    const tarifs: SelectNettoyageTarifsType[] = tarifsJson.data;

    const propositions = tarifs
      .map((tarif) => {
        const freqAnnuelle =
          quantites.find(({ gamme }) => gamme === tarif.gamme)?.freqAnnuelle ||
          0;
        const hParPassage = tarif.hParPassage;
        const tauxHoraire = tarif.tauxHoraire;

        return {
          ...tarif,
          freqAnnuelle,
          prixAnnuel: Math.round(freqAnnuelle * hParPassage * tauxHoraire),
          prixAnnuelSamedi: Math.round(52 * hParPassage * tauxHoraire),
          prixAnnuelDimanche: Math.round(52 * hParPassage * tauxHoraire * 1.2),
        };
      })
      .sort((a, b) => a.fournisseurId - b.fournisseurId);

    return NextResponse.json(
      {
        success: true,
        data: propositions,
        message: "Données récupérées avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    return errorHandler(err);
  }
}
