import FournisseurDialog from "@/app/mon-devis/FournisseurDialog";
import StarRating from "@/components/star-rating";
import { CarouselItem } from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { FontainesContext } from "@/context/FontainesProvider";
import { formatNumber } from "@/lib/formatNumber";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import Image from "next/image";
import { useContext } from "react";
import { getTypeFontaine } from "../getTypeFontaine";

type FontaineMobileEspacePropositionsCard = {
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
    typePose: "aposer" | "colonne" | "comptoir";
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
    typePose: "aposer" | "colonne" | "comptoir";
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
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: "aposer" | "colonne" | "comptoir";
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

const FontaineMobileEspacePropositionCard = ({
  proposition,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  fontainesEspacesIds,
}: FontaineMobileEspacePropositionsCard) => {
  const { fontaines } = useContext(FontainesContext);
  const {
    typePose,
    fournisseurId,
    nomFournisseur,
    sloganFournisseur,
    logoUrl,
    locationUrl,
    anneeCreation,
    ca,
    effectifFournisseur,
    nbClients,
    noteGoogle,
    nbAvis,
    totalAnnuel,
    totalInstallation,
    marque,
    modele,
    imageUrl,
  } = proposition;

  const totalMensuelText = totalAnnuel ? (
    <p className="text-sm font-bold">
      {formatNumber(Math.round((totalAnnuel * MARGE) / 12))} €/mois
    </p>
  ) : (
    <p className="text-sm font-bold">Non proposé</p>
  );

  const prixInstallationText = totalInstallation ? (
    <p className="text-xs">
      + {formatNumber(Math.round(totalInstallation * MARGE))} €
      d&apos;installation
    </p>
  ) : null;

  const dialogTitle = (
    <p className={`text-center`}>
      {proposition.typePose === "aposer"
        ? "A poser"
        : proposition.typePose === "colonne"
        ? "Colonne sur pied"
        : "Sous comptoir"}
    </p>
  );
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

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 mx-auto w-2/3">
      {totalAnnuel ? (
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
      ) : null}
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
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-200">
      <Image
        src={imageUrl ?? "/img/services/fontaines.webp"}
        alt={`illustration ${marque} ${modele}`}
        fill
        quality={100}
        className="object-contain cursor-pointer"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
      <Image
        src={imageUrl ?? "/img/services/fontaines.webp"}
        alt={`illustration ${marque} ${modele}`}
        fill
        quality={100}
        className="object-contain"
      />
    </div>
  );

  return (
    <CarouselItem>
      <div
        className={`bg-slate-100 flex flex-col h-72 border border-slate-200 rounded-xl p-4  ${
          fontaines.infos.fournisseurId === proposition.fournisseurId &&
          espace.infos.poseSelected === proposition.typePose
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex items-center h-1/2 gap-2 border-b pb-2 border-slate-200">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              {imgProduitDialog}
              <p className="text-xs italic text-end">
                *photo non contractuelle
              </p>
              {infosProduitDialog}
            </DialogContent>
          </Dialog>
          <div className="w-2/3 flex flex-col gap-1 h-full">
            <p
              className={`font-bold text-sm ${
                fournisseurId === 13 ? "blur-lg" : ""
              }`}
            >
              {nomFournisseur}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                {logoUrl ? (
                  <div
                    className={`h-10 relative ${
                      fournisseurId === 13 ? "blur-lg" : ""
                    }`}
                  >
                    <Image
                      src={logoUrl}
                      alt={`logo-de-${nomFournisseur}`}
                      fill={true}
                      className="object-contain object-left cursor-pointer"
                      quality={100}
                    />
                  </div>
                ) : null}
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle
                    className={`${fournisseurId === 13 ? "blur-lg" : ""}
                  `}
                  >
                    {nomFournisseur}
                  </DialogTitle>
                </DialogHeader>
                <FournisseurDialog
                  sloganFournisseur={sloganFournisseur}
                  logoUrl={logoUrl}
                  nomFournisseur={nomFournisseur}
                  locationUrl={locationUrl}
                  anneeCreation={anneeCreation}
                  ca={ca}
                  effectif={effectifFournisseur}
                  nbClients={nbClients}
                  noteGoogle={noteGoogle}
                  nbAvis={nbAvis}
                />
              </DialogContent>
            </Dialog>
            {noteGoogle && nbAvis && (
              <div className="flex items-center gap-1 text-xs">
                <p>{noteGoogle}</p>
                <StarRating score={noteGoogle ? parseFloat(noteGoogle) : 0} />
                <p>({nbAvis})</p>
              </div>
            )}
          </div>
        </div>
        <div
          className="flex h-1/2 pt-2 justify-between"
          onClick={() =>
            fontainesEspacesIds[0] === espace.infos.espaceId
              ? handleClickFirstEspaceProposition(proposition)
              : handleClickProposition(proposition)
          }
        >
          {infosProduit}
          <div className="flex flex-col gap-2 items-end w-1/3">
            {totalMensuelText}
            {prixInstallationText}
            {totalAnnuel ? (
              <Switch
                className={`${
                  espace.infos.poseSelected === typePose &&
                  fontaines.infos.fournisseurId === fournisseurId
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={
                  espace.infos.poseSelected === typePose &&
                  fontaines.infos.fournisseurId === fournisseurId
                }
                onCheckedChange={() =>
                  fontainesEspacesIds[0] === espace.infos.espaceId
                    ? handleClickFirstEspaceProposition(proposition)
                    : handleClickProposition(proposition)
                }
                title="Sélectionnez cette proposition"
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default FontaineMobileEspacePropositionCard;
