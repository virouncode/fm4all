"use client";

import { useOfficeManagerStore } from "@/stores/officeManagerStore";
import { useTotalOfficeManagerStore } from "@/stores/totalOfficeManagerStore";
import { SelectOfficeManagerQuantitesType } from "@/zod-schemas/officeManagerQuantites";
import { SelectOfficeManagerTarifsType } from "@/zod-schemas/officeManagerTarifs";
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
  const setTotalOfficeManager = useTotalOfficeManagerStore(
    (s) => s.setTotalOfficeManager,
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
    let { fournisseurId, nomFournisseur, slogan } = tarif;
    const { id, demiTjm, demiTjmPremium, logoUrl } = tarif;
    if (fournisseurId === 14) {
      fournisseurId = 16;
      nomFournisseur = "FM4ALL";
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
      fournisseurId,
      nomFournisseur,
      sloganFournisseur: slogan,
      logoUrl,
      totalAnnuel,
      demiJParSemaine,
      demiTjm,
      demiTjmPremium,
    };
  });

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
  }) => {
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      logoUrl,
      totalAnnuel,
      demiJParSemaine,
      demiTjm,
      demiTjmPremium,
    } = proposition;

    if (
      officeManager.infos.fournisseurId === fournisseurId &&
      officeManager.infos.gammeSelected
    ) {
      setOfficeManager((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
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
      setTotalOfficeManager({
        totalService: null,
      });
      return;
    }
    setOfficeManager((prev) => ({
      infos: {
        ...prev.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        logoUrl,
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
    setTotalOfficeManager({
      totalService: totalAnnuel,
    });
  };

  const handleChangeDemiJParSemaine = (
    value: number[],
    demiTauxJournalier: number | null,
  ) => {
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
    if (officeManager.infos.gammeSelected) {
      const newMajoration =
        newDemiJ <= 1
          ? 20
          : newDemiJ <= 2
            ? 15
            : newDemiJ <= 3
              ? 10
              : newDemiJ <= 4
                ? 5
                : 0;
      const totalAnnuel =
        demiTauxJournalier !== null
          ? officeManager.infos.remplace
            ? newDemiJ * demiTauxJournalier * 52 * (1 + newMajoration / 100)
            : newDemiJ * demiTauxJournalier * 47 * (1 + newMajoration / 100)
          : null;
      setTotalOfficeManager({
        totalService: totalAnnuel,
      });
    }
  };

  const handleChangeRemplace = (value: string) => {
    setOfficeManager((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        remplace: value === "remplace",
      },
    }));
    if (officeManager.infos.gammeSelected) {
      const demiJParSemaine =
        officeManager.quantites.demiJParSemaine ?? demiJParSemaineEssentiel;
      const newMajoration =
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
      const demiTauxJournalier = officeManager.infos.premium
        ? officeManager.prix.demiTjmPremium
        : officeManager.prix.demiTjm;
      const totalAnnuel =
        demiJParSemaine !== null &&
        demiTauxJournalier !== null &&
        newMajoration !== null
          ? value === "remplace"
            ? demiJParSemaine *
              demiTauxJournalier *
              52 *
              (1 + newMajoration / 100)
            : demiJParSemaine *
              demiTauxJournalier *
              47 *
              (1 + newMajoration / 100)
          : null;
      setTotalOfficeManager({
        totalService: totalAnnuel,
      });
    }
  };

  const handleCheckPremium = (checked: boolean) => {
    setOfficeManager((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        premium: checked,
      },
    }));
    if (officeManager.infos.gammeSelected) {
      const demiJParSemaine =
        officeManager.quantites.demiJParSemaine ?? demiJParSemaineEssentiel;
      const newMajoration =
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
      const demiTauxJournalier = checked
        ? officeManager.prix.demiTjmPremium
        : officeManager.prix.demiTjm;

      const totalAnnuel =
        demiJParSemaine !== null &&
        demiTauxJournalier !== null &&
        newMajoration !== null
          ? officeManager.infos.remplace === true
            ? demiJParSemaine *
              demiTauxJournalier *
              52 *
              (1 + newMajoration / 100)
            : demiJParSemaine *
              demiTauxJournalier *
              47 *
              (1 + newMajoration / 100)
          : null;
      setTotalOfficeManager({
        totalService: totalAnnuel,
      });
    }
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
