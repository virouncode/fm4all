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
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ChangeEvent, useContext } from "react";

type HygieneOptionsBalaiCardProps = {
  nbDistribBalai: number;
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

const HygieneOptionsBalaiCard = ({
  nbDistribBalai,
  handleChangeDistribNbr,
  handleClickProposition,
  hygieneDistribQuantite,
  propositions,
}: HygieneOptionsBalaiCardProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tGlobal = useTranslations("Global");
  const locale = useLocale();
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
        <p className="text-base">{tHygiene("balais-wc")}</p>
        <div className="text-sm flex flex-col gap-2">
          <div className="flex gap-4 items-center justify-center w-full">
            <Input
              type="number"
              value={nbDistribBalai || ""}
              min={1}
              max={100}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "balai")}
              className={`w-16 ${
                hygiene.quantites.nbDistribBalai ===
                hygieneDistribQuantite.nbDistribBalai
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbDistribBalai"
            />
            <Label htmlFor="nbDistribBalai" className="text-sm">
              {tHygiene("blocs")}
            </Label>
          </div>
        </div>
      </div>
      {propositions.map((proposition) => {
        const gamme = proposition.gamme;
        const color = getFm4AllColor(gamme);
        if (!proposition.totalBalai) {
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center p-2 justify-center text-xl gap-4 `}
              key={"balai" + gamme}
            >
              {t("non-propose")}
            </div>
          );
        }
        const prixMensuelBalaiText = (
          <p className="font-bold text-xl ml-4">
            {formatNumber((proposition.totalBalai * MARGE) / 12)}{" "}
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
        const imgProduit = proposition.imageUrlBalai ? (
          <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
            <Image
              src={proposition.imageUrlBalai}
              alt="illustration-balai-wc"
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
          <div
            className={`flex flex-1 bg-${color} text-slate-200 items-center p-2 justify-center text-xl gap-4 cursor-pointer ${
              hygiene.infos.balaiGammeSelected === gamme
                ? "ring-4 ring-inset ring-fm4alldestructive"
                : ""
            }`}
            key={"balai" + gamme}
            onClick={() => handleClickProposition("balai", proposition)}
          >
            <Switch
              checked={hygiene.infos.balaiGammeSelected === gamme}
              onCheckedChange={() =>
                handleClickProposition("balai", proposition)
              }
              className="data-[state=checked]:bg-fm4alldestructive"
              title={t("selectionnez-cette-proposition")}
            />
            <div>
              <div className="flex gap-2 items-center">
                {prixMensuelBalaiText}
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

export default HygieneOptionsBalaiCard;
