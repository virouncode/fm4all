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
    prixAnnuel: number;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    prixAnnuel: number;
  }) => void;
};

const SecuriteIncendiePropostionCard = ({
  proposition,
  handleClickProposition,
}: SecuriteIncendiePropostionCardProps) => {
  const { incendie } = useContext(IncendieContext);
  return (
    <div
      className={`w-3/4 flex items-center justify-center text-xl gap-4 cursor-pointer bg-slate-100 ${
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
        <p className="font-bold">
          {formatNumber(proposition.prixAnnuel / 12)} € / mois*
        </p>
        <p>Pour le contrôle de :</p>
        <p className="text-sm">
          {" "}
          {incendie.quantites.nbExtincteurs} extincteurs
        </p>
        <p className="text-sm"> {incendie.quantites.nbBaes} BAES</p>
        <p className="text-sm">
          {" "}
          {incendie.quantites.nbTelBaes} télécommandes BAES
        </p>
      </div>
    </div>
  );
};

export default SecuriteIncendiePropostionCard;
