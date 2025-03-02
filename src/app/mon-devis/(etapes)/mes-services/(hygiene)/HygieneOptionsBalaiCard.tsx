"use client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MARGE } from "@/constants/constants";
import { HygieneContext } from "@/context/HygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { DureeLocationHygieneType } from "@/zod-schemas/dureeLocation";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Info } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useContext } from "react";

type HygieneOptionsBalaiCardProps = {
  nbDistribBalai: number;
  dureeLocation: DureeLocationHygieneType;
  handleClickProposition: (
    type: string,
    proposition: {
      gamme: GammeType;
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
    gamme: GammeType;
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
  dureeLocation,
  handleChangeDistribNbr,
  handleClickProposition,
  hygieneDistribQuantite,
  propositions,
}: HygieneOptionsBalaiCardProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
        <p className="text-base">Balais WC</p>
        <div className="text-sm flex flex-col gap-2">
          <div className="flex gap-4 items-center justify-center w-full">
            <Input
              type="number"
              value={nbDistribBalai}
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
            />
            <Label htmlFor="nbDistribBalai" className="text-sm">
              blocs
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
              Non proposé
            </div>
          );
        }
        const prixMensuelBalaiText = `${formatNumber(
          Math.round((proposition.totalBalai * MARGE) / 12)
        )} € / mois`;

        const infosTitle = (
          <p
            className={`text-${getFm4AllColor(proposition.gamme)} text-center`}
          >
            {proposition.gamme === "essentiel"
              ? "Essentiel"
              : proposition.gamme === "confort"
              ? "Confort"
              : "Excellence"}
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
          <div>
            <p className="text-sm mb-2">
              Socle et manche{" "}
              {gamme === "essentiel"
                ? "blancs basic"
                : gamme === "confort"
                ? "couleur"
                : "inox"}
            </p>
            {imgProduit}
            <p className="text-xs text-end italic">*photo non contractuelle</p>
          </div>
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
            {" "}
            <Checkbox
              checked={hygiene.infos.balaiGammeSelected === gamme}
              onCheckedChange={() =>
                handleClickProposition("balai", proposition)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <div className="flex gap-2">
                <p>{prixMensuelBalaiText}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Info size={16} onClick={(e) => e.stopPropagation()} />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{infosTitle}</DialogTitle>
                    </DialogHeader>
                    {infosProduit}
                  </DialogContent>
                </Dialog>
              </div>

              <p className="text-sm">
                Socle et manche{" "}
                {gamme === "essentiel"
                  ? "blancs basic"
                  : gamme === "confort"
                  ? "couleur"
                  : "inox"}
              </p>
              <p className="text-sm">
                {dureeLocation === "oneShot"
                  ? ""
                  : `Location engagement
                ${
                  dureeLocation === "pa12M"
                    ? "12"
                    : dureeLocation === "pa24M"
                    ? "24"
                    : "36"
                } mois`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HygieneOptionsBalaiCard;
