import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IncendieContext } from "@/context/IncendieProvider";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
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
  handleIncrement: (type: "extincteur" | "baes" | "telBaes") => void;
  handleDecrement: (type: "extincteur" | "baes" | "telBaes") => void;
};

const SecuriteIncendieMobileInputs = ({
  nbExtincteurs,
  nbBaes,
  nbTelBaes,
  handleChangeNbr,
  incendieQuantite,
  handleIncrement,
  handleDecrement,
}: SecuriteIncendieMobileInputsProps) => {
  const { incendie } = useContext(IncendieContext);

  return (
    <div className="flex flex-col gap-8">
      <p className="font-bold text-xl hyphens-auto">
        Contrôle des extincteurs, BAES, télécommandes BAES
      </p>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez votre nombre d&apos;<strong>extincteurs</strong> :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbExtincteurs" className="text-sm">
            Nombre d&apos;extincteurs
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={nbExtincteurs || ""}
              min={1}
              max={MAX_NB_EXTINCTEURS}
              step={1}
              onChange={(e) => handleChangeNbr(e, "extincteur")}
              className={`w-16 ${
                incendie.quantites.nbExtincteurs ===
                incendieQuantite.nbExtincteurs
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbExtincteurs"
            />
            <Button
              variant="outline"
              title="Diminuer le nombre d' extincteurs"
              onClick={() => handleDecrement("extincteur")}
              disabled={nbExtincteurs === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre d' extincteurs"
              onClick={() => handleIncrement("extincteur")}
              disabled={nbExtincteurs === MAX_NB_EXTINCTEURS}
            >
              <Plus />
            </Button>
          </div>
          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez votre nombre de{" "}
          <strong>BAES (blocs autonomes d&apos;éclairage de sécurité)</strong> :
        </p>
        <div className="w-24 h-16 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
          <Image
            src={"/img/services/baes.webp"}
            alt={`illustration de bloc autonome d'eclairage de securite`}
            fill={true}
            className="object-cover cursor-pointer"
            quality={100}
          />
        </div>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbBaes" className="text-sm">
            Nombre de BAES
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={nbBaes || ""}
              min={1}
              max={MAX_NB_BAES}
              step={1}
              onChange={(e) => handleChangeNbr(e, "baes")}
              className={`w-16 ${
                incendie.quantites.nbBaes ===
                Math.ceil(incendieQuantite.nbExtincteurs * 2.3)
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbBaes"
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de BAES"
              onClick={() => handleDecrement("baes")}
              disabled={nbBaes === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de BAES"
              onClick={() => handleIncrement("baes")}
              disabled={nbBaes === MAX_NB_BAES}
            >
              <Plus />
            </Button>
          </div>
          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez votre nombre de <strong>télécommandes BAES</strong> :
        </p>
        <div className="w-24 h-16 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
          <Image
            src={"/img/services/tel_baes.webp"}
            alt={`illustration de télécommande de bloc autonome d'eclairage de securite`}
            fill={true}
            className="object-cover cursor-pointer"
            quality={100}
          />
        </div>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbTelBaes" className="text-sm">
            Nombre de télécommandes
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={nbTelBaes || ""}
              min={1}
              max={MAX_NB_TEL_BAES}
              step={1}
              onChange={(e) => handleChangeNbr(e, "telBaes")}
              className={`w-16 ${
                incendie.quantites.nbTelBaes === 1
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbTelBaes"
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de télécommandes BAES"
              onClick={() => handleDecrement("telBaes")}
              disabled={nbBaes === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de télécommandes BAES"
              onClick={() => handleIncrement("telBaes")}
              disabled={nbBaes === MAX_NB_TEL_BAES}
            >
              <Plus />
            </Button>
          </div>

          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecuriteIncendieMobileInputs;
