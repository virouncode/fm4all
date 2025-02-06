"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HygieneContext } from "@/context/HygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { DureeLocationHygieneType } from "@/zod-schemas/dureeLocation";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent, useContext } from "react";

type HygieneOptionsParfumCardProps = {
  nbDistribParfum: number;
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
  }[];
};

const HygieneOptionsParfumCard = ({
  nbDistribParfum,
  dureeLocation,
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
                  ? "text-destructive"
                  : ""
              }`}
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
        const prixMensuelParfumText = `${formatNumber(
          Math.round(proposition.totalParfum / 12)
        )} € / mois`;
        return (
          <div
            className={`flex flex-1 bg-${color} text-slate-200 items-center p-2 justify-center text-xl gap-4 cursor-pointer ${
              hygiene.infos.parfumGammeSelected === gamme
                ? "ring-4 ring-inset ring-destructive"
                : ""
            }`}
            key={"parfum" + gamme}
            onClick={() => handleClickProposition("parfum", proposition)}
          >
            {" "}
            <Checkbox
              checked={hygiene.infos.parfumGammeSelected === gamme}
              onCheckedChange={() =>
                handleClickProposition("parfum", proposition)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p>{prixMensuelParfumText}</p>
              <p className="text-sm">
                Distributeurs{" "}
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

export default HygieneOptionsParfumCard;
