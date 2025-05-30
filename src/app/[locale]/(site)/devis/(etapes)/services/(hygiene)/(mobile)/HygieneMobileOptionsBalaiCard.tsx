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

type HygieneMobileOptionsBalaiCardProps = {
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
    }
  ) => void;
};

const HygieneMobileOptionsBalaiCard = ({
  proposition,
  handleClickProposition,
}: HygieneMobileOptionsBalaiCardProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tGlobal = useTranslations("Global");
  const locale = useLocale();
  const { hygiene } = useContext(HygieneContext);
  const {
    gamme,
    imageUrlBalai,
    totalBalai,
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
  const prixMensuelBalaiText = totalBalai ? (
    <p className="text-sm font-bold">
      {formatNumber((totalBalai * MARGE) / 12)} {t("euros-mois")}
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
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-100">
      <Image
        src={`${imageUrlBalai || "/img/services/hygiene.webp"}`}
        alt={`illustration de balai WC`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );
  const imgProduitDialog = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={`${imageUrlBalai || "/img/services/hygiene.webp"}`}
        alt={`illustration de balai WC`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4">
      {locale === "fr" ? (
        <li className="list-check">
          {tHygiene("socle-et-manche")}{" "}
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
          {tHygiene("socle-et-manche").toLowerCase()}
        </li>
      )}
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
    <ul className="flex flex-col text-sm px-4 mx-auto">
      {locale === "fr" ? (
        <li className="list-check">
          {tHygiene("socle-et-manche")}{" "}
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
          {tHygiene("socle-et-manche").toLowerCase()}
        </li>
      )}
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
        className={`bg-${color} flex flex-col h-56 border border-slate-200 rounded-xl p-4 text-white  ${
          hygiene.infos.balaiGammeSelected === gamme
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
              <div className="flex flex-col gap-4">
                {imgProduitDialog}
                <p className="text-xs italic text-end">
                  {t("photo-non-contractuelle")}
                </p>
                {infosProduitDialog}
              </div>
            </DialogContent>
          </Dialog>
          <div className="w-2/3 flex flex-col gap-1 h-full">
            <p className="font-bold text-sm">{nomFournisseur}</p>
            <Dialog>
              <DialogTrigger asChild>
                {logoUrl ? (
                  <div className="h-10 relative">
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
          className="flex h-1/2 pt-2 justify-between"
          onClick={() => handleClickProposition("balai", proposition)}
        >
          {infosProduit}
          <div className="flex flex-col gap-2 items-end w-1/3">
            {prixMensuelBalaiText}
            {totalBalai ? (
              <Switch
                className={`${
                  hygiene.infos.balaiGammeSelected === gamme
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={hygiene.infos.balaiGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition("balai", proposition)
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

export default HygieneMobileOptionsBalaiCard;
