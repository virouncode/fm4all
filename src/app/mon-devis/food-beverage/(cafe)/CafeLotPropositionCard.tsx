import { Checkbox } from "@/components/ui/checkbox";
import { CafeContext } from "@/context/CafeProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { CafeLotType } from "@/zod-schemas/cafe";
import { useContext } from "react";

type CafeLotPropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    reconditionne: boolean | null;
    prixUnitaireLoc: number | null;
    prixUnitaireInstal: number | null;
    prixUnitaireMaintenance: number | null;
    prixUnitaireConsoCafe: number;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixAnnuel: number | null;
    prixInstallation: number | null;
    nbMachines: number;
    nbTassesParJ: number;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    reconditionne: boolean | null;
    prixUnitaireLoc: number | null;
    prixUnitaireInstal: number | null;
    prixUnitaireMaintenance: number | null;
    prixUnitaireConsoCafe: number;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixAnnuel: number | null;
    prixInstallation: number | null;
    nbMachines: number;
    nbTassesParJ: number;
  }) => void;
  handleClickFirstLotProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    reconditionne: boolean | null;
    prixUnitaireLoc: number | null;
    prixUnitaireInstal: number | null;
    prixUnitaireMaintenance: number | null;
    prixUnitaireConsoCafe: number;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixAnnuel: number | null;
    prixInstallation: number | null;
    nbMachines: number;
    nbTassesParJ: number;
  }) => void;
  lot: CafeLotType;
  cafeLotsMachinesIds: number[];
};
const CafeLotPropositionCard = ({
  proposition,
  handleClickProposition,
  handleClickFirstLotProposition,
  lot,
  cafeLotsMachinesIds,
}: CafeLotPropositionCardProps) => {
  const { cafe } = useContext(CafeContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  const prixMensuelText = proposition.prixAnnuel
    ? `${Math.round(proposition.prixAnnuel / 12)} € / mois*`
    : "Non proposé";
  const prixInstallationText = proposition.prixInstallation
    ? `+ ${formatNumber(proposition.prixInstallation)} € d'installation`
    : "";
  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-2 justify-center text-2xl gap-4 cursor-pointer ${
        lot.infos.gammeCafeSelected === gamme &&
        cafe.infos.fournisseurId === proposition.fournisseurId
          ? "ring-4 ring-inset ring-destructive"
          : ""
      }`}
      onClick={() =>
        cafeLotsMachinesIds[0] === lot.infos.lotId
          ? handleClickFirstLotProposition(proposition)
          : handleClickProposition(proposition)
      }
    >
      <Checkbox
        checked={
          lot.infos.gammeCafeSelected === gamme &&
          cafe.infos.fournisseurId === proposition.fournisseurId
        }
        onCheckedChange={() => () =>
          cafeLotsMachinesIds[0] === lot.infos.lotId
            ? handleClickFirstLotProposition(proposition)
            : handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
      />
      <div>
        <p className="font-bold">{prixMensuelText}</p>
        {prixInstallationText && (
          <p className="text-base">{prixInstallationText}</p>
        )}
        <p className="text-xs">
          {proposition.nbMachines} machine(s) {proposition.marque}{" "}
          {proposition.modele}{" "}
          {proposition.reconditionne ? " reconditionnée(s)" : ""}
        </p>
        <p className="text-xs">
          Consommables ~ {proposition.nbTassesParJ} tasses / j
        </p>
      </div>
    </div>
  );
};

export default CafeLotPropositionCard;
