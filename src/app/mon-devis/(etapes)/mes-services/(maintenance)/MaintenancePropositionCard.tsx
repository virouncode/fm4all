"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MARGE } from "@/constants/constants";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import { useContext } from "react";

type MaintenancePropositionCardProps = {
  proposition: {
    id: number;
    gamme: GammeType;
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  };
  handleClickProposition: (proposition: {
    id: number;
    gamme: GammeType;
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
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
    Math.round((proposition.totalAnnuel * MARGE) / 12)
  )} € / mois`;

  const infosEssentiel = <p>Obligation légale et contrôles règlementaires</p>;
  const infosConfort = (
    <p>
      Essentiel + recommandations ARS, petits travaux d’entretien tous les trois
      mois
    </p>
  );
  const infosExcellence = (
    <p>
      Une à deux fois par mois passage technicien / homme à tout faire pour
      maintenance & petits travaux. Lien technique avec le gestionnaire de
      l’immeuble
    </p>
  );

  const infosTitle = (
    <p className={`text-${getFm4AllColor(proposition.gamme)} text-center`}>
      {proposition.gamme === "essentiel"
        ? "Essentiel"
        : proposition.gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
  );

  const infosProduit = (
    <div className="flex flex-col text-sm my-4">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
        ? infosConfort
        : infosExcellence}
    </div>
  );
  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        maintenance.infos.fournisseurId === proposition.fournisseurId &&
        maintenance.infos.gammeSelected === proposition.gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
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
        aria-label="Sélectionner cette proposition"
      />
      <div>
        <div className="flex gap-2">
          <p className="font-bold">{totalMensuelText}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Info size={16} onClick={(e) => e.stopPropagation()} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{infosTitle}</DialogTitle>
              </DialogHeader>
              {infosProduit}
            </DialogContent>
          </Dialog>
        </div>
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
