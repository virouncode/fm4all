import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientContext } from "@/context/ClientProvider";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useContext } from "react";
import { MAX_EFFECTIF } from "../../../locaux/MesLocaux";

type TheMobileInputsProps = {
  nbPersonnes: number;
  handleChangeNbPersonnes: (e: ChangeEvent<HTMLInputElement>) => void;
  handleIncrement: () => void;
  handleDecrement: () => void;
};

const TheMobileInputs = ({
  nbPersonnes,
  handleChangeNbPersonnes,
  handleIncrement,
  handleDecrement,
}: TheMobileInputsProps) => {
  const { client } = useContext(ClientContext);
  const effectif = client.effectif ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <p>
        Indiquez le <strong>nombre de personnes</strong> consommant du thé
        :{" "}
      </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDistribEmp" className="text-sm flex-1">
          Nombre de personnes
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nbPersonnes}
            min={1}
            max={MAX_EFFECTIF}
            step={1}
            onChange={handleChangeNbPersonnes}
            className={`w-16 ${
              nbPersonnes === Math.round(effectif * 0.15)
                ? "text-fm4alldestructive"
                : ""
            }`}
          />
          <Button
            variant="outline"
            title="Diminuer le nombre de personnes"
            onClick={handleDecrement}
            disabled={nbPersonnes === 0}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title="Augmenter le nombre de personnes"
            onClick={handleIncrement}
            disabled={nbPersonnes === MAX_EFFECTIF}
          >
            <Plus />
          </Button>
        </div>
        <p className="text-xs italic text-fm4alldestructive">
          Les quantités sont estimées pour vous (environ 15% de votre effectif)
          mais vous pouvez les changer
        </p>
      </div>
    </div>
  );
};

export default TheMobileInputs;
