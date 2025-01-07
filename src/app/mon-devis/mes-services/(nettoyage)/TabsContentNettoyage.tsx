import { Checkbox } from "@/components/ui/checkbox";
import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { PropreteContext } from "@/context/PropreteProvider";
import { formatNumber } from "@/lib/formatNumber";
import { GammeType } from "@/zod-schemas/gamme";
import { useContext } from "react";

type TabsContentNettoyageProps = {
  formattedNettoyagePropositions: {
    fournisseurId: number;
    nomEntreprise: string;
    slogan: string | null;
    id: number;
    surface: number;
    gamme: "essentiel" | "confort" | "excellence";
    createdAt: Date;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
    freqAnnuelle: number;
    prixAnnuelSamedi: number;
    prixAnnuelDimanche: number;
  }[][];
  nettoyagePropositions: {
    surface: number;
    id: number;
    fournisseurId: number;
    nomEntreprise: string;
    slogan: string | null;
    createdAt: Date;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
    prixAnnuel: number;
    freqAnnuelle: number;
    prixAnnuelSamedi: number;
    prixAnnuelDimanche: number;
  }[];
};

const TabsContentNettoyage = ({
  formattedNettoyagePropositions,
  nettoyagePropositions,
}: TabsContentNettoyageProps) => {
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setProprete } = useContext(PropreteContext);

  const handleClickProposition = (propositionId: number) => {
    if (nettoyage.propositionId === propositionId) {
      setNettoyage({
        fournisseurId: null,
        propositionId: null,
        gammeSelected: null,
        repassePropositionId: null,
        samediPropositionId: null,
        dimanchePropositionId: null,
        vitreriePropositionId: null,
        nbPassageVitrerie: 2,
      });
      setProprete({
        fournisseurId: null,
        nbDistribEmp: 0,
        nbDistribSavon: 0,
        nbDistribPh: 0,
        nbDistribDesinfectant: 0,
        nbDistribParfum: 0,
        nbDistribBalai: 0,
        nbDistribPoubelle: 0,
        dureeLocation: "pa36M",
        trilogieGammeSelected: null,
        desinfectantGammeSelected: null,
        parfumGammeSelected: null,
        balaiGammeSelected: null,
        poubelleGammeSelected: null,
      });
      return;
    }
    const nettoyageFournisseurId = nettoyagePropositions.find(
      (nettoyage) => nettoyage.id === propositionId
    )?.fournisseurId as number;
    const gammeSelected = nettoyagePropositions.find(
      (nettoyage) => nettoyage.id === propositionId
    )?.gamme as GammeType;

    setNettoyage((prev) => ({
      ...prev,
      fournisseurId: nettoyageFournisseurId,
      propositionId,
      gammeSelected,
      repassePropositionId: null,
      samediPropositionId: null,
      dimanchePropositionId: null,
      vitreriePropositionId: null,
      nbPassageVitrerie: 2,
    }));

    const propreteFournisseurId =
      (nettoyagePropositions.find((nettoyage) => nettoyage.id === propositionId)
        ?.fournisseurId as number) === 9
        ? 12
        : (nettoyagePropositions.find(
            (nettoyage) => nettoyage.id === propositionId
          )?.fournisseurId as number);

    setProprete((prev) => ({
      ...prev,
      fournisseurId: propreteFournisseurId,
      dureeLocation: "pa36M",
      trilogieGammeSelected: null,
      desinfectantGammeSelected: null,
      parfumGammeSelected: null,
      balaiGammeSelected: null,
      poubelleGammeSelected: null,
    }));
  };
  return (
    <TabsContent value="nettoyage" className="flex-1">
      <div className="h-full flex flex-col border rounded-xl overflow-hidden">
        {formattedNettoyagePropositions.length > 0
          ? formattedNettoyagePropositions.map((propositions) => (
              <div
                className="flex border-b flex-1"
                key={propositions[0].fournisseurId}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex w-1/4 items-center justify-center">
                        {propositions[0].nomEntreprise}
                      </div>
                    </TooltipTrigger>
                    {propositions[0].slogan && (
                      <TooltipContent>
                        <p className="text-sm italic">
                          {propositions[0].slogan}
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
                  return (
                    <div
                      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                        nettoyage.propositionId === proposition.id
                          ? "ring-2 ring-inset ring-destructive"
                          : ""
                      }`}
                      key={proposition.id}
                      onClick={() => handleClickProposition(proposition.id)}
                    >
                      <Checkbox
                        checked={nettoyage.propositionId === proposition.id}
                        onCheckedChange={() =>
                          handleClickProposition(proposition.id)
                        }
                        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                      />
                      <div>
                        <p className="font-bold">
                          {formatNumber(proposition.prixAnnuel)} € / an
                        </p>
                        <p className="text-base">
                          {formatNumber(
                            ((proposition.hParPassage / 10000) *
                              proposition.freqAnnuelle) /
                              10000 /
                              52.008
                          )}{" "}
                          h / semaine*
                        </p>
                        <p className="text-xs">
                          {formatNumber(
                            proposition.freqAnnuelle / (10000 * 52.008)
                          )}{" "}
                          passage(s) de {proposition.hParPassage / 10000}h /
                          semaine
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          : null}
      </div>
    </TabsContent>
  );
};

export default TabsContentNettoyage;

//heures par an = heures par passage * frequence annuelle

// X passages par an
// Y passages par semaine = X / 52.008
