"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MARGE, S_OUVREES_PAR_AN } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import { useContext } from "react";

type NettoyagePropositionCardProps = {
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
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
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
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
    Math.round((proposition.totalAnnuel * MARGE) / 12)
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
  const infosEssentiel = <p>Entretien fonctionnel et optimisé</p>;
  const infosConfort = <p>Equilibre parfait entre qualité et efficacité</p>;
  const infosExcellence = <p>Un standard de propreté exemplaire</p>;
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
      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer p-4 ${
        nettoyage.infos.fournisseurId === proposition.fournisseurId &&
        nettoyage.infos.gammeSelected === proposition.gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
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
        aria-label="Sélectionner cette proposition"
      />
      <div>
        <div className="flex gap-2 items-center">
          <p className="font-bold">{totalMensuelText}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-transparent hover:text-slate-200 hover:opacity-80"
                onClick={(e) => e.stopPropagation()}
              >
                <Info size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{infosTitle}</DialogTitle>
              </DialogHeader>
              {infosProduit}
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-base">{hParSemaineText}</p>
        <p className="text-xs">{nbPassagesParSemaineText}</p>
      </div>
    </div>
  );
};

export default NettoyagePropositionCard;
