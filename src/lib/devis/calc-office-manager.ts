import { OfficeManagerType } from "@/zod-schemas/officeManager.schema";
import { TotalOfficeManagerType } from "@/zod-schemas/total.schema";

export function calcOfficeManagerTotaux(
  officeManager: OfficeManagerType,
): TotalOfficeManagerType {
  const {
    infos: { gammeSelected, remplace, premium },
    quantites: { demiJParSemaine },
    prix: { demiTjm, demiTjmPremium },
  } = officeManager;

  if (
    gammeSelected === null ||
    demiJParSemaine === null ||
    demiTjm === null ||
    demiTjmPremium === null
  ) {
    return { totalService: null };
  }

  const demiTauxJournalier = premium ? demiTjmPremium : demiTjm;

  const majoration =
    demiJParSemaine <= 1
      ? 20
      : demiJParSemaine <= 2
        ? 15
        : demiJParSemaine <= 3
          ? 10
          : demiJParSemaine <= 4
            ? 5
            : 0;

  const totalService = remplace
    ? demiJParSemaine * demiTauxJournalier * 52 * (1 + majoration / 100)
    : demiJParSemaine * demiTauxJournalier * 47 * (1 + majoration / 100);

  return { totalService };
}
