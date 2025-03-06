import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MARGE } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

type NettoyageOptionsSamediCardProps = {
  samediProposition: {
    id: number;
    prixAnnuel: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
  handleClickSamediProposition: (samediProposition: {
    id: number;
    prixAnnuel: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  }) => void;
  color: string;
};

const NettoyageOptionsSamediCard = ({
  samediProposition,
  handleClickSamediProposition,
  color,
}: NettoyageOptionsSamediCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  if (!samediProposition.prixAnnuel) {
    return (
      <div className="flex border-b flex-1 ">
        <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
          Nettoyage supplémentaire tous les Samedi
        </div>
        <div
          className={`flex w-3/4 items-center p-4 justify-center bg-${color} text-slate-200 items-center justify-center text-2xl gap-4`}
        >
          Non proposé
        </div>
      </div>
    );
  }
  const samediPrixMensuelText = `${formatNumber(
    Math.round((samediProposition?.prixAnnuel * MARGE) / 12)
  )} € / mois`;

  const samediNbPassagesParSemaineText = `1 passage de ${nettoyage.quantites.hParPassage} h / semaine en plus`;
  return (
    <div className="flex border-b flex-1 ">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
              Nettoyage supplémentaire tous les Samedi
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-60">
            Ajoute une journée à la fréquence choisie précédemment
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div
        className={`flex w-3/4 items-center p-4 justify-center ${
          nettoyage.infos.samediSelected
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
        onClick={() => handleClickSamediProposition(samediProposition)}
      >
        <Checkbox
          checked={nettoyage.infos.samediSelected}
          onCheckedChange={() =>
            handleClickSamediProposition(samediProposition)
          }
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          aria-label="Sélectionner cette proposition"
        />
        <div>
          <p className="font-bold">{samediPrixMensuelText}</p>
          <p className="text-sm">{samediNbPassagesParSemaineText}</p>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsSamediCard;
