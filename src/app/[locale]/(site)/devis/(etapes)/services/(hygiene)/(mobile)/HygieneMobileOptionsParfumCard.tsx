import FournisseurDialog from "@/app/[locale]/(site)/devis/FournisseurDialog";
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
import { HygieneContext } from "@/context/HygieneProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type HygieneMobileOptionsParfumCardProps = {
  proposition: {
    nomFournisseur: string;
    sloganFournisseur: string | null;
    anneeCreation: number | null;
    logoUrl: string | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    locationUrl: string | null;
    gamme: "essentiel" | "confort" | "excellence";
    prixDistribDesinfectant: number | null;
    prixDistribParfum: number | null;
    prixDistribBalai: number | null;
    prixDistribPoubelle: number | null;
    paParPersonneDesinfectant: number | null;
    totalDesinfectant: number | null;
    totalParfum: number | null;
    totalBalai: number | null;
    totalPoubelle: number | null;
    imageUrlDesinfectant: string | null;
    imageUrlParfum: string | null;
    imageUrlBalai: string | null;
    imageUrlPoubelle: string | null;
  };
  handleClickProposition: (
    type: string,
    proposition: {
      nomFournisseur: string;
      sloganFournisseur: string | null;
      anneeCreation: number | null;
      logoUrl: string | null;
      ca: string | null;
      effectifFournisseur: string | null;
      nbClients: number | null;
      noteGoogle: string | null;
      nbAvis: number | null;
      locationUrl: string | null;
      gamme: "essentiel" | "confort" | "excellence";
      prixDistribDesinfectant: number | null;
      prixDistribParfum: number | null;
      prixDistribBalai: number | null;
      prixDistribPoubelle: number | null;
      paParPersonneDesinfectant: number | null;
      totalDesinfectant: number | null;
      totalParfum: number | null;
      totalBalai: number | null;
      totalPoubelle: number | null;
      imageUrlDesinfectant: string | null;
      imageUrlParfum: string | null;
      imageUrlBalai: string | null;
      imageUrlPoubelle: string | null;
    },
  ) => void;
};

const HygieneMobileOptionsParfumCard = ({
  proposition,
  handleClickProposition,
}: HygieneMobileOptionsParfumCardProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tGlobal = useTranslations("Global");
  const locale = useLocale();

  const { hygiene } = useContext(HygieneContext);
  const {
    gamme,
    imageUrlParfum,
    totalParfum,
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
  } = proposition;
  const color = getFm4AllColor(gamme);
  const prixMensuelParfumText = totalParfum ? (
    <p className="text-sm font-bold">
      {formatNumber((totalParfum * MARGE) / 12)} {t("euros-mois")}
    </p>
  ) : (
    <p className="text-sm font-bold">{t("non-propose")}</p>
  );

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {gamme === "essentiel"
        ? tGlobal("essentiel")
        : gamme === "confort"
          ? tGlobal("confort")
          : tGlobal("excellence")}
    </p>
  );

  const imgProduit = (
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={`${imageUrlParfum || "/img/services/hygiene.webp"}`}
        alt={`illustration de distributeur de parfum`}
        fill={true}
        className="cursor-pointer object-contain"
        quality={100}
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={`${imageUrlParfum || "/img/services/hygiene.webp"}`}
        alt={`illustration de distributeur de parfum`}
        fill={true}
        className="cursor-pointer object-contain"
        quality={100}
      />
    </div>
  );

  const infosProduit = (
    <ul className="flex flex-col px-4 text-xs">
      {locale === "fr" ? (
        <li className="list-check">
          {tHygiene("diffuseurs")}{" "}
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
          {tHygiene("diffuseurs").toLowerCase()}
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
          {tHygiene("diffuseurs")}{" "}
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
          {tHygiene("diffuseurs").toLowerCase()}
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
    <CarouselItem>
      <div
        className={`bg-${color} flex h-56 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          hygiene.infos.parfumGammeSelected === gamme
            ? "ring-fm4alldestructive ring-4 ring-inset"
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
              <div className="flex flex-col gap-4">
                {imgProduitDialog}
                <p className="text-end text-xs italic">
                  {t("photo-non-contractuelle")}
                </p>
                {infosProduitDialog}
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex h-full w-2/3 flex-col gap-1">
            <p className="text-sm font-bold">{nomFournisseur}</p>
            <Dialog>
              <DialogTrigger asChild>
                {logoUrl ? (
                  <div className="relative h-10">
                    <Image
                      src={logoUrl}
                      alt={`logo-de-${nomFournisseur}`}
                      fill={true}
                      className="cursor-pointer object-contain object-left"
                      quality={100}
                    />
                  </div>
                ) : null}
              </DialogTrigger>
              <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                <DialogHeader>
                  <DialogTitle>{nomFournisseur}</DialogTitle>
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
            totalParfum
              ? () => handleClickProposition("parfum", proposition)
              : undefined
          }
        >
          {infosProduit}
          <div className="flex flex-col items-end gap-2">
            {prixMensuelParfumText}
            {totalParfum ? (
              <Switch
                className={`${
                  hygiene.infos.parfumGammeSelected === gamme
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={hygiene.infos.parfumGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition("parfum", proposition)
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

export default HygieneMobileOptionsParfumCard;
