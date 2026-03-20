import { TheType } from "@/zod-schemas/the.schema";
import { TotalTheType } from "@/zod-schemas/total.schema";

export function calcTheTotaux(the: TheType): TotalTheType {
  const {
    infos: { gammeSelected },
    quantites: { nbPersonnes },
    prix: { prixUnitaire },
  } = the;

  const totalService =
    gammeSelected !== null && nbPersonnes !== null && prixUnitaire !== null
      ? nbPersonnes * 400 * prixUnitaire
      : null;

  return { totalService };
}
