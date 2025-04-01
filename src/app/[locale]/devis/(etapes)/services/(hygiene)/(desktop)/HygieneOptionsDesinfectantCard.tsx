"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { HygieneContext } from "@/context/HygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ChangeEvent, useContext } from "react";
import { MAX_NB_DISTRIB } from "./HygieneOptionsPropositions";

type HygieneOptionsDesinfectantCardProps = {
  nbDistribDesinfectant: number;
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
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  propositions: {
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
  }[];
};

const HygieneOptionsDesinfectantCard = ({
  nbDistribDesinfectant,
  handleChangeDistribNbr,
  handleClickProposition,
  hygieneDistribQuantite,
  propositions,
}: HygieneOptionsDesinfectantCardProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tGlobal = useTranslations("Global");
  const locale = useLocale();
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
        <p className="text-base">{tHygiene("desinfectant-pour-cuvettes")}</p>
        <div className="text-sm flex flex-col gap-2">
          <div className="flex gap-4 items-center justify-center w-full">
            <Input
              type="number"
              value={nbDistribDesinfectant || ""}
              min={1}
              max={MAX_NB_DISTRIB}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "desinfectant")}
              className={`w-16 ${
                hygiene.quantites.nbDistribDesinfectant ===
                hygieneDistribQuantite.nbDistribDesinfectant
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbDistribDesinfectant"
            />
            <Label htmlFor="nbDistribDesinfectant" className="text-sm">
              {tHygiene("distributeurs").toLowerCase()}
            </Label>
          </div>
        </div>
      </div>
      {propositions.map((proposition) => {
        const gamme = proposition.gamme;
        const color = getFm4AllColor(gamme);
        if (!proposition.totalDesinfectant) {
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center p-2 justify-center text-xl gap-4 `}
              key={"desinfectant" + gamme}
            >
              {t("non-propose")}
            </div>
          );
        }
        const prixMensuelDesinfectantText = (
          <p className="font-bold text-xl ml-4">
            {formatNumber(
              Math.round((proposition.totalDesinfectant * MARGE) / 12)
            )}{" "}
            {t("euros-mois")}
          </p>
        );
        const dialogTitle = (
          <p className={`text-${color} text-center`}>
            {proposition.gamme === "essentiel"
              ? tGlobal("essentiel")
              : proposition.gamme === "confort"
                ? tGlobal("confort")
                : tGlobal("excellence")}
          </p>
        );
        const imgProduit = proposition.imageUrlDesinfectant ? (
          <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
            <Image
              src={proposition.imageUrlDesinfectant}
              alt="illustration-distributeur-desinfectant"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        ) : null;
        const infosProduit = (
          <ul className="flex flex-col text-xs px-4 mx-auto">
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
          <ul className="flex flex-col text-sm px-4 mx-auto">
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
            className={`flex flex-1 bg-${color} text-slate-200 items-center p-2 justify-center text-xl gap-4 cursor-pointer ${
              hygiene.infos.desinfectantGammeSelected === gamme
                ? "ring-4 ring-inset ring-fm4alldestructive"
                : ""
            }`}
            key={"desinfectant" + gamme}
            onClick={() => handleClickProposition("desinfectant", proposition)}
          >
            <Switch
              checked={hygiene.infos.desinfectantGammeSelected === gamme}
              onCheckedChange={() =>
                handleClickProposition("desinfectant", proposition)
              }
              className="data-[state=checked]:bg-fm4alldestructive"
              title={t("selectionnez-cette-proposition")}
            />
            <div>
              <div className="flex gap-2 items-center">
                {prixMensuelDesinfectantText}
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
              {infosProduit}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HygieneOptionsDesinfectantCard;
