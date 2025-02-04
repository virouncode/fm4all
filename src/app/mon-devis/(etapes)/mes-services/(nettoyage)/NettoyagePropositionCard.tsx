"use client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { S_OUVREES_PAR_AN } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { useContext } from "react";

type NettoyagePropositionCardProps = {
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    totalAnnuel: number | null;
  }) => void;
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    totalAnnuel: number | null;
  };
};

const NettoyagePropositionCard = ({
  handleClickProposition,
  proposition,
}: NettoyagePropositionCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4`}
      >
        Non proposé
      </div>
    );
  }
  const totalMensuelText = `${formatNumber(
    proposition.totalAnnuel / 12
  )} € / mois`;
  const hParSemaineText =
    proposition.hParPassage && proposition.freqAnnuelle
      ? `${formatNumber(
          (proposition.hParPassage * proposition.freqAnnuelle) /
            S_OUVREES_PAR_AN
        )} h / semaine*`
      : "";
  const nbPassagesParSemaineText =
    proposition.freqAnnuelle && proposition.hParPassage
      ? `${formatNumber(
          proposition.freqAnnuelle / S_OUVREES_PAR_AN
        )} passage(s) de ${proposition.hParPassage}h / semaine`
      : "";
  const tooltipEssentiel = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Essentiel</p>
      <p>Entretien fonctionnel et optimisé</p>
    </div>
  );
  const tooltipConfort = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Confort</p>
      <p>Equilibre parfait entre qualité et efficacité</p>
    </div>
  );
  const tooltipExcellence = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Excellence</p>
      <p>Un standard de propreté exemplaire</p>
    </div>
  );
  const tooltip =
    gamme === "essentiel"
      ? tooltipEssentiel
      : gamme === "confort"
      ? tooltipConfort
      : tooltipExcellence;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer p-4 ${
              nettoyage.infos.fournisseurId === proposition.fournisseurId &&
              nettoyage.infos.gammeSelected === proposition.gamme
                ? "ring-4 ring-inset ring-destructive"
                : ""
            }`}
            key={proposition.id}
            onClick={() => handleClickProposition(proposition)}
          >
            <Checkbox
              checked={
                nettoyage.infos.fournisseurId === proposition.fournisseurId &&
                nettoyage.infos.gammeSelected === proposition.gamme
              }
              onCheckedChange={() => handleClickProposition(proposition)}
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{totalMensuelText}</p>
              <p className="text-base">{hParSemaineText}</p>
              <p className="text-xs">{nbPassagesParSemaineText}</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NettoyagePropositionCard;
