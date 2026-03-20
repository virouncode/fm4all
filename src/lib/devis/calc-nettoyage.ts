import { MAJORATION_DIMANCHE } from "@/constants/constants";
import { NettoyageType } from "@/zod-schemas/nettoyage.schema";
import { TotalNettoyageType } from "@/zod-schemas/total.schema";

export function calcNettoyageTotaux(
  nettoyage: NettoyageType,
): TotalNettoyageType {
  const {
    infos: {
      repasseSelected,
      samediSelected,
      dimancheSelected,
      vitrerieSelected,
    },
    quantites: {
      freqAnnuelle,
      hParPassage,
      hParPassageRepasse,
      surfaceCloisons,
      surfaceVitres,
      cadenceCloisons,
      cadenceVitres,
      nbPassagesVitrerie,
    },
    prix: {
      tauxHoraire,
      tauxHoraireRepasse,
      tauxHoraireVitrerie,
      minFacturationVitrerie,
      fraisDeplacementVitrerie,
    },
  } = nettoyage;

  const totalService =
    freqAnnuelle !== null && hParPassage !== null && tauxHoraire !== null
      ? freqAnnuelle * hParPassage * tauxHoraire
      : null;

  const totalRepasse =
    repasseSelected &&
    freqAnnuelle !== null &&
    hParPassageRepasse !== null &&
    tauxHoraireRepasse !== null
      ? freqAnnuelle * hParPassageRepasse * tauxHoraireRepasse
      : null;

  const totalSamedi =
    samediSelected && tauxHoraire !== null && hParPassage !== null
      ? 52 * tauxHoraire * hParPassage
      : null;

  const totalDimanche =
    dimancheSelected && tauxHoraire !== null && hParPassage !== null
      ? 52 * tauxHoraire * hParPassage * MAJORATION_DIMANCHE
      : null;

  const totalVitrerie =
    vitrerieSelected &&
    cadenceVitres !== null &&
    cadenceCloisons !== null &&
    surfaceVitres !== null &&
    surfaceCloisons !== null &&
    tauxHoraireVitrerie !== null
      ? nbPassagesVitrerie *
        Math.max(
          (surfaceVitres / cadenceVitres) * tauxHoraireVitrerie +
            (surfaceCloisons / cadenceCloisons) * tauxHoraireVitrerie +
            (fraisDeplacementVitrerie ?? 0),
          minFacturationVitrerie ?? 0,
        )
      : null;

  return {
    totalService,
    totalRepasse,
    totalSamedi,
    totalDimanche,
    totalVitrerie,
  };
}
