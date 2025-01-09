import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { GammeType } from "@/zod-schemas/gamme";
import { useContext } from "react";

type NettoyagePropositionsProps = {
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

const NettoyagePropositions = ({
  formattedNettoyagePropositions,
  nettoyagePropositions,
}: NettoyagePropositionsProps) => {
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setHygiene } = useContext(HygieneContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

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
      setHygiene({
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
      setTotalNettoyage({
        nomFournisseur: null,
        prixService: null,
        prixRepasse: null,
        prixSamedi: null,
        prixDimanche: null,
        prixVitrerie: null,
      });
      setTotalHygiene({
        nomFournisseur: null,
        prixTrilogieAbonnement: null,
        prixTrilogieAchat: null,
        prixDesinfectantAbonnement: null,
        prixDesinfectantAchat: null,
        prixParfum: null,
        prixBalai: null,
        prixPoubelle: null,
      });
      return;
    }
    const nettoyageFournisseurId = nettoyagePropositions.find(
      (nettoyage) => nettoyage.id === propositionId
    )?.fournisseurId as number;
    const nettoyageFournisseurName = nettoyagePropositions.find(
      (nettoyage) => nettoyage.id === propositionId
    )?.nomEntreprise as string;
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

    setTotalNettoyage((prev) => ({
      ...prev,
      nomFournisseur: nettoyageFournisseurName,
      prixService: nettoyagePropositions.find(
        (nettoyage) => nettoyage.id === propositionId
      )?.prixAnnuel as number,
      prixRepasse: null,
      prixSamedi: null,
      prixDimanche: null,
      prixVitrerie: null,
    }));

    const hygieneFournisseurId =
      (nettoyagePropositions.find((nettoyage) => nettoyage.id === propositionId)
        ?.fournisseurId as number) === 9
        ? 12
        : (nettoyagePropositions.find(
            (nettoyage) => nettoyage.id === propositionId
          )?.fournisseurId as number);
    const hygieneFournisseurName =
      (nettoyagePropositions.find((nettoyage) => nettoyage.id === propositionId)
        ?.fournisseurId as number) === 9
        ? "EPCH"
        : (nettoyagePropositions.find(
            (nettoyage) => nettoyage.id === propositionId
          )?.nomEntreprise as string);

    setHygiene((prev) => ({
      ...prev,
      fournisseurId: hygieneFournisseurId,
      dureeLocation: "pa36M",
      trilogieGammeSelected: null,
      desinfectantGammeSelected: null,
      parfumGammeSelected: null,
      balaiGammeSelected: null,
      poubelleGammeSelected: null,
    }));
    setTotalHygiene({
      nomFournisseur: hygieneFournisseurName,
      prixTrilogieAbonnement: null,
      prixTrilogieAchat: null,
      prixDesinfectantAbonnement: null,
      prixDesinfectantAchat: null,
      prixParfum: null,
      prixBalai: null,
      prixPoubelle: null,
    });
  };
  return (
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
                      <p className="text-sm italic">{propositions[0].slogan}</p>
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
                const prixAnnuel = proposition.prixAnnuel
                  ? `${formatNumber(proposition.prixAnnuel)} € /an`
                  : "Non proposé";
                const hParSemaine =
                  proposition.hParPassage && proposition.freqAnnuelle
                    ? `${formatNumber(
                        (proposition.hParPassage * proposition.freqAnnuelle) /
                          52.008
                      )} h / semaine*`
                    : "";
                const nbPassagesParSemaine =
                  proposition.freqAnnuelle && proposition.hParPassage
                    ? `${formatNumber(
                        proposition.freqAnnuelle / 52.008
                      )} passages de ${proposition.hParPassage}h / semaine`
                    : "";

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
                      <p className="font-bold">{prixAnnuel}</p>
                      <p className="text-base">{hParSemaine}</p>
                      <p className="text-xs">{nbPassagesParSemaine}</p>
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

export default NettoyagePropositions;

//heures par an = heures par passage * frequence annuelle

// X passages par an
// Y passages par semaine = X / 52.008
