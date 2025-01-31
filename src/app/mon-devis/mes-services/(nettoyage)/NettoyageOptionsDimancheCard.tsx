import { Checkbox } from "@/components/ui/checkbox";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

type NettoyageOptionsDimancheCardProps = {
  dimancheProposition: {
    id: number;
    prixAnnuel: number;
  };
  handleClickDimancheProposition: (dimancheProposition: {
    id: number;
    prixAnnuel: number;
  }) => void;
  color: string;
};

const NettoyageOptionsDimancheCard = ({
  dimancheProposition,
  handleClickDimancheProposition,
  color,
}: NettoyageOptionsDimancheCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  if (!dimancheProposition.prixAnnuel) {
    return (
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
          Nettoyage supplémentaire tous les Dimanche
        </div>
        <div
          className={`flex w-3/4 items-center p-4 justify-center bg-${color} text-slate-200 items-center justify-center text-2xl gap-4`}
        >
          Non proposé
        </div>
      </div>
    );
  }
  const dimanchePrixMensuelText = `${formatNumber(
    dimancheProposition.prixAnnuel / 12
  )} € / mois`;

  const diamncheNbPassagesParSemaineText = `1 passage de ${nettoyage.quantites.hParPassage} h / semaine en plus`;
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
        Nettoyage supplémentaire tous les Dimanche
      </div>
      <div
        className={`flex w-3/4 items-center p-4 justify-center ${
          nettoyage.infos.dimancheSelected
            ? "ring-4 ring-inset ring-destructive"
            : ""
        } bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer`}
        onClick={() => handleClickDimancheProposition(dimancheProposition)}
      >
        <Checkbox
          checked={nettoyage.infos.dimancheSelected}
          onCheckedChange={() =>
            handleClickDimancheProposition(dimancheProposition)
          }
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
        />
        <div>
          <p className="font-bold">{dimanchePrixMensuelText}</p>
          <p className="text-sm">{diamncheNbPassagesParSemaineText}</p>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsDimancheCard;
