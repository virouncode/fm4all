import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MARGE } from "@/constants/constants";
import { CafeContext } from "@/context/CafeProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

type CafeEspacePropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    gamme: GammeType;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
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
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    gamme: GammeType;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
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
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    gamme: GammeType;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
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

  //Détails de l'offre
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

  const imgProduit = proposition.imageUrl ? (
    <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-200">
      <Image
        src={proposition.imageUrl}
        alt={`${proposition.marque} ${proposition.modele}`}
        fill
        quality={100}
        className="object-contain"
      />
    </div>
  ) : null;

  const infosEssentiel = (
    <p>
      {proposition.infos
        ? proposition.infos
        : "Café conventionnel dit Classique, Blend"}
    </p>
  );
  const infosConfort = (
    <p>
      {proposition.infos ? proposition.infos : "Café Supérieur, 100% Arabica"}
    </p>
  );
  const infosExcellence = (
    <p>
      {proposition.infos
        ? proposition.infos
        : "Café de spécialité, premium, café d’exception, Bio"}
    </p>
  );

  const infosTitle = (
    <p className={`text-${getFm4AllColor(proposition.gamme)} text-center`}>
      {proposition.gamme === "essentiel"
        ? "Essentiel"
        : proposition.gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
  );

  const infosProduit = (
    <div className="flex flex-col text-sm my-4">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
        ? infosConfort
        : infosExcellence}
      <p>{typeLaitText}</p>
      <p>{typeChocolatText}</p>
      <p className="mb-4">
        {proposition.nbMachines} machine(s) {proposition.marque}{" "}
        {proposition.modele}{" "}
        {proposition.reconditionne ? " reconditionnée(s)" : ""}
      </p>
      {imgProduit}
      <p className="text-xs text-end italic">*photo non contractuelle</p>
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        espace.infos.gammeCafeSelected === gamme &&
        cafe.infos.fournisseurId === proposition.fournisseurId
          ? "ring-4 ring-inset ring-fm4alldestructive"
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
          aria-label="Sélectionner cette proposition"
        />
      ) : null}
      <div>
        <div className="flex gap-2 items-center">
          <p className="font-bold">{totalMensuelText}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-transparent hover:text-slate-200 hover:opacity-80"
                onClick={(e) => e.stopPropagation()}
              >
                <Info size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{infosTitle}</DialogTitle>
              </DialogHeader>
              {infosProduit}
            </DialogContent>
          </Dialog>
        </div>
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

    // <TooltipContent className="w-96 flex flex-col gap-2">
    //   {tooltip}
    //   <p>{typeLaitText}</p>
    //   <p>{typeChocolatText}</p>
    //   {proposition.imageUrl ? (
    //     <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-200">
    //       <Image
    //         src={proposition.imageUrl}
    //         alt={`${proposition.marque} ${proposition.modele}`}
    //         fill
    //         quality={100}
    //         className="object-contain"
    //       />
    //     </div>
    //   ) : null}
    // </TooltipContent>
  );
};

export default CafeEspacePropositionCard;
