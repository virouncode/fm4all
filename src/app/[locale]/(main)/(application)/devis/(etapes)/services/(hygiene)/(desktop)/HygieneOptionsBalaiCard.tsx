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
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ChangeEvent } from "react";
import { HygieneOptionsType } from "./HygieneOptionsPropositions";

type HygieneOptionsBalaiCardProps = {
  nbDistribBalai: number;
  handleClickProposition: (
    type: HygieneOptionsType,
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
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: HygieneOptionsType,
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
  const hygiene = useHygieneStore((s) => s.hygiene);
  return (
    <div className="flex flex-1 border-b">
      <div className="flex w-1/4 flex-col items-center justify-center gap-2 p-2">
        <p className="text-base">{tHygiene("balais-wc")}</p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex w-full items-center justify-center gap-4">
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
                  ? "text-destructive"
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
              className={`flex flex-1 bg-${color} items-center justify-center gap-4 p-2 text-xl text-slate-200`}
              key={"balai" + gamme}
            >
              {t("non-propose")}
            </div>
          );
        }
        const prixMensuelBalaiText = (
          <p
            className="ml-4 text-xl font-bold"
            data-testid="total-mensuel-balai"
          >
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
          <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
            <Image
              src={proposition.imageUrlBalai}
              alt="illustration-balai-wc"
              fill
              className="object-contain"
              sizes="(min-width:768px) 33vw"
            />
          </div>
        ) : null;
        const infosProduit = (
          <ul className="mx-auto flex flex-col px-4 text-xs">
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
          <ul className="mx-auto flex flex-col px-4 text-sm">
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
            className={`flex flex-1 bg-${color} cursor-pointer items-center justify-center gap-4 p-2 text-xl text-slate-200 ${
              hygiene.infos.balaiGammeSelected === gamme
                ? "ring-destructive ring-4 ring-inset"
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
              className="data-[state=checked]:bg-destructive"
              title={t("selectionnez-cette-proposition")}
              data-testid="balai-switch"
            />
            <div>
              <div className="flex items-center gap-2">
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
                    <p className="text-end text-xs italic">
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
