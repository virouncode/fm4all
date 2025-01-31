import { Checkbox } from "@/components/ui/checkbox";
import { CafeContext } from "@/context/CafeProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { useContext } from "react";

type CafeEspacePropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "sachets" | "poudre" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "sachets" | "poudre" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  handleClickFirstEspaceProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "sachets" | "poudre" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  espace: CafeEspaceType;
  cafeEspacesIds: number[];
};
const CafeEspacePropositionCard = ({
  proposition,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  cafeEspacesIds,
}: CafeEspacePropositionCardProps) => {
  const { cafe } = useContext(CafeContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  const prixMensuelText = proposition.totalAnnuel
    ? `${Math.round(proposition.totalAnnuel / 12)} € / mois`
    : "Non proposé";
  const prixInstallationText = proposition.totalInstallation
    ? `+ ${formatNumber(proposition.totalInstallation)} € d'installation`
    : "";
  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        espace.infos.gammeCafeSelected === gamme &&
        cafe.infos.fournisseurId === proposition.fournisseurId
          ? "ring-4 ring-inset ring-destructive"
          : ""
      }`}
      onClick={() =>
        cafeEspacesIds[0] === espace.infos.espaceId
          ? handleClickFirstEspaceProposition(proposition)
          : handleClickProposition(proposition)
      }
    >
      {proposition.totalAnnuel ? (
        <Checkbox
          checked={
            espace.infos.gammeCafeSelected === gamme &&
            cafe.infos.fournisseurId === proposition.fournisseurId
          }
          onCheckedChange={() => () =>
            cafeEspacesIds[0] === espace.infos.espaceId
              ? handleClickFirstEspaceProposition(proposition)
              : handleClickProposition(proposition)}
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
        />
      ) : null}
      <div>
        <p className="font-bold">{prixMensuelText}</p>
        {prixInstallationText && (
          <p className="text-base">{prixInstallationText}</p>
        )}
        {proposition.totalAnnuel ? (
          <>
            <p className="text-xs">
              {proposition.nbMachines} machine(s) {proposition.marque}{" "}
              {proposition.modele}{" "}
              {proposition.reconditionne ? " reconditionnée(s)" : ""}
            </p>
            <p className="text-xs">
              Consommables ~ {proposition.nbTassesParJ} tasses / j
            </p>
            <p className="text-xs">
              Maintenance: {proposition.nbPassagesParAn} passages / an
            </p>
            {proposition.infos && (
              <p className="text-xs">Café : {proposition.infos}</p>
            )}
            {proposition.typeLait === "dosettes" && (
              <p className="text-xs">Lait en dosettes</p>
            )}
            {proposition.typeLait === "frais" && (
              <p className="text-xs">Lait frais</p>
            )}
            {proposition.typeLait === "poudre" && (
              <p className="text-xs">Lait en poudre machine</p>
            )}
            {proposition.typeChocolat === "sachets" && (
              <p className="text-xs">Chocolat en sachets</p>
            )}
            {proposition.typeChocolat === "poudre" && (
              <p className="text-xs">Chocolat en poudre machine</p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CafeEspacePropositionCard;
