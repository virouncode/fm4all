import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IncendieContext } from "@/context/IncendieProvider";
import React, { useContext } from "react";
import {
  MAX_NB_BAES,
  MAX_NB_EXTINCTEURS,
  MAX_NB_TEL_BAES,
} from "../SecuriteIncendiePropositions";

type SecuriteIncendieMobileInputsProps = {
  nbExtincteurs: number;
  nbBaes: number;
  nbTelBaes: number;
  handleChangeNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "extincteur" | "baes" | "telBaes"
  ) => void;
  incendieQuantite: {
    nbExtincteurs: number;
    id: number;
    surface: number;
    createdAt: Date;
  };
};

const SecuriteIncendieMobileInputs = ({
  nbExtincteurs,
  nbBaes,
  nbTelBaes,
  handleChangeNbr,
  incendieQuantite,
}: SecuriteIncendieMobileInputsProps) => {
  const { incendie } = useContext(IncendieContext);
  return (
    <div className="flex flex-col gap-8">
      <p className="font-bold text-xl hyphens-auto">
        Contrôle des extincteurs, BAES, télécommandes BAES
      </p>
      <div className="flex flex-col gap-4">
        <p>Indiquez votre nombre d&apos;extincteurs :</p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribBalai" className="text-sm">
            Nombre d&apos;extincteurs
          </Label>
          <Input
            type="number"
            value={nbExtincteurs || ""}
            min={1}
            max={MAX_NB_EXTINCTEURS}
            step={1}
            onChange={(e) => handleChangeNbr(e, "extincteur")}
            className={`w-full ${
              incendie.quantites.nbExtincteurs ===
              incendieQuantite.nbExtincteurs
                ? "text-fm4alldestructive"
                : ""
            }`}
            id="nbExtincteurs"
          />
          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez votre nombre de BAES (blocs autonomes d&apos;éclairage de
          sécurité) :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbBaes" className="text-sm">
            Nombre de BAES
          </Label>
          <Input
            type="number"
            value={nbBaes || ""}
            min={1}
            max={MAX_NB_BAES}
            step={1}
            onChange={(e) => handleChangeNbr(e, "baes")}
            className={`w-full ${
              incendie.quantites.nbBaes ===
              Math.ceil(incendieQuantite.nbExtincteurs * 2.3)
                ? "text-fm4alldestructive"
                : ""
            }`}
            id="nbBaes"
          />
          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>Indiquez votre nombre de télécommandes BAES :</p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbTelBaes" className="text-sm">
            Nombre de télécommandes
          </Label>
          <Input
            type="number"
            value={nbTelBaes || ""}
            min={1}
            max={MAX_NB_TEL_BAES}
            step={1}
            onChange={(e) => handleChangeNbr(e, "telBaes")}
            className={`w-full ${
              incendie.quantites.nbTelBaes === 1 ? "text-fm4alldestructive" : ""
            }`}
            id="nbTelBaes"
          />
          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecuriteIncendieMobileInputs;
