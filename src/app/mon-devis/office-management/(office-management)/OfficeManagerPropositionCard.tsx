import { Checkbox } from "@/components/ui/checkbox";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

type OfficeManagerPropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    prixAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    prixAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
  }) => void;
  demiJParSemaineConfort: number | null;
  demiJParSemaineExcellence: number | null;
};

const OfficeManagerPropositionCard = ({
  proposition,
  handleClickProposition,
  demiJParSemaineConfort,
  demiJParSemaineExcellence,
}: OfficeManagerPropositionCardProps) => {
  const { officeManager } = useContext(OfficeManagerContext);
  const color =
    proposition.demiJParSemaine !== null &&
    demiJParSemaineConfort !== null &&
    demiJParSemaineExcellence !== null
      ? proposition.demiJParSemaine < demiJParSemaineConfort
        ? "fm4allessential"
        : proposition.demiJParSemaine < demiJParSemaineExcellence
        ? "fm4allcomfort"
        : "fm4allexcellence"
      : "";

  const prixMensuelText = proposition.prixAnnuel
    ? `${formatNumber(proposition.prixAnnuel / 12)} € / mois*`
    : "Non proposé";
  const demiJParSemaineText =
    proposition.demiJParSemaine !== null
      ? `${proposition.demiJParSemaine / 2} j / semaine`
      : "";
  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
        officeManager.infos.fournisseurId === proposition.fournisseurId &&
        officeManager.infos.gammeSelected !== null
          ? "ring-4 ring-inset ring-destructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Checkbox
        checked={
          officeManager.infos.fournisseurId === proposition.fournisseurId &&
          officeManager.infos.gammeSelected !== null
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
      />
      <div>
        <p className="font-bold">{prixMensuelText}</p>
        <p className="text-sm">{demiJParSemaineText}</p>
      </div>
    </div>
  );
};

export default OfficeManagerPropositionCard;
