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
import { GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Info } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useContext } from "react";

type HygieneOptionsDesinfectantCardProps = {
  nbDistribDesinfectant: number;
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

const HygieneOptionsDesinfectantCard = ({
  nbDistribDesinfectant,
  handleChangeDistribNbr,
  handleClickProposition,
  hygieneDistribQuantite,
  propositions,
}: HygieneOptionsDesinfectantCardProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
        <p className="text-base">Desinfectant pour cuvettes</p>
        <div className="text-sm flex flex-col gap-2">
          <div className="flex gap-4 items-center justify-center w-full">
            <Input
              type="number"
              value={nbDistribDesinfectant}
              min={1}
              max={100}
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
              distributeurs
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
              Non proposé
            </div>
          );
        }
        const prixMensuelDesinfectantText = (
          <p className="font-bold text-xl ml-4">
            {formatNumber(
              Math.round((proposition.totalDesinfectant * MARGE) / 12)
            )}{" "}
            €/mois
          </p>
        );
        const dialogTitle = (
          <p className={`text-${color} text-center`}>
            {proposition.gamme === "essentiel"
              ? "Essentiel"
              : proposition.gamme === "confort"
              ? "Confort"
              : "Excellence"}
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
            <li className="list-check">
              Distributeurs{" "}
              {gamme === "essentiel"
                ? "blancs basic"
                : gamme === "confort"
                ? "couleur"
                : "inox"}
            </li>
            <li className="list-check">Consommables inclus</li>
            <li className="list-check">
              {hygiene.infos.dureeLocation === "oneShot"
                ? ""
                : `Location engagement
              ${
                hygiene.infos.dureeLocation === "pa12M"
                  ? "12"
                  : hygiene.infos.dureeLocation === "pa24M"
                  ? "24"
                  : "36"
              } mois`}
            </li>
          </ul>
        );

        const infosProduitDialog = (
          <ul className="flex flex-col text-sm px-4 mx-auto">
            <li className="list-check">
              Distributeurs{" "}
              {gamme === "essentiel"
                ? "blancs basic"
                : gamme === "confort"
                ? "couleur"
                : "inox"}
            </li>
            <li className="list-check">Consommables inclus</li>
            <li className="list-check">
              {hygiene.infos.dureeLocation === "oneShot"
                ? ""
                : `Location engagement
                  ${
                    hygiene.infos.dureeLocation === "pa12M"
                      ? "12"
                      : hygiene.infos.dureeLocation === "pa24M"
                      ? "24"
                      : "36"
                  } mois`}
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
              title="Sélectionner cette proposition"
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
                      *photo non contractuelle
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
