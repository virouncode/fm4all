import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { HygieneContext } from "@/context/HygieneProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type HygienePropositionCardProps = {
  proposition: {
    gamme: GammeType;
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
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    minFacturation: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  };
  handleClickProposition: (proposition: {
    gamme: GammeType;
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
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    minFacturation: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  }) => void;
  prixInstalDistrib: number | null;
};

const HygienePropositionCard = ({
  proposition,
  handleClickProposition,
  prixInstalDistrib,
}: HygienePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tGlobal = useTranslations("Global");
  const locale = useLocale();
  const { hygiene } = useContext(HygieneContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  if (!proposition.totalAnnuelTrilogie) {
    return (
      <div
        className={`flex flex-1 bg-${color} items-center justify-center gap-4 p-4 text-2xl text-slate-200`}
      >
        {t("non-propose")}
      </div>
    );
  }
  const totalMensuelText = (
    <p className="ml-4 text-xl font-bold" data-testid="total-mensuel-trilogie">
      {formatNumber((proposition.totalAnnuelTrilogie * MARGE) / 12)}{" "}
      {t("euros-mois")}
    </p>
  );

  const prixInstallationText = prixInstalDistrib ? (
    <p className="ml-4 text-base font-bold">
      +{formatNumber(prixInstalDistrib * MARGE)} {t("eur-d-installation")}
    </p>
  ) : null;

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {proposition.gamme === "essentiel"
        ? tGlobal("essentiel")
        : proposition.gamme === "confort"
          ? tGlobal("confort")
          : tGlobal("excellence")}
    </p>
  );

  const imgProduit = (
    <div className="flex items-center justify-between gap-2">
      {proposition.imageUrlEmp ? (
        <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
          <Image
            src={proposition.imageUrlEmp}
            alt={tHygiene("illustration-essuie-mains-papier")}
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      ) : null}
      {proposition.imageUrlPh ? (
        <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
          <Image
            src={proposition.imageUrlPh}
            alt={tHygiene("illustration-distributeur-papier-hygienique")}
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      ) : null}
      {proposition.imageUrlSavon ? (
        <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
          <Image
            src={proposition.imageUrlSavon}
            alt={tHygiene("illustration-distributeur-savon")}
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      ) : null}
    </div>
  );

  const infosProduit = (
    <ul className="mx-auto flex flex-col px-4 text-xs">
      {locale === "fr" ? (
        <li className="list-check">
          {tHygiene("distributeurs")}{" "}
          {gamme === "essentiel"
            ? tHygiene("blancs-basic")
            : gamme === "confort"
              ? tHygiene("couleur")
              : tHygiene("inox")}
        </li>
      ) : (
        <li className="list-check">
          {gamme === "essentiel"
            ? tHygiene("blancs-basic")
            : gamme === "confort"
              ? tHygiene("couleur")
              : tHygiene("inox")}{" "}
          {tHygiene("distributeurs").toLowerCase()}
        </li>
      )}
      <li className="list-check">{t("consommables-inclus")}</li>
      <li className="list-check">
        {hygiene.infos.dureeLocation === "oneShot"
          ? ""
          : t("location-engagement", {
              duree:
                hygiene.infos.dureeLocation === "pa12M"
                  ? "12"
                  : hygiene.infos.dureeLocation === "pa24M"
                    ? "24"
                    : "36",
            })}
      </li>
    </ul>
  );

  const infosProduitDialog = (
    <ul className="mx-auto flex flex-col px-4 text-sm">
      {locale === "fr" ? (
        <li className="list-check">
          {tHygiene("distributeurs")}{" "}
          {gamme === "essentiel"
            ? tHygiene("blancs-basic")
            : gamme === "confort"
              ? tHygiene("couleur")
              : tHygiene("inox")}
        </li>
      ) : (
        <li className="list-check">
          {gamme === "essentiel"
            ? tHygiene("blancs-basic")
            : gamme === "confort"
              ? tHygiene("couleur")
              : tHygiene("inox")}{" "}
          {tHygiene("distributeurs").toLowerCase()}
        </li>
      )}
      <li className="list-check">{t("consommables-inclus")}</li>
      <li className="list-check">
        {hygiene.infos.dureeLocation === "oneShot"
          ? ""
          : t("location-engagement", {
              duree:
                hygiene.infos.dureeLocation === "pa12M"
                  ? "12"
                  : hygiene.infos.dureeLocation === "pa24M"
                    ? "24"
                    : "36",
            })}
      </li>
    </ul>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} cursor-pointer items-center justify-center gap-4 p-4 text-2xl text-slate-200 ${
        hygiene.infos.trilogieGammeSelected === gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={hygiene.infos.trilogieGammeSelected === gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title={t("selectionnez-cette-proposition")}
        data-testid="hygiene-switch"
      />
      <div>
        <div className="flex items-center gap-2">
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
              <p className="text-end text-xs italic">
                {t("photos-non-contractuelles")}
              </p>
              {infosProduitDialog}
            </DialogContent>
          </Dialog>
        </div>
        {infosProduit}
        {prixInstallationText}
      </div>
    </div>
  );
};

export default HygienePropositionCard;
