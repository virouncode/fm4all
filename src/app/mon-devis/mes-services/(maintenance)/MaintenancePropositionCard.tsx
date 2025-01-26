"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
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
    prixAnnuelService: number | null;
    prixAnnuelQ18: number;
    prixAnnuelLegio: number;
    prixAnnuelQualiteAir: number;
    total: number | null;
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
    prixAnnuelService: number | null;
    prixAnnuelQ18: number;
    prixAnnuelLegio: number;
    prixAnnuelQualiteAir: number;
    total: number | null;
  }) => void;
};

const MaintenancePropositionCard = ({
  proposition,
  handleClickProposition,
}: MaintenancePropositionCardProps) => {
  const { maintenance } = useContext(MaintenanceContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  const prixMensuelText = proposition.total
    ? `${Math.round(proposition.total / 12)} € / mois`
    : "Non proposé";
  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
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
        <p className="font-bold">{prixMensuelText}</p>
        <p className="text-sm">
          {proposition.freqAnnuelle} passage(s) de {proposition.hParPassage} h /
          an
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
  );
};

export default MaintenancePropositionCard;
