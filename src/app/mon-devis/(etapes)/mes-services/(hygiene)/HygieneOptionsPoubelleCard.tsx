"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MARGE } from "@/constants/constants";
import { HygieneContext } from "@/context/HygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { DureeLocationHygieneType } from "@/zod-schemas/dureeLocation";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent, useContext } from "react";

type HygieneOptionsPoubelleCardProps = {
  nbDistribPoubelle: number;
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

const HygieneOptionsPoubelleCard = ({
  nbDistribPoubelle,
  dureeLocation,
  handleChangeDistribNbr,
  handleClickProposition,
  hygieneDistribQuantite,
  propositions,
}: HygieneOptionsPoubelleCardProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
        <p className="text-base">Poubelles hygiène féminine</p>
        <div className="text-sm flex flex-col gap-2">
          <div className="flex gap-4 items-center justify-center w-full">
            <Input
              type="number"
              value={nbDistribPoubelle}
              min={1}
              max={100}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "poubelle")}
              className={`w-16 ${
                hygiene.quantites.nbDistribPoubelle ===
                hygieneDistribQuantite.nbDistribPoubelle
                  ? "text-destructive"
                  : ""
              }`}
            />
            <Label htmlFor="nbDistribPoubelle" className="text-sm">
              blocs
            </Label>
          </div>
          <p className="text-xs text-destructive italic px-2 text-center">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      {propositions.map((proposition) => {
        const gamme = proposition.gamme;
        const color = getFm4AllColor(gamme);
        if (!proposition.totalPoubelle) {
          return (
            <div
              className={`flex-1 bg-${color} text-xl font-bold text-slate-200 flex items-center justify-center p-2`}
              key={"poubelle" + gamme}
            >
              <p>Non proposé</p>
            </div>
          );
        }
        const prixMensuelPoubelleText = `${formatNumber(
          Math.round((proposition.totalPoubelle * MARGE) / 12)
        )} € / mois`;
        return (
          <div
            className={`flex flex-1 bg-${color} text-slate-200 items-center p-2 justify-center text-xl gap-4 cursor-pointer ${
              hygiene.infos.poubelleGammeSelected === gamme
                ? "ring-4 ring-inset ring-destructive"
                : ""
            }`}
            key={"poubelle" + gamme}
            onClick={() => handleClickProposition("poubelle", proposition)}
          >
            {" "}
            <Checkbox
              checked={hygiene.infos.poubelleGammeSelected === gamme}
              onCheckedChange={() =>
                handleClickProposition("poubelle", proposition)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p>{prixMensuelPoubelleText}</p>
              <p className="text-sm">
                Réceptacles{" "}
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

export default HygieneOptionsPoubelleCard;
