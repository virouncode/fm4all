import { Checkbox } from "@/components/ui/checkbox";
import { S_OUVREES_PAR_AN } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

type NettoyageOptionsRepasseCardProps = {
  repasseProposition: {
    id: number;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
  } | null;
  handleClickRepasseProposition: (repasseProposition: {
    id: number;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
  }) => void;
  color: string;
};

const NettoyageOptionsRepasseCard = ({
  repasseProposition,
  handleClickRepasseProposition,
  color,
}: NettoyageOptionsRepasseCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const repassePrixMensuelText = repasseProposition?.prixAnnuel
    ? `${formatNumber(repasseProposition.prixAnnuel / 12)} € / mois`
    : "Non proposé";
  const repasseHParSemaineText =
    repasseProposition && nettoyage.quantites.freqAnnuelle
      ? `${formatNumber(
          (repasseProposition.hParPassage * nettoyage.quantites.freqAnnuelle) /
            S_OUVREES_PAR_AN
        )} h / semaine en plus*`
      : "";
  const repasseNbPassagesParSemaineText =
    repasseProposition && nettoyage.quantites.freqAnnuelle
      ? `${formatNumber(
          nettoyage.quantites.freqAnnuelle / S_OUVREES_PAR_AN
        )}  passage(s) de ${repasseProposition.hParPassage} h / semaine`
      : "";
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center text-base p-4">
        Repasse sanitaire
      </div>
      {repasseProposition ? (
        <div
          className={`flex w-3/4 items-center justify-center ${
            nettoyage.infos.repasseSelected
              ? "ring-4 ring-inset ring-destructive"
              : ""
          } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
          onClick={() => handleClickRepasseProposition(repasseProposition)}
        >
          <Checkbox
            checked={nettoyage.infos.repasseSelected}
            onCheckedChange={() =>
              handleClickRepasseProposition(repasseProposition)
            }
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          />
          <div>
            <p className="font-bold">{repassePrixMensuelText}</p>
            <p className="text-base">{repasseHParSemaineText}</p>
            <p className="text-xs">{repasseNbPassagesParSemaineText}</p>
          </div>
        </div>
      ) : (
        <div
          className={`flex w-3/4 items-center justify-center bg-${color} text-slate-200 items-center justify-center  text-lg gap-4 cursor-pointer`}
        >
          Non proposé pour une frequence annuelle de passage de moins de 260 j /
          an
        </div>
      )}
    </div>
  );
};

export default NettoyageOptionsRepasseCard;
