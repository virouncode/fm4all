import { Checkbox } from "@/components/ui/checkbox";
import { TheContext } from "@/context/TheProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { useContext } from "react";

type ThePropositionCardProps = {
  proposition: {
    prixAnnuel: number;
    id: number;
    effectif: number;
    createdAt: Date;
    infos: string | null;
    fournisseurId: number;
    nomFournisseur: string;
    prixUnitaire: number;
    slogan: string | null;
    gamme: GammeType;
  };
  handleClickProposition: (proposition: {
    prixAnnuel: number;
    id: number;
    effectif: number;
    createdAt: Date;
    infos: string | null;
    fournisseurId: number;
    nomFournisseur: string;
    prixUnitaire: number;
    slogan: string | null;
    gamme: GammeType;
  }) => void;
  nbTassesParJour: number;
};

const ThePropositionCard = ({
  proposition,
  handleClickProposition,
  nbTassesParJour,
}: ThePropositionCardProps) => {
  const { the } = useContext(TheContext);
  const prixMensuelText = `${formatNumber(
    proposition.prixAnnuel / 12
  )} € / mois*`;
  const color = getFm4AllColor(proposition.gamme);
  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
        the.infos.gammeSelected === proposition.gamme
          ? "ring-4 ring-inset ring-destructive"
          : ""
      } px-8`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Checkbox
        checked={the.infos.gammeSelected === proposition.gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
      />
      <div>
        <p className="font-bold">{prixMensuelText}</p>
        <p className="text-sm">Consommables ~ {nbTassesParJour} tasses / j</p>
      </div>
    </div>
  );
};

export default ThePropositionCard;
