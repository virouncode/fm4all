"use client";

import { useOfficeManagerStore } from "@/stores/devis/officeManagerStore";
import { SelectOfficeManagerQuantitesType } from "@/zod-schemas/officeManagerQuantites.schema";
import { SelectOfficeManagerTarifsType } from "@/zod-schemas/officeManagerTarifs.schema";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import OfficeManagerDesktopPropositions from "./(desktop)/OfficeManagerDesktopPropositions";
import OfficeManagerMobilePropositions from "./(mobile)/OfficeManagerMobilePropositions";

type OfficeManagerPropositionsProps = {
  officeManagerQuantites: SelectOfficeManagerQuantitesType[];
  officeManagerTarifs: SelectOfficeManagerTarifsType[];
};

const OfficeManagerPropositions = ({
  officeManagerQuantites,
  officeManagerTarifs,
}: OfficeManagerPropositionsProps) => {
  const tOfficeManager = useTranslations("DevisPage.pilotage.officeManager");
  const { officeManager, setOfficeManager } = useOfficeManagerStore(
    useShallow((s) => ({
      officeManager: s.officeManager,
      setOfficeManager: s.setOfficeManager,
    })),
  );
  //Calcul des propositions
  const demiJParSemaineEssentiel =
    officeManagerQuantites.find((q) => q.gamme === "essentiel")
      ?.demiJParSemaine ?? null;
  const demiJParSemaineConfort =
    officeManagerQuantites.find((q) => q.gamme === "confort")
      ?.demiJParSemaine ?? null;
  const demiJParSemaineExcellence =
    officeManagerQuantites.find((q) => q.gamme === "excellence")
      ?.demiJParSemaine ?? null;

  const demiJParSemaine =
    officeManager.quantites.demiJParSemaine ?? demiJParSemaineEssentiel;

  const majoration =
    demiJParSemaine !== null
      ? demiJParSemaine <= 1
        ? 20
        : demiJParSemaine <= 2
          ? 15
          : demiJParSemaine <= 3
            ? 10
            : demiJParSemaine <= 4
              ? 5
              : 0
      : null;

  const propositions = officeManagerTarifs.map((tarif) => {
    let { entrepriseId, nomPrestataire, slogan } = tarif;
    const { id, demiTjm, demiTjmPremium, logoStorageKey } = tarif;
    if (false) {
      entrepriseId = "00000000-0000-0000-0000-000000000000";
      nomPrestataire = "FM4ALL";
      slogan = tOfficeManager("le-facility-management-pour-tous");
    }
    const demiTauxJournalier = officeManager.infos.premium
      ? demiTjmPremium
      : demiTjm;
    const totalAnnuel =
      demiJParSemaine !== null && majoration !== null
        ? officeManager.infos.remplace
          ? demiJParSemaine * demiTauxJournalier * 52 * (1 + majoration / 100)
          : demiJParSemaine * demiTauxJournalier * 47 * (1 + majoration / 100)
        : null;

    return {
      id,
      entrepriseId,
      nomPrestataire,
      sloganPrestataire: slogan,
      logoStorageKey,
      totalAnnuel,
      demiJParSemaine,
      demiTjm,
      demiTjmPremium,
    };
  });

  const handleClickProposition = (proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
  }) => {
    const {
      entrepriseId,
      nomPrestataire,
      sloganPrestataire,
      logoStorageKey,
      demiJParSemaine,
      demiTjm,
      demiTjmPremium,
    } = proposition;

    if (
      officeManager.infos.entrepriseId === entrepriseId &&
      officeManager.infos.gammeSelected
    ) {
      setOfficeManager((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          entrepriseId: null,
          nomPrestataire: null,
          sloganPrestataire: null,
          logoStorageKey: null,
          gammeSelected: null,
        },
        // quantites: {
        //   demiJParSemaine: null,
        // },
        prix: {
          demiTjm: null,
          demiTjmPremium: null,
        },
      }));
      return;
    }
    setOfficeManager((prev) => ({
      infos: {
        ...prev.infos,
        entrepriseId,
        nomPrestataire,
        sloganPrestataire,
        logoStorageKey,
        gammeSelected:
          demiJParSemaine !== null &&
          demiJParSemaineConfort !== null &&
          demiJParSemaineExcellence !== null
            ? demiJParSemaine < demiJParSemaineConfort
              ? "essentiel"
              : demiJParSemaine < demiJParSemaineExcellence
                ? "confort"
                : "excellence"
            : null,
      },
      quantites: {
        demiJParSemaine,
      },
      prix: {
        demiTjm,
        demiTjmPremium,
      },
    }));
  };

  const handleChangeDemiJParSemaine = (value: number[]) => {
    const newDemiJ = value[0];
    setOfficeManager((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        gammeSelected:
          demiJParSemaineConfort !== null && demiJParSemaineExcellence !== null
            ? newDemiJ < demiJParSemaineConfort
              ? "essentiel"
              : newDemiJ < demiJParSemaineExcellence
                ? "confort"
                : "excellence"
            : prev.infos.gammeSelected,
      },
      quantites: {
        demiJParSemaine: newDemiJ,
      },
    }));
  };

  const handleChangeRemplace = (value: string) => {
    setOfficeManager((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        remplace: value === "remplace",
      },
    }));
  };

  const handleCheckPremium = (checked: boolean) => {
    setOfficeManager((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        premium: checked,
      },
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <OfficeManagerMobilePropositions
      propositions={propositions}
      demiJParSemaineEssentiel={demiJParSemaineEssentiel}
      demiJParSemaineConfort={demiJParSemaineConfort}
      demiJParSemaineExcellence={demiJParSemaineExcellence}
      handleChangeDemiJParSemaine={handleChangeDemiJParSemaine}
      handleChangeRemplace={handleChangeRemplace}
      handleCheckPremium={handleCheckPremium}
      handleClickProposition={handleClickProposition}
    />
  ) : (
    <OfficeManagerDesktopPropositions
      propositions={propositions}
      demiJParSemaineEssentiel={demiJParSemaineEssentiel}
      demiJParSemaineConfort={demiJParSemaineConfort}
      demiJParSemaineExcellence={demiJParSemaineExcellence}
      handleChangeDemiJParSemaine={handleChangeDemiJParSemaine}
      handleChangeRemplace={handleChangeRemplace}
      handleCheckPremium={handleCheckPremium}
      handleClickProposition={handleClickProposition}
    />
  );
};

export default OfficeManagerPropositions;
