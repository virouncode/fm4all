"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectOfficeManagerQuantitesType } from "@/zod-schemas/officeManagerQuantites";
import { SelectOfficeManagerTarifsType } from "@/zod-schemas/officeManagerTarifs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import Image from "next/image";
import { useContext } from "react";

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

  const demiJParSemaineEssentiel =
    officeManagerQuantites.find((q) => q.gamme === "essentiel")
      ?.demiJParSemaine ?? 0;
  const majorationEssentiel =
    officeManagerQuantites.find((q) => q.gamme === "essentiel")?.majoration ??
    0;
  const demiJParSemaineConfort =
    officeManagerQuantites.find((q) => q.gamme === "confort")
      ?.demiJParSemaine ?? 0;
  const majorationConfort =
    officeManagerQuantites.find((q) => q.gamme === "confort")?.majoration ?? 0;
  const demiJParSemaineExcellence =
    officeManagerQuantites.find((q) => q.gamme === "excellence")
      ?.demiJParSemaine ?? 0;
  const majorationExcellence =
    officeManagerQuantites.find((q) => q.gamme === "excellence")?.majoration ??
    0;

  const formattedPropositions: {
    id: string;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: GammeType;
    prixAnnuel: number;
    demiJParSemaine: number;
  }[][] = officeManagerTarifs.map((tarif) => {
    let { fournisseurId, nomFournisseur, slogan } = tarif;
    const { id, demiTjm } = tarif;
    if (fournisseurId === 14) {
      fournisseurId = 15;
      nomFournisseur = "FM4ALL";
      slogan = "L'office management pour tous";
    }
    const prixAnnuelEssentiel = officeManager.infos.remplace
      ? Math.round(
          demiJParSemaineEssentiel *
            demiTjm *
            52 *
            (1 + majorationEssentiel / 100)
        )
      : Math.round(
          demiJParSemaineEssentiel *
            demiTjm *
            47 *
            (1 + majorationEssentiel / 100)
        );
    const prixAnnuelConfort = officeManager.infos.remplace
      ? Math.round(
          demiJParSemaineConfort * demiTjm * 52 * (1 + majorationConfort / 100)
        )
      : Math.round(
          demiJParSemaineConfort * demiTjm * 47 * (1 + majorationConfort / 100)
        );
    const prixAnnuelExcellence = officeManager.infos.remplace
      ? Math.round(
          demiJParSemaineExcellence *
            demiTjm *
            52 *
            (1 + majorationExcellence / 100)
        )
      : Math.round(
          demiJParSemaineExcellence *
            demiTjm *
            47 *
            (1 + majorationExcellence / 100)
        );
    return [
      {
        id: id.toString() + "essentiel",
        fournisseurId,
        nomFournisseur,
        sloganFournisseur: slogan,
        gamme: "essentiel",
        prixAnnuel: prixAnnuelEssentiel,
        demiJParSemaine: demiJParSemaineEssentiel,
      },
      {
        id: id.toString() + "confort",
        fournisseurId,
        nomFournisseur,
        sloganFournisseur: slogan,
        gamme: "confort",
        prixAnnuel: prixAnnuelConfort,
        demiJParSemaine: demiJParSemaineConfort,
      },
      {
        id: id.toString() + "excellence",
        fournisseurId,
        nomFournisseur,
        sloganFournisseur: slogan,
        gamme: "excellence",
        prixAnnuel: prixAnnuelExcellence,
        demiJParSemaine: demiJParSemaineExcellence,
      },
    ];
  });

  const handleClickProposition = (proposition: {
    id: string;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: GammeType;
    prixAnnuel: number;
    demiJParSemaine: number;
  }) => {
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      gamme,
      prixAnnuel,
      demiJParSemaine,
    } = proposition;

    if (
      officeManager.infos.fournisseurId === fournisseurId &&
      officeManager.infos.gammeSelected === gamme
    ) {
      setOfficeManager({
        infos: {
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          gammeSelected: null,
          remplace: true,
        },
        quantites: {
          demiJParSemaine: null,
        },
        prix: {
          demiTjm: 0,
        },
      });
      setTotalOfficeManager({
        totalService: 0,
      });
      return;
    }
    setOfficeManager({
      infos: {
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        gammeSelected: gamme,
        remplace: true,
      },
      quantites: {
        demiJParSemaine,
      },
      prix: {
        demiTjm: prixAnnuel,
      },
    });
    setTotalOfficeManager({
      totalService: prixAnnuel,
    });
  };

  const handleChangeDemiJParSemaine = (value: number) => {
    setOfficeManager({
      ...officeManager,
      quantites: {
        demiJParSemaine: value,
      },
    });
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex border-b flex-1"
              key={propositions[0].fournisseurId}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex w-1/4 items-center justify-center p-4">
                      <div className="flex flex-col gap-2 items-center justify-center w-full">
                        {getLogoFournisseurUrl(
                          propositions[0].fournisseurId
                        ) ? (
                          <div className="w-full h-full relative">
                            <Image
                              src={
                                getLogoFournisseurUrl(
                                  propositions[0].fournisseurId
                                ) as string
                              }
                              alt={`logo-de-${propositions[0].nomFournisseur}`}
                              fill={true}
                              className="w-full h-full object-contain"
                              quality={100}
                            />
                          </div>
                        ) : (
                          propositions[0].nomFournisseur
                        )}
                        <Slider
                          value={[
                            officeManager.quantites.demiJParSemaine ||
                              demiJParSemaineEssentiel,
                          ]}
                          onValueChange={handleChangeDemiJParSemaine}
                          min={1}
                          max={20}
                          step={1}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  {propositions[0].sloganFournisseur && (
                    <TooltipContent>
                      <p className="text-sm italic">
                        {propositions[0].sloganFournisseur}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {propositions.map((proposition) => {
                const gamme = proposition.gamme;
                const color =
                  gamme === "essentiel"
                    ? "fm4allessential"
                    : gamme === "confort"
                    ? "fm4allcomfort"
                    : "fm4allexcellence";
                const prixAnnuelText = proposition.prixAnnuel
                  ? `${formatNumber(proposition.prixAnnuel)} € /an`
                  : "Non proposé";
                const demiJParSemaineText = `${proposition.demiJParSemaine} demi journée(s) / semaine`;

                return (
                  <div
                    className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                      officeManager.infos.fournisseurId ===
                        proposition.fournisseurId &&
                      officeManager.infos.gammeSelected === gamme
                        ? "ring-4 ring-inset ring-destructive"
                        : ""
                    }`}
                    key={proposition.id}
                    onClick={() => handleClickProposition(proposition)}
                  >
                    <Checkbox
                      checked={
                        officeManager.infos.fournisseurId ===
                          proposition.fournisseurId &&
                        officeManager.infos.gammeSelected === gamme
                      }
                      onCheckedChange={() =>
                        handleClickProposition(proposition)
                      }
                      className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    />
                    <div>
                      <p className="font-bold">{prixAnnuelText}</p>
                      <p className="text-sm">{demiJParSemaineText}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        : null}
    </div>
  );
};

export default OfficeManagerPropositions;
