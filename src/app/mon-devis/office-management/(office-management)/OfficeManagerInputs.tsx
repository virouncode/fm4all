import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { useContext } from "react";

type OfficeManagerInputsProps = {
  demiJParSemaineEssentiel: number | null;
  handleChangeDemiJParSemaine: (
    value: number[],
    demiTjm: number | null
  ) => void;
  demiTjm: number | null;
  handleChangeRemplace: (value: string) => void;
};

const OfficeManagerInputs = ({
  demiJParSemaineEssentiel,
  handleChangeDemiJParSemaine,
  handleChangeRemplace,
  demiTjm,
}: OfficeManagerInputsProps) => {
  const { officeManager } = useContext(OfficeManagerContext);
  return (
    <>
      <div className="flex gap-4 items-center flex-col  w-full">
        <Slider
          value={[
            (officeManager.quantites.demiJParSemaine ||
              demiJParSemaineEssentiel) ??
              1,
          ]}
          onValueChange={(value: number[]) =>
            handleChangeDemiJParSemaine(value, demiTjm)
          }
          min={1}
          max={20}
          step={1}
        />
        <Label htmlFor="demiJParSemaine" className="text-sm flex-1">
          {officeManager.quantites.demiJParSemaine || demiJParSemaineEssentiel}{" "}
          demi journée(s) / semaine
        </Label>
      </div>
      <div>
        <RadioGroup
          onValueChange={handleChangeRemplace}
          value={officeManager.infos.remplace ? "remplace" : "non remplace"}
          className="flex gap-4 flex-col items-center"
          name="typeBoissons"
        >
          <div className="flex gap-2 items-center">
            <RadioGroupItem
              value={"remplace"}
              title={"Remplacé pendant congés"}
              id={"remplace"}
            />
            <Label htmlFor={`remplace`}>Remplacé pendant congés</Label>
          </div>
          <div className="flex gap-2 items-center">
            <RadioGroupItem
              value={"non remplace"}
              title={"Non remplacé pendant congés"}
              id={"non_remplace"}
            />
            <Label htmlFor={"non_remplace"}>Non remplacé pendant congés</Label>
          </div>
        </RadioGroup>
      </div>
    </>
  );
};

export default OfficeManagerInputs;
