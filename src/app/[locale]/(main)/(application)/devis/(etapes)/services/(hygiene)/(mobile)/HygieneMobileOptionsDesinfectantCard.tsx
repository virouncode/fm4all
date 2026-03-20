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
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { HygieneOptionsType } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsDesinfectantCardProps = {
  proposition: {
    nomPrestataire: string;
    sloganPrestataire: string | null;
    anneeCreation: number | null;
    logoStorageKey: string | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
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
    type: HygieneOptionsType,
    proposition: {
      nomPrestataire: string;
      sloganPrestataire: string | null;
      anneeCreation: number | null;
      logoStorageKey: string | null;
      ca: string | null;
      effectifFournisseur: string | null;
      nbClients: number | null;
      noteGoogle: string | null;
      nbAvis: number | null;
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

const HygieneMobileOptionsDesinfectantCard = ({
  proposition,
  handleClickProposition,
}: HygieneMobileOptionsDesinfectantCardProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tGlobal = useTranslations("Global");
  const locale = useLocale();
  const hygiene = useHygieneStore((s) => s.hygiene);
  const {
    gamme,
    imageUrlDesinfectant,
    totalDesinfectant,
    nomPrestataire,
    sloganPrestataire,
    logoStorageKey,
    anneeCreation,
    ca,
    effectifFournisseur,
    nbClients,
    noteGoogle,
    nbAvis,
  } = proposition;
  const color = getFm4AllColor(gamme);
  const prixMensuelDesinfectantText = totalDesinfectant ? (
    <p className="text-sm font-bold">
      {formatNumber((totalDesinfectant * MARGE) / 12)} {t("euros-mois")}
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
        src={`${imageUrlDesinfectant || "/img/services/hygiene.webp"}`}
        alt={`illustration de distributeur de desinfectant`}
        fill
        className="cursor-pointer object-contain"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={`${imageUrlDesinfectant || "/img/services/hygiene.webp"}`}
        alt={`illustration de distributeur de desinfectant`}
        fill
        className="cursor-pointer object-contain"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const infosProduit = (
    <ul className="flex flex-col px-4 text-xs">
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
          {tHygiene("distributeurs")}
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
          {tHygiene("distributeurs")}
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
          hygiene.infos.desinfectantGammeSelected === gamme
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
            <p className="text-sm font-bold">{nomPrestataire}</p>
            <Dialog>
              <DialogTrigger asChild>
                {logoStorageKey ? (
                  <div className="relative h-10">
                    <Image
                      src={logoStorageKey}
                      alt={`logo-de-${nomPrestataire}`}
                      fill
                      className="cursor-pointer object-contain object-left"
                      sizes="(max-width:768px) 100vw"
                    />
                  </div>
                ) : null}
              </DialogTrigger>
              <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                <DialogHeader>
                  <DialogTitle>{nomPrestataire}</DialogTitle>
                </DialogHeader>
                <FournisseurDialog
                  sloganPrestataire={sloganPrestataire}
                  logoStorageKey={logoStorageKey}
                  nomPrestataire={nomPrestataire}
                  locationUrl={null}
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
            totalDesinfectant
              ? () => handleClickProposition("desinfectant", proposition)
              : undefined
          }
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            {prixMensuelDesinfectantText}
            {totalDesinfectant ? (
              <Switch
                className={`${
                  hygiene.infos.desinfectantGammeSelected === gamme
                    ? "data-[state=checked]:bg-destructive"
                    : ""
                }`}
                checked={hygiene.infos.desinfectantGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition("desinfectant", proposition)
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

export default HygieneMobileOptionsDesinfectantCard;
