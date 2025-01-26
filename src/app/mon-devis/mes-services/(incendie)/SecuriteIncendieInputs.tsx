import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IncendieContext } from "@/context/IncendieProvider";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { useContext } from "react";

type SecuriteIncendieInputsProps = {
  nbExtincteurs: number;
  nbBaes: number;
  nbTelBaes: number;
  handleChangeNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "extincteur" | "baes" | "telBaes"
  ) => void;
  incendieQuantite: SelectIncendieQuantitesType;
};

const SecuriteIncendieInputs = ({
  nbExtincteurs,
  nbBaes,
  nbTelBaes,
  handleChangeNbr,
  incendieQuantite,
}: SecuriteIncendieInputsProps) => {
  const { incendie } = useContext(IncendieContext);
  return (
    <div className="flex flex-col gap-6 w-3/4">
      <div className="flex gap-4 items-center  w-full">
        <Input
          type="number"
          value={nbExtincteurs}
          min={1}
          max={100}
          step={1}
          onChange={(e) => handleChangeNbr(e, "extincteur")}
          className={`w-16 ${
            incendie.quantites.nbExtincteurs === incendieQuantite.nbExtincteurs
              ? "text-destructive"
              : ""
          }`}
        />
        <Label htmlFor="nbExtincteurs" className="text-sm flex-1">
          extincteur(s)
        </Label>
      </div>

      <div className="flex gap-4 items-center w-full">
        <Input
          type="number"
          value={nbBaes}
          min={1}
          max={100}
          step={1}
          onChange={(e) => handleChangeNbr(e, "baes")}
          className={`w-16 ${
            incendie.quantites.nbBaes ===
            Math.ceil(incendieQuantite.nbExtincteurs * 2.3)
              ? "text-destructive"
              : ""
          }`}
        />
        <Label htmlFor="nbBaes" className="text-sm flex-1">
          BAES
        </Label>
      </div>

      <div className="flex gap-4 items-center w-full">
        <Input
          type="number"
          value={nbTelBaes}
          min={1}
          max={10}
          step={1}
          onChange={(e) => handleChangeNbr(e, "telBaes")}
          className={`w-16 ${
            incendie.quantites.nbTelBaes === 1 ? "text-destructive" : ""
          }`}
        />
        <Label htmlFor="nbTelBaes" className="text-sm flex-1">
          télécommande(s) BAES
        </Label>
      </div>
    </div>
  );
};

export default SecuriteIncendieInputs;
