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

type HygieneOptionsDesinfectantCardProps = {
  nbDistribDesinfectant: number;
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

const HygieneOptionsDesinfectantCard = ({
  nbDistribDesinfectant,
  dureeLocation,
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
                  ? "text-destructive"
                  : ""
              }`}
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
        const prixMensuelDesinfectantText = `${formatNumber(
          Math.round(proposition.totalDesinfectant / 12)
        )} € / mois`;
        return (
          <div
            className={`flex flex-1 bg-${color} text-slate-200 items-center p-2 justify-center text-xl gap-4 cursor-pointer ${
              hygiene.infos.desinfectantGammeSelected === gamme
                ? "ring-4 ring-inset ring-destructive"
                : ""
            }`}
            key={"desinfectant" + gamme}
            onClick={() => handleClickProposition("desinfectant", proposition)}
          >
            {" "}
            <Checkbox
              checked={hygiene.infos.desinfectantGammeSelected === gamme}
              onCheckedChange={() =>
                handleClickProposition("desinfectant", proposition)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p>{prixMensuelDesinfectantText}</p>
              <p className="text-sm">
                Distributeurs{" "}
                {gamme === "essentiel"
                  ? "blancs basic"
                  : gamme === "confort"
                  ? "couleur"
                  : "inox"}
              </p>
              <p className="text-sm">
                {`Location engagement
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

export default HygieneOptionsDesinfectantCard;
