import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

type ThePropositionsInputProps = {
  nbPersonnes: number;
  effectif: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ThePropositionsInput = ({
  nbPersonnes,
  effectif,
  handleChange,
}: ThePropositionsInputProps) => {
  return (
    <div className="flex flex-col gap-6 w-full p-4">
      <div className="flex gap-4 items-center justify-center w-full">
        <Input
          type="number"
          value={nbPersonnes}
          min={1}
          max={300}
          step={1}
          onChange={handleChange}
          className={`w-16 ${
            nbPersonnes === Math.round(effectif * 0.15)
              ? "text-destructive"
              : ""
          }`}
        />
        <Label htmlFor="nbDistribEmp" className="text-sm">
          personnes
        </Label>
      </div>
      <p className="text-xs text-destructive italic px-2 text-center">
        Les quantités sont estimées pour vous (environ 15% de votre effectif)
        mais vous pouvez les changer
      </p>
    </div>
  );
};

export default ThePropositionsInput;
