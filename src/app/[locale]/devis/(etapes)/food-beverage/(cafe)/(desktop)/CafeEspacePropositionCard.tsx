import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
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
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center min-h-28 text-base gap-4 text-center font-bold`}
      >
        Non proposé pour ces critères
      </div>
    );
  }

  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((proposition.totalAnnuel * MARGE) / 12))} €/mois
    </p>
  );

  const prixInstallationText = proposition.totalInstallation ? (
    <p className="text-base ml-4">
      + {formatNumber(Math.round(proposition.totalInstallation * MARGE))} €
      d&apos;installation
    </p>
  ) : null;

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {proposition.gamme === "essentiel"
        ? "Essentiel"
        : proposition.gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
  );

  //Détails de l'offre
  const typeLaitText = !proposition.typeLait ? null : proposition.typeLait ===
    "dosettes" ? (
    <li className="list-check">Lait en dosettes</li>
  ) : proposition.typeLait === "frais" ? (
    <li className="list-check">Lait frais</li>
  ) : (
    <li className="list-check">Lait en poudre machine</li>
  );

  const typeChocolatText =
    !proposition.typeChocolat ? null : proposition.typeChocolat ===
      "sachets" ? (
      <li className="list-check">Chocolat en sachets</li>
    ) : (
      <li className="list-check">Chocolat en poudre machine</li>
    );

  const imgProduit = proposition.imageUrl ? (
    <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
      <Image
        src={proposition.imageUrl}
        alt={`illustration ${proposition.marque} ${proposition.modele}`}
        fill
        quality={100}
        className="object-contain"
      />
    </div>
  ) : null;

  const infosEssentiel = (
    <li className="list-check font-bold">
      {proposition.infos
        ? proposition.infos
        : "Café conventionnel dit Classique, Blend"}
    </li>
  );
  const infosConfort = (
    <li className="list-check font-bold">
      {proposition.infos ? proposition.infos : "Café Supérieur, 100% Arabica"}
    </li>
  );
  const infosExcellence = (
    <li className="list-check font-bold">
      {proposition.infos
        ? proposition.infos
        : "Café de spécialité, premium, café d’exception, Bio"}
    </li>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 mx-auto">
      <li className="list-check text-sm font-bold">
        {proposition.nbMachines} machine(s) {proposition.marque}{" "}
        {proposition.modele}{" "}
        {proposition.reconditionne ? " reconditionnée(s)" : ""}
      </li>
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
        ? infosConfort
        : infosExcellence}
      {typeLaitText}
      {typeChocolatText}
      <li className="list-check">
        Consommables ~ {proposition.nbTassesParJ} tasses / j
      </li>
      <li className="list-check">
        Maintenance: {proposition.nbPassagesParAn} passages / an
      </li>
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      <li className="list-check font-bold">
        {proposition.nbMachines} machine(s) {proposition.marque}{" "}
        {proposition.modele}{" "}
        {proposition.reconditionne ? " reconditionnée(s)" : ""}
      </li>
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
        ? infosConfort
        : infosExcellence}
      {typeLaitText}
      {typeChocolatText}
      <li className="list-check">
        Consommables ~ {proposition.nbTassesParJ} tasses / j
      </li>
      <li className="list-check">
        Maintenance: {proposition.nbPassagesParAn} passages / an
      </li>
    </ul>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer  ${
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
      <Switch
        checked={
          espace.infos.gammeCafeSelected === gamme &&
          cafe.infos.fournisseurId === proposition.fournisseurId
        }
        onCheckedChange={() => () =>
          cafeEspacesIds[0] === espace.infos.espaceId
            ? handleClickFirstEspaceProposition(proposition)
            : handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title="Sélectionner cette proposition"
      />
      <div>
        <div className="flex gap-2 items-center">
          {totalMensuelText}
          <Dialog>
            <DialogTrigger asChild>
              <Info
                size={16}
                className="cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              {imgProduit}
              <p className="text-xs italic text-end">
                *photo non contractuelle
              </p>
              {infosProduitDialog}
            </DialogContent>
          </Dialog>
        </div>
        {prixInstallationText}
        {infosProduit}
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
