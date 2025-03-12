import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { TypesPoseType } from "@/constants/typesPose";
import { FontainesContext } from "@/context/FontainesProvider";
import { formatNumber } from "@/lib/formatNumber";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { Info } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";
import { getTypeFontaine } from "./getTypeFontaine";

type FontaineEspacePropositionCardProps = {
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
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
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
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
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
        className={`flex flex-1 bg-slate-100  items-center p-4 justify-center text-xl gap-4 border-r min-h-36`}
      >
        Non proposé
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

  const infosEssentiel = (
    <>
      <li className="list-check">
        Machine à poser sur un plan de travail ou une table
      </li>
    </>
  );
  const infosConfort = (
    <>
      <li className="list-check">
        Machine autonome fournie avec un meuble ou un pied
      </li>
    </>
  );
  const infosExcellence = (
    <>
      <li className="list-check">
        Machine intégrée sous un meuble (non fourni) avec colonne de
        distribution
      </li>
    </>
  );
  const dialogTitle = (
    <p className="text-center">
      {proposition.typePose === "aposer"
        ? "A poser"
        : proposition.typePose === "colonne"
        ? "Colonne sur pied"
        : "Sous comptoir"}
    </p>
  );
  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 mx-auto">
      <li className="list-check text-sm font-bold">
        1 fontaine{" "}
        <span
          className={`${
            proposition.fournisseurId === 13 ? "inline-block blur-sm" : ""
          }`}
        >
          {proposition.marque}
        </span>{" "}
        {proposition.modele}{" "}
        {proposition.reconditionne ? " reconditionnée(s)" : ""}
      </li>
      {proposition.typePose === "aposer"
        ? infosEssentiel
        : proposition.typePose === "colonne"
        ? infosConfort
        : infosExcellence}

      <li className="list-check">Filtres et maintenance inclus</li>
      {getTypeFontaine(espace.infos.typeEau) === "EG" ||
      getTypeFontaine(espace.infos.typeEau) === "ECG" ? (
        <li className="list-check">CO2 inclus</li>
      ) : null}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      <li className="list-check font-bold">
        1 fontaine{" "}
        <span
          className={`${
            proposition.fournisseurId === 13 ? "inline-block blur-sm" : ""
          }`}
        >
          {proposition.marque}
        </span>{" "}
        {proposition.modele}{" "}
        {proposition.reconditionne ? " reconditionnée(s)" : ""}
      </li>
      {proposition.typePose === "aposer"
        ? infosEssentiel
        : proposition.typePose === "colonne"
        ? infosConfort
        : infosExcellence}

      <li className="list-check">Filtres et maintenance inclus</li>
      {getTypeFontaine(espace.infos.typeEau) === "EG" ||
      getTypeFontaine(espace.infos.typeEau) === "ECG" ? (
        <li className="list-check">CO2 inclus</li>
      ) : null}
    </ul>
  );

  const imgProduit = (
    <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
      <Image
        src={proposition.imageUrl ?? "/img/services/fontaines.webp"}
        alt={`illustration ${proposition.marque} ${proposition.modele}`}
        fill
        quality={100}
        className="object-contain"
      />
    </div>
  );
  return (
    <div
      className={`flex flex-1 items-center p-4 justify-center text-2xl gap-4 cursor-pointer bg-slate-100 border-r ${
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
      <Switch
        checked={
          fontaines.infos.fournisseurId === proposition.fournisseurId &&
          (espace.infos.poseSelected === proposition.typePose ? true : false)
        }
        onCheckedChange={() => () =>
          fontainesEspacesIds[0] === espace.infos.espaceId
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
  );
};

export default FontaineEspacePropositionCard;
