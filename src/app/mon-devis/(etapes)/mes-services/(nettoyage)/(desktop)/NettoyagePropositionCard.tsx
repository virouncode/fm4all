"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE, S_OUVREES_PAR_AN } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import Image from "next/image";
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
  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((proposition.totalAnnuel * MARGE) / 12))} €/mois
    </p>
  );
  const hParSemaineText =
    proposition.hParPassage && proposition.freqAnnuelle ? (
      <li className="list-check ">
        {formatNumber(
          (proposition.hParPassage * proposition.freqAnnuelle) /
            S_OUVREES_PAR_AN
        )}{" "}
        h / semaine
      </li>
    ) : null;
  const nbPassagesParSemaineText =
    proposition.freqAnnuelle && proposition.hParPassage ? (
      <li className="list-check ">
        {formatNumber(proposition.freqAnnuelle / S_OUVREES_PAR_AN)} passage(s)
        de {proposition.hParPassage}h / semaine
      </li>
    ) : null;

  const infosEssentiel = (
    <li className="list-check ">Entretien fonctionnel et optimisé</li>
  );
  const infosConfort = (
    <li className="list-check ">
      Equilibre parfait entre qualité et efficacité
    </li>
  );
  const infosExcellence = (
    <li className="list-check ">Un standard de propreté exemplaire</li>
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
      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer p-4 ${
        nettoyage.infos.fournisseurId === proposition.fournisseurId &&
        nettoyage.infos.gammeSelected === proposition.gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={
          nettoyage.infos.fournisseurId === proposition.fournisseurId &&
          nettoyage.infos.gammeSelected === proposition.gamme
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
                    src={"/img/services/nettoyage.webp"}
                    alt={`illustration de nettoyage`}
                    fill={true}
                    className="object-contain object-center cursor-pointer"
                    quality={100}
                  />
                </div>
                <ul className="flex flex-col text-sm px-4">
                  {infosProduit}
                  {hParSemaineText}
                  {nbPassagesParSemaineText}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="flex flex-col text-xs ml-4">
          {infosProduit}
          {hParSemaineText}
          {nbPassagesParSemaineText}
        </ul>
      </div>
    </div>
  );
};

export default NettoyagePropositionCard;
