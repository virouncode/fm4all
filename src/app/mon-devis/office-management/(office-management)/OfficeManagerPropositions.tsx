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
    const { id, demiTjm } = tarif;
    if (fournisseurId === 14) {
      fournisseurId = 15;
      nomFournisseur = "FM4ALL";
      slogan = "L'office management pour tous";
    }
    const prixAnnuel =
      demiJParSemaine !== null && majoration !== null
        ? officeManager.infos.remplace
          ? Math.round(demiJParSemaine * demiTjm * 52 * (1 + majoration / 100))
          : Math.round(demiJParSemaine * demiTjm * 47 * (1 + majoration / 100))
        : null;

    return {
      id,
      fournisseurId,
      nomFournisseur,
      sloganFournisseur: slogan,
      prixAnnuel,
      demiJParSemaine,
      demiTjm,
    };
  });

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    prixAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
  }) => {
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      prixAnnuel,
      demiJParSemaine,
      demiTjm,
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
          gammeSelected: null,
        },
        quantites: {
          demiJParSemaine: null,
        },
        prix: {
          demiTjm: null,
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
      },
    }));
    setTotalOfficeManager({
      totalService: prixAnnuel,
    });
  };

  const handleChangeDemiJParSemaine = (
    value: number[],
    demiTjm: number | null
  ) => {
    setOfficeManager({
      ...officeManager,
      quantites: {
        demiJParSemaine: value[0],
      },
    });
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
      const prixAnnuel =
        demiTjm !== null
          ? officeManager.infos.remplace
            ? Math.round(value[0] * demiTjm * 52 * (1 + newMajoration / 100))
            : Math.round(value[0] * demiTjm * 47 * (1 + newMajoration / 100))
          : null;
      setTotalOfficeManager({
        totalService: prixAnnuel,
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
      const prixAnnuel =
        demiJParSemaine !== null &&
        officeManager.prix.demiTjm !== null &&
        newMajoration !== null
          ? value === "remplace"
            ? Math.round(
                demiJParSemaine *
                  officeManager.prix.demiTjm *
                  52 *
                  (1 + newMajoration / 100)
              )
            : Math.round(
                demiJParSemaine *
                  officeManager.prix.demiTjm *
                  47 *
                  (1 + newMajoration / 100)
              )
          : null;
      setTotalOfficeManager({
        totalService: prixAnnuel,
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
                    fournisseurId={proposition.fournisseurId}
                    nomFournisseur={proposition.nomFournisseur}
                    sloganFournisseur={proposition.sloganFournisseur}
                  />
                  <OfficeManagerInputs
                    demiJParSemaineEssentiel={demiJParSemaineEssentiel}
                    handleChangeDemiJParSemaine={handleChangeDemiJParSemaine}
                    handleChangeRemplace={handleChangeRemplace}
                    demiTjm={proposition.demiTjm}
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
