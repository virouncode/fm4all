import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MARGE } from "@/constants/constants";
import { TypesPoseType } from "@/constants/typesPose";
import { FontainesContext } from "@/context/FontainesProvider";
import { formatNumber } from "@/lib/formatNumber";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import Image from "next/image";
import { useContext } from "react";
import { getTypeFontaine } from "./getTypeFontaine";

type FontaineEspacePropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: TypesPoseType;
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
    nomFournisseur: string;
    sloganFournisseur: string | null;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: TypesPoseType;
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
    nomFournisseur: string;
    sloganFournisseur: string | null;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: TypesPoseType;
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
        className={`flex flex-1 items-center p-4 justify-center text-2xl gap-4 bg-slate-100 border-r`}
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

  const tooltipEssentiel = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">A poser</p>
      <p className="text-center text-sm">
        Machine table top à poser sur un plan de travail ou une table
      </p>
    </div>
  );
  const tooltipConfort = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Colonne sur pied</p>
      <p className="text-center text-sm">
        Machine autonome fournie avec un meuble ou un pied
      </p>
    </div>
  );
  const tooltipExcellence = (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Sur comptoir</p>
      <p className="text-center text-sm">
        Machine intégrée sous un meuble (non fourni). Seule la colonne de
        distribution dépasse
      </p>
    </div>
  );
  const tooltip =
    proposition.typePose === "aposer"
      ? tooltipEssentiel
      : proposition.typePose === "colonne"
      ? tooltipConfort
      : tooltipExcellence;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex flex-1  items-center p-4 justify-center text-2xl gap-4 cursor-pointer bg-slate-100 border-r ${
              fontaines.infos.fournisseurId === proposition.fournisseurId &&
              espace.infos.poseSelected === proposition.typePose
                ? "ring-4 ring-inset ring-fm4alldestructive"
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
                  (espace.infos.poseSelected === proposition.typePose
                    ? true
                    : false)
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
                1 fontaine{" "}
                <span
                  className={`${
                    proposition.fournisseurId === 13
                      ? "inline-block blur-sm"
                      : ""
                  }`}
                >
                  {proposition.marque}
                </span>{" "}
                {proposition.modele}{" "}
                {proposition.reconditionne ? " reconditionnée(s)" : ""}
              </p>
              <p className="text-xs">Filtres et maintenance inclus</p>
              {/* {getTypeFontaine(espace.infos.typeEau) === "EC" ||
              getTypeFontaine(espace.infos.typeEau) === "ECG" ? (
                <p className="text-xs">
                  Consommables ~ 15 L / an / personne d&apos;eau chaude
                </p>
              ) : null} */}
              {getTypeFontaine(espace.infos.typeEau) === "EG" ||
              getTypeFontaine(espace.infos.typeEau) === "ECG" ? (
                <p className="text-xs">CO2 inclus</p>
              ) : null}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-96 flex flex-col gap-2">
          {tooltip}
          {proposition.imageUrl ? (
            <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-200">
              <Image
                src={proposition.imageUrl}
                alt={`${proposition.marque} ${proposition.modele}`}
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FontaineEspacePropositionCard;
