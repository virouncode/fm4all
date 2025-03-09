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
import Image from "next/image";
import { ChangeEvent, useContext } from "react";

type HygieneOptionsParfumCardProps = {
  nbDistribParfum: number;
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

const HygieneOptionsParfumCard = ({
  nbDistribParfum,
  handleChangeDistribNbr,
  handleClickProposition,
  hygieneDistribQuantite,
  propositions,
}: HygieneOptionsParfumCardProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
        <p className="text-base">Parfum</p>
        <div className="text-sm flex flex-col gap-2">
          <div className="flex gap-4 items-center justify-center w-full">
            <Input
              type="number"
              value={nbDistribParfum}
              min={1}
              max={100}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "parfum")}
              className={`w-16 ${
                hygiene.quantites.nbDistribParfum ===
                hygieneDistribQuantite.nbDistribParfum
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbDistribParfum"
            />
            <Label htmlFor="nbDistribParfum" className="text-sm">
              distributeurs
            </Label>
          </div>
        </div>
      </div>
      {propositions.map((proposition) => {
        const gamme = proposition.gamme;
        const color = getFm4AllColor(gamme);
        if (!proposition.totalParfum) {
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center p-2 justify-center text-xl gap-4 `}
              key={"parfum" + gamme}
            >
              Non proposé
            </div>
          );
        }
        const prixMensuelParfumText = (
          <p className="font-bold text-xl ml-4">
            {formatNumber(Math.round((proposition.totalParfum * MARGE) / 12))}{" "}
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
        const imgProduit = proposition.imageUrlParfum ? (
          <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
            <Image
              src={proposition.imageUrlParfum}
              alt="illustration-diffuseur-parfum"
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
              hygiene.infos.parfumGammeSelected === gamme
                ? "ring-4 ring-inset ring-fm4alldestructive"
                : ""
            }`}
            key={"parfum" + gamme}
            onClick={() => handleClickProposition("parfum", proposition)}
          >
            <Switch
              checked={hygiene.infos.parfumGammeSelected === gamme}
              onCheckedChange={() =>
                handleClickProposition("parfum", proposition)
              }
              className="data-[state=checked]:bg-fm4alldestructive"
              title="Sélectionner cette proposition"
            />
            <div>
              <div className="flex gap-2 items-center">
                {prixMensuelParfumText}
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

export default HygieneOptionsParfumCard;
