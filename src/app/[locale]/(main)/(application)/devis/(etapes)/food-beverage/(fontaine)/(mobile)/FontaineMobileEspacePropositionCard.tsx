import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
import StarRating from "@/components/star/StarRating";
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
import { capitalize } from "@/lib/utils/capitalize";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { FontaineEspaceType } from "@/zod-schemas/fontaines.schema";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
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
  const t = useTranslations("DevisPage");
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const locale = useLocale();
  const fontaines = useFontainesStore((s) => s.fontaines);
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
      {formatNumber((totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  ) : (
    <p className="text-end text-sm font-bold">
      {t("non-propose-pour-ces-criteres")}
    </p>
  );

  const prixInstallationText = totalInstallation ? (
    <p className="text-end text-xs">
      + {formatNumber(totalInstallation * MARGE)} {t("eur-d-installation")}
    </p>
  ) : null;

  const dialogTitle = (
    <p className={`text-center`}>
      {proposition.typePose === "aposer"
        ? capitalize(tFontaines("a-poser"))
        : proposition.typePose === "colonne"
          ? tFontaines("colonne-sur-pied")
          : tFontaines("sous-comptoir")}
    </p>
  );
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

  const infosProduit = (
    <ul className="mx-auto flex w-2/3 flex-col px-4 text-xs">
      {totalAnnuel ? (
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
    <ul className="mx-auto flex flex-col px-4 text-sm">
      {totalAnnuel ? (
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
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-200">
      <Image
        src={
          imageUrl ??
          (typePose === "aposer"
            ? "/img/services/fontaine_aposer.webp"
            : typePose === "colonne"
              ? "/img/services/fontaine_colonne.webp"
              : "/img/services/fontaine_comptoir.webp")
        }
        alt={`illustration ${marque} ${modele}`}
        fill
        className="cursor-pointer object-contain"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
      <Image
        src={
          imageUrl ??
          (typePose === "aposer"
            ? "/img/services/fontaine_aposer.webp"
            : typePose === "colonne"
              ? "/img/services/fontaine_colonne.webp"
              : "/img/services/fontaine_comptoir.webp")
        }
        alt={`illustration ${marque} ${modele}`}
        fill
        className="object-contain"
        sizes="(max-width:768px) 100vw"
      />
    </div>
  );

  return (
    <CarouselItem>
      <div
        className={`flex h-72 flex-col rounded-xl border border-slate-200 bg-slate-100 p-4 ${
          fontaines.infos.fournisseurId === proposition.fournisseurId &&
          espace.infos.poseSelected === proposition.typePose
            ? "ring-destructive ring-4 ring-inset"
            : ""
        }`}
      >
        <div className="flex h-1/2 items-center gap-2 border-b border-slate-200 pb-2">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              {imgProduitDialog}
              <p className="text-end text-xs italic">
                {t("photo-non-contractuelle")}
              </p>
              {infosProduitDialog}
            </DialogContent>
          </Dialog>
          <div className="flex h-full w-2/3 flex-col gap-1">
            <p
              className={`text-sm font-bold ${
                fournisseurId === 13 ? "blur-lg" : ""
              }`}
            >
              {nomFournisseur}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                {logoUrl ? (
                  <div
                    className={`relative h-10 ${
                      fournisseurId === 13 ? "blur-lg" : ""
                    }`}
                  >
                    <Image
                      src={logoUrl}
                      alt={`logo-de-${nomFournisseur}`}
                      fill={true}
                      className="cursor-pointer object-contain object-left"
                      sizes="(max-width:768px) 100vw"
                    />
                  </div>
                ) : null}
              </DialogTrigger>
              <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                <DialogHeader>
                  <DialogTitle
                    className={`${fournisseurId === 13 ? "blur-lg" : ""} `}
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
          className="flex h-1/2 justify-between pt-2"
          onClick={
            totalAnnuel
              ? () =>
                  fontainesEspacesIds[0] === espace.infos.espaceId
                    ? handleClickFirstEspaceProposition(proposition)
                    : handleClickProposition(proposition)
              : undefined
          }
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            {totalMensuelText}
            {prixInstallationText}
            {totalAnnuel ? (
              <Switch
                className={`${
                  espace.infos.poseSelected === typePose &&
                  fontaines.infos.fournisseurId === fournisseurId
                    ? "data-[state=checked]:bg-destructive"
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
                title={t("selectionnez-cette-proposition")}
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
