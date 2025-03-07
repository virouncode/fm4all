"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import Image from "next/image";
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
  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((proposition.totalAnnuel * MARGE) / 12))} €/mois
    </p>
  );

  const nbPassagesText = (
    <li className="list-check ">
      {proposition.freqAnnuelle} passage(s) de {proposition.hParPassage} h / an
    </li>
  );

  const infosEssentiel = (
    <>
      <li className="list-check ">
        Obligation légale et contrôles règlementaires
      </li>
      <li className="list-check">Contrôle Q18</li>
    </>
  );
  const infosConfort = (
    <>
      <li className="list-check ">
        Essentiel + recommandations ARS, petits travaux d’entretien tous les
        trois mois
      </li>
      <li className="list-check ">Contrôle Q18</li>
      <li className="list-check ">Contrôle Legionellose</li>
    </>
  );
  const infosExcellence = (
    <>
      <li className="list-check ">
        Une à deux fois par mois passage technicien pour maintenance & petits
        travaux. Lien technique avec le gestionnaire de l’immeuble
      </li>
      <li className="list-check ">Contrôle Q18</li>
      <li className="list-check ">Contrôle Legionellose</li>
      <li className="list-check ">Contrôle Qualité Air</li>
    </>
  );

  const infosProduit =
    gamme === "essentiel"
      ? infosEssentiel
      : gamme === "confort"
      ? infosConfort
      : infosExcellence;

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {proposition.gamme === "essentiel"
        ? "Essentiel"
        : proposition.gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
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
      <Switch
        checked={
          maintenance.infos.fournisseurId === proposition.fournisseurId &&
          maintenance.infos.gammeSelected === proposition.gamme
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title="Sélectionner cette proposition"
      />
      <div>
        <div className="flex gap-2 items-center">
          {totalMensuelText}
          <Dialog>
            <DialogTrigger asChild>
              <Info
                size={16}
                className="cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4 items-center">
                <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
                  <Image
                    src={"/img/services/maintenance.webp"}
                    alt={`illustration de maintenance`}
                    fill={true}
                    className="object-contain object-center cursor-pointer"
                    quality={100}
                  />
                </div>
                <ul className="flex flex-col text-sm px-4">{infosProduit}</ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="flex flex-col text-xs ml-4">{infosProduit}</ul>
      </div>
    </div>
  );
};

export default MaintenancePropositionCard;
