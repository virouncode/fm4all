import { Checkbox } from "@/components/ui/checkbox";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

type NettoyageOptionsSamediCardProps = {
  samediProposition: {
    id: number;
    prixAnnuel: number;
  };
  handleClickSamediProposition: (samediProposition: {
    id: number;
    prixAnnuel: number;
  }) => void;
  color: string;
};

const NettoyageOptionsSamediCard = ({
  samediProposition,
  handleClickSamediProposition,
  color,
}: NettoyageOptionsSamediCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const samediPrixMensuelText = samediProposition.prixAnnuel
    ? `${formatNumber(samediProposition?.prixAnnuel / 12)} € / mois`
    : "Non proposé";
  const samediNbPassagesParSemaineText = `1 passage de ${nettoyage.quantites.hParPassage} h / semaine en plus`;
  return (
    <div className="flex border-b flex-1 ">
      <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
        Nettoyage supplémentaire tous les Samedi
      </div>
      <div
        className={`flex w-3/4 items-center p-4 justify-center ${
          nettoyage.infos.samediSelected
            ? "ring-4 ring-inset ring-destructive"
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
