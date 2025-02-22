import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MAX_PASSAGES_VITRERIE } from "./NettoyageOptionsPropositions";

type NettoyageOptionsVitrerieCardProps = {
  vitrerieProposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
  };
  handleClickVitrerieProposition: (vitrerieProposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
  }) => void;
  handleChangeNbPassageVitrerie: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  color: string;
};

const NettoyageOptionsVitrerieCard = ({
  vitrerieProposition,
  handleClickVitrerieProposition,
  handleChangeNbPassageVitrerie,
  color,
}: NettoyageOptionsVitrerieCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);

  const vitreriePrixMensuelText = vitrerieProposition.prixAnnuel
    ? `${formatNumber(
        Math.round((vitrerieProposition.prixAnnuel * MARGE) / 12)
      )} € / mois`
    : "Non proposé";
  const nbPassagesVitrerieText = `${nettoyage.quantites.nbPassagesVitrerie} passages / an`;
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center p-4">
        <div className="flex flex-col gap-2 items-center justify-center w-full">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-base">Lavage Vitrerie*</p>
              </TooltipTrigger>
              <TooltipContent className="max-w-60">
                Vitres accessibles et cloisons
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex gap-4 items-center justify-center w-full">
            <Input
              type="number"
              value={nettoyage.quantites.nbPassagesVitrerie}
              min={1}
              max={MAX_PASSAGES_VITRERIE}
              step={1}
              onChange={handleChangeNbPassageVitrerie}
              className={`w-16 ${
                nettoyage.quantites.nbPassagesVitrerie === 2
                  ? "text-fm4alldestructive"
                  : ""
              }`}
            />
            <Label htmlFor="nbDePassagesVitrerie" className="text-sm">
              passages / an
            </Label>
          </div>
          <p className="text-xs text-fm4alldestructive italic px-2 text-center">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      {vitrerieProposition.prixAnnuel ? (
        <div
          className={`flex w-3/4 items-center p-4 justify-center ${
            nettoyage.infos.vitrerieSelected
              ? "ring-4 ring-inset ring-fm4alldestructive"
              : ""
          } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
          onClick={() => handleClickVitrerieProposition(vitrerieProposition)}
        >
          <Checkbox
            checked={nettoyage.infos.vitrerieSelected}
            onCheckedChange={() =>
              handleClickVitrerieProposition(vitrerieProposition)
            }
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          />
          <div>
            <p className="font-bold">{vitreriePrixMensuelText}</p>
            <p className="text-sm">{nbPassagesVitrerieText}</p>
          </div>
        </div>
      ) : (
        <div
          className={`flex w-3/4 items-center p-4 justify-center bg-${color} text-slate-200 items-center justify-center text-2xl gap-4`}
        >
          Non proposé
        </div>
      )}
    </div>
  );
};

export default NettoyageOptionsVitrerieCard;
