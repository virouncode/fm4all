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
import { capitalize } from "@/lib/utils/capitalize";
import { formatNumber } from "@/lib/utils/formatNumber";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("DevisPage");
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const locale = useLocale();
  const { fontaines } = useContext(FontainesContext);

  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex flex-1 bg-slate-100  items-center p-4 justify-center text-base gap-4 border-r min-h-36 text-center`}
      >
        {t("non-propose-pour-ces-criteres")}
      </div>
    );
  }

  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((proposition.totalAnnuel * MARGE) / 12))}{" "}
      {t("euros-mois")}
    </p>
  );

  const prixInstallationText = proposition.totalInstallation ? (
    <p className="text-base ml-4">
      + {formatNumber(Math.round(proposition.totalInstallation * MARGE))}{" "}
      {t("eur-d-installation")}
    </p>
  ) : null;

  const infosEssentiel =
    locale === "fr" ? (
      <li className="list-check">
        {tFontaines("fontaine")}{" "}
        <strong>{tFontaines("a-poser").toLowerCase()}</strong>{" "}
        {tFontaines("sur-un-plan-de-travail-ou-une-table")}
      </li>
    ) : (
      <li className="list-check">
        <strong>{capitalize(tFontaines("a-poser"))}</strong>{" "}
        {tFontaines("fontaine").toLowerCase()}{" "}
        {tFontaines("sur-un-plan-de-travail-ou-une-table")}
      </li>
    );

  const infosConfort = (
    <>
      <li className="list-check">
        {tFontaines("machine-autonome-fournie")}{" "}
        <strong>{tFontaines("avec-un-meuble-ou-un-pied")}</strong>
      </li>
    </>
  );
  const infosExcellence = (
    <>
      <li className="list-check">
        {tFontaines("machine")}{" "}
        <strong>{tFontaines("integree-sous-un-meuble")}</strong>{" "}
        {tFontaines("non-fourni-avec-colonne-de-distribution")}
      </li>
    </>
  );
  const dialogTitle = (
    <p className={`text-center`}>
      {proposition.typePose === "aposer"
        ? capitalize(tFontaines("a-poser"))
        : proposition.typePose === "colonne"
          ? tFontaines("colonne-sur-pied")
          : tFontaines("sous-comptoir")}
    </p>
  );
  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 mx-auto">
      {proposition.totalAnnuel ? (
        locale === "fr" ? (
          <li className="list-check text-sm font-bold">
            1 {tFontaines("fontaine")}{" "}
            <span
              className={`${
                proposition.fournisseurId === 13 ? "inline-block blur-sm" : ""
              }`}
            >
              {proposition.marque}
            </span>{" "}
            {proposition.modele}{" "}
            {proposition.reconditionne ? t("reconditionnee-s") : ""}
          </li>
        ) : (
          <li className="list-check text-sm font-bold">
            1{" "}
            <span
              className={`${
                proposition.fournisseurId === 13 ? "inline-block blur-sm" : ""
              }`}
            >
              {proposition.marque}
            </span>{" "}
            {proposition.modele}{" "}
            {proposition.reconditionne ? t("reconditionnee-s") : ""}{" "}
            {tFontaines("fontaine")}
          </li>
        )
      ) : null}
      {proposition.typePose === "aposer"
        ? infosEssentiel
        : proposition.typePose === "colonne"
          ? infosConfort
          : infosExcellence}
      <li className="list-check">
        {tFontaines("filtres-et-maintenance-inclus")}
      </li>
      {getTypeFontaine(espace.infos.typeEau) === "EG" ||
      getTypeFontaine(espace.infos.typeEau) === "ECG" ? (
        <li className="list-check">{tFontaines("co2-inclus")}</li>
      ) : null}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      {proposition.totalAnnuel ? (
        locale === "fr" ? (
          <li className="list-check text-sm font-bold">
            1 {tFontaines("fontaine")}{" "}
            <span
              className={`${
                proposition.fournisseurId === 13 ? "inline-block blur-sm" : ""
              }`}
            >
              {proposition.marque}
            </span>{" "}
            {proposition.modele}{" "}
            {proposition.reconditionne ? t("reconditionnee-s") : ""}
          </li>
        ) : (
          <li className="list-check text-sm font-bold">
            1{" "}
            <span
              className={`${
                proposition.fournisseurId === 13 ? "inline-block blur-sm" : ""
              }`}
            >
              {proposition.marque}
            </span>{" "}
            {proposition.modele}{" "}
            {proposition.reconditionne ? t("reconditionnee-s") : ""}{" "}
            {tFontaines("fontaine")}
          </li>
        )
      ) : null}
      {proposition.typePose === "aposer"
        ? infosEssentiel
        : proposition.typePose === "colonne"
          ? infosConfort
          : infosExcellence}
      <li className="list-check">
        {tFontaines("filtres-et-maintenance-inclus")}
      </li>
      {getTypeFontaine(espace.infos.typeEau) === "EG" ||
      getTypeFontaine(espace.infos.typeEau) === "ECG" ? (
        <li className="list-check">{tFontaines("co2-inclus")}</li>
      ) : null}
    </ul>
  );

  const imgProduit = (
    <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
      <Image
        src={
          proposition.imageUrl ??
          (proposition.typePose === "aposer"
            ? "/img/services/fontaine_aposer.webp"
            : proposition.typePose === "colonne"
              ? "/img/services/fontaine_colonne.webp"
              : "/img/services/fontaine_comptoir.webp")
        }
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
            : handleClickProposition(proposition)
        }
        className="data-[state=checked]:bg-fm4alldestructive"
        title={t("selectionnez-cette-proposition")}
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
                {t("photo-non-contractuelle")}
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
