import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
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
import { Info } from "lucide-react";
import { useContext } from "react";
import NettoyageMobileFournisseurLogo from "./NettoyageMobileFournisseurLogo";

type NettoyageMobilePropositionCardProps = {
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
    gamme: "essentiel" | "confort" | "excellence";
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
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
  };
};

const NettoyageMobilePropositionCard = ({
  proposition,
  handleClickProposition,
}: NettoyageMobilePropositionCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { fournisseurId, gamme, id, freqAnnuelle, hParPassage, totalAnnuel } =
    proposition;
  const color = getFm4AllColor(gamme);
  const totalMensuelText = `${formatNumber(
    Math.round(((totalAnnuel ?? 0) * MARGE) / 12)
  )} € / mois`;
  const hParSemaineText =
    hParPassage && freqAnnuelle
      ? `${formatNumber(
          (hParPassage * freqAnnuelle) / S_OUVREES_PAR_AN
        )} h / semaine*`
      : "";
  const infosEssentiel = <p>Entretien fonctionnel et optimisé</p>;
  const infosConfort = <p>Equilibre parfait entre qualité et efficacité</p>;
  const infosExcellence = <p>Un standard de propreté exemplaire</p>;
  const infosTitle = (
    <p className={`text-${color} text-center`}>
      {gamme === "essentiel"
        ? "Essentiel"
        : gamme === "confort"
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
  const nbPassagesParSemaineText =
    freqAnnuelle && hParPassage
      ? `${formatNumber(
          freqAnnuelle / S_OUVREES_PAR_AN
        )} passage(s) de ${hParPassage}h / semaine`
      : "";
  return (
    <CarouselItem>
      <div
        className={`bg-${color} flex flex-col h-[calc(100vh-15rem)] border border-slate-200 rounded-xl p-4 text-white  ${
          nettoyage.infos.fournisseurId === fournisseurId &&
          nettoyage.infos.gammeSelected === gamme
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <NettoyageMobileFournisseurLogo {...proposition} />
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div
            className={`flex flex-1 text-slate-200 items-center justify-center items-center text-2xl gap-4 cursor-pointer p-4`}
            key={id}
            onClick={() => handleClickProposition(proposition)}
          >
            <Checkbox
              checked={
                nettoyage.infos.fournisseurId === fournisseurId &&
                nettoyage.infos.gammeSelected === gamme
              }
              onCheckedChange={() => handleClickProposition(proposition)}
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              aria-label="Sélectionner cette proposition"
            />
            <div className="text-white">
              <div className="flex gap-2 items-center">
                <p className="font-bold">{totalMensuelText}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-transparent hover:text-white hover:opacity-80"
                      onClick={(e) => e.stopPropagation()}
                      title="Détails de l'offre"
                    >
                      <Info size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-5/6 sm:max-w-[425px] rounded-xl">
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
        </div>
      </div>
    </CarouselItem>
  );
  return <div></div>;
};

export default NettoyageMobilePropositionCard;
