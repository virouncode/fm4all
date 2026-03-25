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
import { Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import PresignedTarifImage from "@/components/devis/PresignedTarifImage";
import { getTypeFontaine } from "./getTypeFontaine";
import { FontaineMobilePropositionItem } from "./(mobile)/FontaineMobileEspacePropositionCard";

type FontaineEspacePropositionCardProps = {
  proposition: FontaineMobilePropositionItem;
  handleClickProposition: (proposition: FontaineMobilePropositionItem) => void;
  handleClickFirstEspaceProposition: (proposition: FontaineMobilePropositionItem) => void;
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
  const fontaines = useFontainesStore((s) => s.fontaines);

  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex min-h-36 flex-1 items-center justify-center gap-4 border-r bg-muted p-4 text-center text-base`}
      >
        {t("non-propose-pour-ces-criteres")}
      </div>
    );
  }

  const totalMensuelText = (
    <p
      className="ml-4 text-xl font-bold"
      data-testid={`total-mensuel-fontaine-${espace.infos.espaceId}`}
    >
      {formatNumber((proposition.totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  );

  const prixInstallationText = proposition.totalInstallation ? (
    <p className="ml-4 text-base">
      + {formatNumber(proposition.totalInstallation * MARGE)}{" "}
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
    <ul className="mx-auto flex flex-col px-4 text-xs">
      {proposition.totalAnnuel ? (
        locale === "fr" ? (
          <li className="list-check text-sm font-bold">
            1 {tFontaines("fontaine")}{" "}
            <span
              className={`${
                ""
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
                ""
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
      {proposition.totalAnnuel ? (
        locale === "fr" ? (
          <li className="list-check text-sm font-bold">
            1 {tFontaines("fontaine")}{" "}
            <span
              className={`${
                ""
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
                ""
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

  const fontaineFallback =
    proposition.typePose === "aposer"
      ? "/img/services/fontaine_aposer.webp"
      : proposition.typePose === "colonne"
        ? "/img/services/fontaine_colonne.webp"
        : "/img/services/fontaine_comptoir.webp";

  const imgProduit = (
    <div className="relative mx-auto h-64 w-full rounded-lg border border-border bg-muted">
      <PresignedTarifImage
        storageKey={proposition.imageStorageKey}
        fallbackSrc={fontaineFallback}
        alt={`illustration ${proposition.marque} ${proposition.modele}`}
      />
    </div>
  );
  return (
    <div
      className={`flex flex-1 cursor-pointer items-center justify-center gap-4 border-r bg-muted p-4 text-2xl ${
        fontaines.infos.entrepriseId === proposition.entrepriseId &&
        espace.infos.poseSelected === proposition.typePose
          ? "ring-destructive ring-4 ring-inset"
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
          fontaines.infos.entrepriseId === proposition.entrepriseId &&
          (espace.infos.poseSelected === proposition.typePose ? true : false)
        }
        onCheckedChange={() => () =>
          fontainesEspacesIds[0] === espace.infos.espaceId
            ? handleClickFirstEspaceProposition(proposition)
            : handleClickProposition(proposition)
        }
        className="data-[state=checked]:bg-destructive"
        title={t("selectionnez-cette-proposition")}
        data-testid={`fontaine-switch-${espace.infos.espaceId}`}
      />

      <div>
        <div className="flex items-center gap-2">
          {totalMensuelText}
          <div onClick={(e) => e.stopPropagation()}>
            <Dialog>
              <DialogTrigger asChild>
                <Info
                  size={16}
                  className="cursor-pointer"
                />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                {imgProduit}
                <p className="text-end text-xs italic">
                  {t("photo-non-contractuelle")}
                </p>
                {infosProduitDialog}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {prixInstallationText}
        {infosProduit}
      </div>
    </div>
  );
};

export default FontaineEspacePropositionCard;
