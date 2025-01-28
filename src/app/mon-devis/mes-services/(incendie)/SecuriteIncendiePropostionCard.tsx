import { Checkbox } from "@/components/ui/checkbox";
import { IncendieContext } from "@/context/IncendieProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

type SecuriteIncendiePropostionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    prixParExtincteur: number;
    prixParBaes: number;
    prixParTelBaes: number;
    prixAnnuelTrilogie: number;
    fraisDeplacementTrilogie: number;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    prixParExtincteur: number;
    prixParBaes: number;
    prixParTelBaes: number;
    prixAnnuelTrilogie: number;
    fraisDeplacementTrilogie: number;
  }) => void;
};

const SecuriteIncendiePropostionCard = ({
  proposition,
  handleClickProposition,
}: SecuriteIncendiePropostionCardProps) => {
  const { incendie } = useContext(IncendieContext);
  const prixAnnuelText =
    formatNumber(
      (proposition.prixAnnuelTrilogie + proposition.fraisDeplacementTrilogie) /
        12
    ) + " € / mois*";

  return (
    <div
      className={`w-3/4 flex items-center justify-center text-xl gap-4 p-4 cursor-pointer bg-slate-100 ${
        incendie.infos.fournisseurId === proposition.fournisseurId
          ? "ring-4 ring-inset ring-destructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Checkbox
        checked={incendie.infos.fournisseurId === proposition.fournisseurId}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
      />
      <div>
        <p className="font-bold">{prixAnnuelText}</p>
        <p className="text-sm">1 passage par an</p>
        <p>Pour le contrôle de :</p>
        <p className="text-sm">
          {incendie.quantites.nbExtincteurs} extincteurs
        </p>
        <p className="text-sm"> {incendie.quantites.nbBaes} BAES</p>
        <p className="text-sm">
          {incendie.quantites.nbTelBaes} télécommandes BAES
        </p>
      </div>
    </div>
  );
};

export default SecuriteIncendiePropostionCard;
