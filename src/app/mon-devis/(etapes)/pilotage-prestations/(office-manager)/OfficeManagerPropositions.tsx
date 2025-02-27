"use client";

import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { SelectOfficeManagerQuantitesType } from "@/zod-schemas/officeManagerQuantites";
import { SelectOfficeManagerTarifsType } from "@/zod-schemas/officeManagerTarifs";
import { useContext } from "react";
import OfficeManagerFournisseurLogo from "./OfficeManagerFournisseurLogo";
import OfficeManagerInputs from "./OfficeManagerInputs";
import OfficeManagerPropositionCard from "./OfficeManagerPropositionCard";

type OfficeManagerPropositionsProps = {
  officeManagerQuantites: SelectOfficeManagerQuantitesType[];
  officeManagerTarifs: SelectOfficeManagerTarifsType[];
};

const OfficeManagerPropositions = ({
  officeManagerQuantites,
  officeManagerTarifs,
}: OfficeManagerPropositionsProps) => {
  const { officeManager, setOfficeManager } = useContext(OfficeManagerContext);
  const { setTotalOfficeManager } = useContext(TotalOfficeManagerContext);

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
    officeManager.quantites.demiJParSemaine || demiJParSemaineEssentiel;

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

  const formattedPropositions = officeManagerTarifs.map((tarif) => {
    let { fournisseurId, nomFournisseur, slogan } = tarif;
    const { id, demiTjm, demiTjmPremium, logoUrl } = tarif;
    if (fournisseurId === 14) {
      fournisseurId = 16;
      nomFournisseur = "FM4ALL";
      slogan = "L'office management pour tous";
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
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
          gammeSelected: null,
        },
        quantites: {
          demiJParSemaine: null,
        },
        prix: {
          demiTjm: null,
          demiTjmPremium: null,
        },
      }));
      setTotalOfficeManager({
        totalService: 0,
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
    demiTauxJournalier: number | null
  ) => {
    setOfficeManager((prev) => ({
      ...prev,
      quantites: {
        demiJParSemaine: value[0],
      },
    }));
    if (officeManager.infos.gammeSelected) {
      const newMajoration =
        value[0] <= 1
          ? 20
          : value[0] <= 2
          ? 15
          : value[0] <= 3
          ? 10
          : value[0] <= 4
          ? 5
          : 0;
      const totalAnnuel =
        demiTauxJournalier !== null
          ? officeManager.infos.remplace
            ? value[0] * demiTauxJournalier * 52 * (1 + newMajoration / 100)
            : value[0] * demiTauxJournalier * 47 * (1 + newMajoration / 100)
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
        officeManager.quantites.demiJParSemaine || demiJParSemaineEssentiel;
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
        officeManager.quantites.demiJParSemaine || demiJParSemaineEssentiel;
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

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((proposition) => {
            return (
              <div className="flex border-b flex-1" key={proposition.id}>
                <div className="flex w-1/4 items-center justify-center flex-col gap-6 p-4">
                  <OfficeManagerFournisseurLogo
                    nomFournisseur={proposition.nomFournisseur}
                    sloganFournisseur={proposition.sloganFournisseur}
                    logoUrl={proposition.logoUrl}
                  />
                  <OfficeManagerInputs
                    demiJParSemaineEssentiel={demiJParSemaineEssentiel}
                    handleChangeDemiJParSemaine={handleChangeDemiJParSemaine}
                    handleChangeRemplace={handleChangeRemplace}
                    demiTjm={proposition.demiTjm}
                    demiTjmPremium={proposition.demiTjmPremium}
                    handleCheckPremium={handleCheckPremium}
                  />
                </div>
                <OfficeManagerPropositionCard
                  proposition={proposition}
                  handleClickProposition={handleClickProposition}
                  demiJParSemaineConfort={demiJParSemaineConfort}
                  demiJParSemaineExcellence={demiJParSemaineExcellence}
                />
              </div>
            );
          })
        : null}
    </div>
  );
};

export default OfficeManagerPropositions;
