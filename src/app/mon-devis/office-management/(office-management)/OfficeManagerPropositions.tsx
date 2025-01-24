"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
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
  const demiJParSemaineConfort =
    officeManagerQuantites.find((q) => q.gamme === "confort")
      ?.demiJParSemaine ?? 0;
  const demiJParSemaineExcellence =
    officeManagerQuantites.find((q) => q.gamme === "excellence")
      ?.demiJParSemaine ?? 0;

  const demiJParSemaine =
    officeManager.quantites.demiJParSemaine || demiJParSemaineEssentiel;

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

  const formattedPropositions: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    prixAnnuel: number;
    demiJParSemaine: number;
    demiTjm: number;
  }[] = officeManagerTarifs.map((tarif) => {
    let { fournisseurId, nomFournisseur, slogan } = tarif;
    const { id, demiTjm } = tarif;
    if (fournisseurId === 14) {
      fournisseurId = 15;
      nomFournisseur = "FM4ALL";
      slogan = "L'office management pour tous";
    }
    const prixAnnuel = officeManager.infos.remplace
      ? Math.round(demiJParSemaine * demiTjm * 52 * (1 + majoration / 100))
      : Math.round(demiJParSemaine * demiTjm * 47 * (1 + majoration / 100));

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
    prixAnnuel: number;
    demiJParSemaine: number;
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
        gammeSelected:
          demiJParSemaine < demiJParSemaineConfort
            ? "essentiel"
            : demiJParSemaine < demiJParSemaineExcellence
            ? "confort"
            : "excellence",
        remplace: true,
      },
      quantites: {
        demiJParSemaine,
      },
      prix: {
        demiTjm,
      },
    });
    setTotalOfficeManager({
      totalService: prixAnnuel,
    });
  };

  const handleChangeDemiJParSemaine = (value: number[], demiTjm: number) => {
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
      const prixAnnuel = officeManager.infos.remplace
        ? Math.round(value[0] * demiTjm * 52 * (1 + newMajoration / 100))
        : Math.round(value[0] * demiTjm * 47 * (1 + newMajoration / 100));
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
        demiJParSemaine <= 1
          ? 20
          : demiJParSemaine <= 2
          ? 15
          : demiJParSemaine <= 3
          ? 10
          : demiJParSemaine <= 4
          ? 5
          : 0;
      const prixAnnuel =
        value === "remplace"
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
            );
      setTotalOfficeManager({
        totalService: prixAnnuel,
      });
    }
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((proposition) => {
            const color =
              demiJParSemaine < demiJParSemaineConfort
                ? "fm4allessential"
                : demiJParSemaine < demiJParSemaineExcellence
                ? "fm4allcomfort"
                : "fm4allexcellence";
            const prixAnnuelText = proposition.prixAnnuel
              ? `${Math.round(proposition.prixAnnuel / 12)} € / mois*`
              : "Non proposé";
            const demiJParSemaineText = `${proposition.demiJParSemaine} demi journée(s) / semaine`;
            return (
              <div className="flex border-b flex-1" key={proposition.id}>
                <div className="flex w-1/4 items-center justify-center flex-col gap-6 p-4">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center p-4 h-1/2 w-full">
                          {getLogoFournisseurUrl(proposition.fournisseurId) ? (
                            <div className="w-full h-full relative">
                              <Image
                                src={
                                  getLogoFournisseurUrl(
                                    proposition.fournisseurId
                                  ) as string
                                }
                                alt={`logo-de-${proposition.nomFournisseur}`}
                                fill={true}
                                className="w-full h-full object-contain"
                                quality={100}
                              />
                            </div>
                          ) : (
                            proposition.nomFournisseur
                          )}
                        </div>
                      </TooltipTrigger>
                      {proposition.sloganFournisseur && (
                        <TooltipContent>
                          <p className="text-sm italic">
                            {proposition.sloganFournisseur}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex gap-4 items-center flex-col  w-full">
                    <Slider
                      value={[
                        officeManager.quantites.demiJParSemaine ||
                          demiJParSemaineEssentiel,
                      ]}
                      onValueChange={(value: number[]) =>
                        handleChangeDemiJParSemaine(value, proposition.demiTjm)
                      }
                      min={1}
                      max={20}
                      step={1}
                    />
                    <Label htmlFor="demiJParSemaine" className="text-sm flex-1">
                      {officeManager.quantites.demiJParSemaine} demi journée(s)
                      / semaine
                    </Label>
                  </div>
                  <div>
                    <RadioGroup
                      onValueChange={handleChangeRemplace}
                      value={
                        officeManager.infos.remplace
                          ? "remplace"
                          : "non remplace"
                      }
                      className="flex gap-4 flex-col items-center"
                      name="typeBoissons"
                    >
                      <div className="flex gap-2 items-center">
                        <RadioGroupItem
                          value={"remplace"}
                          title={"Remplacé pendant congés"}
                          id={"remplace"}
                        />
                        <Label htmlFor={`remplace`}>
                          Remplacé pendant congés
                        </Label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <RadioGroupItem
                          value={"non remplace"}
                          title={"Non remplacé pendant congés"}
                          id={"non_remplace"}
                        />
                        <Label htmlFor={"non_remplace"}>
                          Non remplacé pendant congés
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div
                  className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                    officeManager.infos.fournisseurId ===
                      proposition.fournisseurId &&
                    officeManager.infos.gammeSelected !== null
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
                      officeManager.infos.gammeSelected !== null
                    }
                    onCheckedChange={() => handleClickProposition(proposition)}
                    className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  />
                  <div>
                    <p className="font-bold">{prixAnnuelText}</p>
                    <p className="text-sm">{demiJParSemaineText}</p>
                  </div>
                </div>
              </div>
            );
          })
        : null}
    </div>
  );
};

export default OfficeManagerPropositions;
