import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MARGE } from "@/constants/constants";
import { CafeContext } from "@/context/CafeProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { GammeType } from "@/zod-schemas/gamme";
import { useContext } from "react";

type CafeEspacePropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: GammeType;
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
    gamme: GammeType;
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
    gamme: GammeType;
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

  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4`}
      >
        Non proposé
      </div>
    );
  }

  const totalMensuelText = `${formatNumber(
    Math.round((proposition.totalAnnuel * MARGE) / 12)
  )} € / mois`;
  const prixInstallationText = proposition.totalInstallation
    ? `+ ${formatNumber(
        Math.round(proposition.totalInstallation * MARGE)
      )} € d'installation`
    : "";
  const typeLaitText = !proposition.typeLait
    ? ""
    : proposition.typeLait === "dosettes"
    ? "Lait en dosettes"
    : proposition.typeLait === "frais"
    ? "Lait frais"
    : "Lait en poudre machine";
  const typeChocolatText = !proposition.typeChocolat
    ? ""
    : proposition.typeChocolat === "sachets"
    ? "Chocolat en sachets"
    : "Chocolat en poudre machine";

  const tooltipEssentiel = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Essentiel</p>
      <p>
        {proposition.infos
          ? proposition.infos
          : "Café conventionnel dit Classique, Blend"}
      </p>
    </div>
  );
  const tooltipConfort = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Confort</p>
      <p>
        {proposition.infos ? proposition.infos : "Café Supérieur, 100% Arabica"}
      </p>
    </div>
  );
  const tooltipExcellence = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Excellence</p>
      <p>
        {proposition.infos
          ? proposition.infos
          : "Café de spécialité, premium, café d’exception, Bio"}
      </p>
    </div>
  );
  const tooltip =
    gamme === "essentiel"
      ? tooltipEssentiel
      : gamme === "confort"
      ? tooltipConfort
      : tooltipExcellence;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
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
              <p className="font-bold">{totalMensuelText}</p>
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
              <p className="text-xs">
                Maintenance: {proposition.nbPassagesParAn} passages / an
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">
          {tooltip}
          <p>{typeLaitText}</p>
          <p>{typeChocolatText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CafeEspacePropositionCard;
