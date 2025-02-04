import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontainesContext } from "@/context/FontainesProvider";
import { formatNumber } from "@/lib/formatNumber";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { useContext } from "react";

type FontaineEspacePropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string | null;
    sloganFournisseur: string | null;
    modele: string | null;
    marque: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string | null;
    sloganFournisseur: string | null;
    modele: string | null;
    marque: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  handleClickFirstEspaceProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string | null;
    sloganFournisseur: string | null;
    modele: string | null;
    marque: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  espace: FontaineEspaceType;
  fontainesEspacesIds: number[];
};
const FontaineEspacePropositionCard = ({
  proposition,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  fontainesEspacesIds,
}: FontaineEspacePropositionCardProps) => {
  const { fontaines } = useContext(FontainesContext);

  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex flex-1 items-center p-4 justify-center text-2xl gap-4 bg-slate-100`}
      >
        Non proposé
      </div>
    );
  }

  const totalMensuelText = `${Math.round(
    proposition.totalAnnuel / 12
  )} € / mois`;
  const prixInstallationText = proposition.totalInstallation
    ? `+ ${formatNumber(proposition.totalInstallation)} € d'installation`
    : "";

  // const tooltipEssentiel = (
  //   <div className="flex flex-col gap-4">
  //     <p className="text-center text-lg">Essentiel</p>
  //     <p>
  //       {proposition.infos
  //         ? proposition.infos
  //         : "Café conventionnel dit Classique, Blend"}
  //     </p>
  //   </div>
  // );
  // const tooltipConfort = (
  //   <div className="flex flex-col gap-4">
  //     <p className="text-center text-lg">Confort</p>
  //     <p>
  //       {proposition.infos ? proposition.infos : "Café Supérieur, 100% Arabica"}
  //     </p>
  //   </div>
  // );
  // const tooltipExcellence = (
  //   <div className="flex flex-col gap-4">
  //     <p className="text-center text-lg">Excellence</p>
  //     <p>
  //       {proposition.infos
  //         ? proposition.infos
  //         : "Café de spécialité, premium, café d’exception, Bio"}
  //     </p>
  //   </div>
  // );
  // const tooltip =
  //   gamme === "essentiel"
  //     ? tooltipEssentiel
  //     : gamme === "confort"
  //     ? tooltipConfort
  //     : tooltipExcellence;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex flex-1  items-center p-4 justify-center text-2xl gap-4 cursor-pointer bg-slate-100 ${
              fontaines.infos.fournisseurId === proposition.fournisseurId &&
              espace.infos.selected
                ? "ring-4 ring-inset ring-destructive"
                : ""
            }`}
            onClick={() =>
              fontainesEspacesIds[0] === espace.infos.espaceId
                ? handleClickFirstEspaceProposition(proposition)
                : handleClickProposition(proposition)
            }
          >
            {proposition.totalAnnuel ? (
              <Checkbox
                checked={
                  fontaines.infos.fournisseurId === proposition.fournisseurId &&
                  (espace.infos.selected ? true : false)
                }
                onCheckedChange={() => () =>
                  fontainesEspacesIds[0] === espace.infos.espaceId
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
                1 fontaine {proposition.marque} {proposition.modele}{" "}
                {proposition.reconditionne ? " reconditionnée(s)" : ""}
              </p>
              <p className="text-xs">
                Consommables ~ 200 L / an / personne d&apos;eau fraiche
              </p>
              {espace.infos.typeBoissons === "EC" ||
              espace.infos.typeBoissons === "ECG" ? (
                <p className="text-xs">
                  Consommables ~ 15 L / an / personne d&apos;eau chaude
                </p>
              ) : null}
              {espace.infos.typeBoissons === "EG" ||
              espace.infos.typeBoissons === "ECG" ? (
                <p className="text-xs">
                  Consommables ~ 100 L / an / personne d&apos;eau gazeuse
                </p>
              ) : null}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">{/* {tooltip} */}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FontaineEspacePropositionCard;
