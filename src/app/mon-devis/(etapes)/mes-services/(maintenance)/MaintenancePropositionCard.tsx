"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { useContext } from "react";

type MaintenancePropositionCardProps = {
  proposition: {
    id: number;
    gamme: GammeType;
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number;
    totalAnnuelLegio: number;
    totalAnnuelQualiteAir: number;
    totalAnnuel: number | null;
  };
  handleClickProposition: (proposition: {
    id: number;
    gamme: GammeType;
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number;
    totalAnnuelLegio: number;
    totalAnnuelQualiteAir: number;
    totalAnnuel: number | null;
  }) => void;
};

const MaintenancePropositionCard = ({
  proposition,
  handleClickProposition,
}: MaintenancePropositionCardProps) => {
  const { maintenance } = useContext(MaintenanceContext);
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
    Math.round(proposition.totalAnnuel / 12)
  )} € / mois`;
  const tooltipEssentiel = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Essentiel</p>
      <p>Obligation légale et contrôles règlementaires</p>
    </div>
  );
  const tooltipConfort = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Confort</p>
      <p>
        Essentiel + recommandations ARS, petits travaux d’entretien tous les
        trois mois
      </p>
    </div>
  );
  const tooltipExcellence = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Excellence</p>
      <p>
        Une à deux fois par mois passage technicien / homme à tout faire pour
        maintenance & petits travaux. Lien technique avec le gestionnaire de
        l’immeuble
      </p>
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
            className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
              maintenance.infos.fournisseurId === proposition.fournisseurId &&
              maintenance.infos.gammeSelected === proposition.gamme
                ? "ring-4 ring-inset ring-destructive"
                : ""
            }`}
            onClick={() => handleClickProposition(proposition)}
          >
            <Checkbox
              checked={
                maintenance.infos.fournisseurId === proposition.fournisseurId &&
                maintenance.infos.gammeSelected === proposition.gamme
              }
              onCheckedChange={() => handleClickProposition(proposition)}
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{totalMensuelText}</p>
              <p className="text-sm">
                {proposition.freqAnnuelle} passage(s) de{" "}
                {proposition.hParPassage} h / an
              </p>
              {proposition.gamme === "essentiel" && (
                <p className="text-sm">+ contrôle Q18</p>
              )}
              {proposition.gamme === "confort" && (
                <>
                  <p className="text-sm">+ contrôle Q18</p>
                  <p className="text-sm">+ contrôle Legio</p>
                </>
              )}
              {proposition.gamme === "excellence" && (
                <>
                  <p className="text-sm">+ contrôle Q18</p>
                  <p className="text-sm">+ contrôle Legio</p>
                  <p className="text-sm">+ contrôle Qualité Air</p>
                </>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MaintenancePropositionCard;
