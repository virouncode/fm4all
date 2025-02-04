import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TheContext } from "@/context/TheProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

type ThePropositionCardProps = {
  proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    effectif: number;
    prixUnitaire: number | null;
  };
  handleClickProposition: (proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    effectif: number;
    prixUnitaire: number | null;
  }) => void;
  nbTassesParJour: number;
};

const ThePropositionCard = ({
  proposition,
  handleClickProposition,
  nbTassesParJour,
}: ThePropositionCardProps) => {
  const { the } = useContext(TheContext);
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
  )} € / mois*`;

  const tooltipEssentiel = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Essentiel</p>
      <div>
        <p>The en sachet, un ou deux au choix</p>
        {proposition.infos && <p>{proposition.infos}</p>}
      </div>
    </div>
  );
  const tooltipConfort = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Confort</p>
      <div>
        <p>Choix de plusieurs thés en sachets</p>
        {proposition.infos && <p>{proposition.infos}</p>}
      </div>
    </div>
  );
  const tooltipExcellence = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Excellence</p>
      <div>
        <p>Thés Premium en boite bois ou présentoir</p>
        {proposition.infos && <p>{proposition.infos}</p>}
      </div>
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
              the.infos.gammeSelected === proposition.gamme
                ? "ring-4 ring-inset ring-destructive"
                : ""
            }`}
            onClick={() => handleClickProposition(proposition)}
          >
            {proposition.totalAnnuel ? (
              <Checkbox
                checked={the.infos.gammeSelected === proposition.gamme}
                onCheckedChange={() => handleClickProposition(proposition)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
            ) : null}
            <div>
              <p className="font-bold">{totalMensuelText}</p>
              <p className="text-sm">
                Consommables ~ {nbTassesParJour} tasses / j
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThePropositionCard;
