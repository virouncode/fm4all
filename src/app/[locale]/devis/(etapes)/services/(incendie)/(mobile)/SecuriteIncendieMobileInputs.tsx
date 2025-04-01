import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IncendieContext } from "@/context/IncendieProvider";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("DevisPage");
  const tIncendie = useTranslations("DevisPage.services.incendie");
  const { incendie } = useContext(IncendieContext);

  return (
    <div className="flex flex-col gap-8">
      <p className="font-bold text-xl hyphens-auto">
        {tIncendie("controle-des-extincteurs-baes-telecommandes-baes")}
      </p>
      <div className="flex flex-col gap-4">
        <p>
          {tIncendie("indiquez-votre-nombre-d")}
          <strong>{tIncendie("extincteurs").toLowerCase()}</strong> :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbExtincteurs" className="text-sm">
            {tIncendie("nombre-d-extincteurs")}
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
              title={tIncendie("diminuer-le-nombre-d-extincteurs")}
              onClick={() => handleDecrement("extincteur")}
              disabled={nbExtincteurs === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title={tIncendie("augmenter-le-nombre-d-extincteurs")}
              onClick={() => handleIncrement("extincteur")}
              disabled={nbExtincteurs === MAX_NB_EXTINCTEURS}
            >
              <Plus />
            </Button>
          </div>
          <p className="text-xs italic text-fm4alldestructive">
            {t(
              "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer"
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          {tIncendie("indiquez-votre-nombre-de")}{" "}
          <strong>
            {tIncendie(
              "baes-blocs-autonomes-d-eclairage-de-securite"
            ).toLowerCase()}
          </strong>{" "}
          :
        </p>
        <div className="w-24 h-16 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
          <Image
            src={"/img/services/baes.webp"}
            alt={tIncendie(
              "illustration-de-bloc-autonome-declairage-de-securite"
            )}
            fill={true}
            className="object-cover cursor-pointer"
            quality={100}
          />
        </div>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbBaes" className="text-sm">
            {tIncendie("nombre-de-baes")}
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
              title={tIncendie("diminuer-le-nombre-de-baes")}
              onClick={() => handleDecrement("baes")}
              disabled={nbBaes === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title={tIncendie("augmenter-le-nombre-de-baes")}
              onClick={() => handleIncrement("baes")}
              disabled={nbBaes === MAX_NB_BAES}
            >
              <Plus />
            </Button>
          </div>
          <p className="text-xs italic text-fm4alldestructive">
            {t(
              "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer"
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          {tIncendie("indiquez-votre-nombre-de")}{" "}
          <strong>{tIncendie("telecommandes-baes").toLowerCase()}</strong> :
        </p>
        <div className="w-24 h-16 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
          <Image
            src={"/img/services/tel_baes.webp"}
            alt={tIncendie(
              "illustration-de-telecommande-de-bloc-autonome-declairage-de-securite"
            )}
            fill={true}
            className="object-cover cursor-pointer"
            quality={100}
          />
        </div>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbTelBaes" className="text-sm">
            {tIncendie("nombre-de-telecommandes")}
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
              title={tIncendie("diminuer-le-nombre-de-telecommandes-baes")}
              onClick={() => handleDecrement("telBaes")}
              disabled={nbTelBaes === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title={tIncendie("augmenter-le-nombre-de-telecommandes-baes")}
              onClick={() => handleIncrement("telBaes")}
              disabled={nbTelBaes === MAX_NB_TEL_BAES}
            >
              <Plus />
            </Button>
          </div>

          <p className="text-xs italic text-fm4alldestructive">
            {t(
              "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecuriteIncendieMobileInputs;
