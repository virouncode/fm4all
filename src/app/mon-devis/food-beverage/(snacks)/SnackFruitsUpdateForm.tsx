"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientContext } from "@/context/ClientProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { SelectBoissonsQuantitesType } from "@/zod-schemas/boissonsQuantites";
import { SelectBoissonsTarifsType } from "@/zod-schemas/boissonsTarifs";
import { SelectFoodLivraisonTarifsType } from "@/zod-schemas/foodLivraisonTarifs";
import { SelectFruitsQuantitesType } from "@/zod-schemas/fruitsQuantites";
import { SelectFruitsTarifsType } from "@/zod-schemas/fruitsTarifs";
import { SelectSnacksQuantitesType } from "@/zod-schemas/snacksQuantites";
import { SelectSnacksTarifsType } from "@/zod-schemas/snacksTarifs";
import { useContext } from "react";

type SnacksFruitsUpdateFormProps = {
  fruitsQuantites: SelectFruitsQuantitesType[];
  fruitsTarifs: SelectFruitsTarifsType[];
  snacksQuantites: SelectSnacksQuantitesType[];
  snacksTarifs: SelectSnacksTarifsType[];
  boissonsQuantites: SelectBoissonsQuantitesType[];
  boissonsTarifs: SelectBoissonsTarifsType[];
  foodLivraisonTarifs: SelectFoodLivraisonTarifsType[];
};

const SnacksFruitsUpdateForm = ({
  fruitsQuantites,
  fruitsTarifs,
  snacksQuantites,
  snacksTarifs,
  boissonsQuantites,
  boissonsTarifs,
  foodLivraisonTarifs,
}: SnacksFruitsUpdateFormProps) => {
  const { client } = useContext(ClientContext);
  const { snacksFruits, setSnacksFruits } = useContext(SnacksFruitsContext);

  const handleChangeNbPersonnes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newNbPersonnes = value ? parseInt(value) : client.effectif ?? 0;
    setSnacksFruits((prev) => ({
      ...prev,
      nbPersonnes: newNbPersonnes,
    }));
  };
  const handleCheck = (type: "fruits" | "snacks" | "boissons") => {
    setSnacksFruits((prev) => ({
      ...prev,
      choix: prev.choix.includes(type)
        ? prev.choix.filter((c) => c !== type)
        : [...prev.choix, type],
    }));
  };
  return (
    <form className="w-2/3 flex items-center gap-8">
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.choix.includes("fruits")}
            onCheckedChange={() => handleCheck("fruits")}
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            id="fruits"
          />
          <Label htmlFor={`fruits`} className="text-sm">
            Fruits
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.choix.includes("snacks")}
            onCheckedChange={() => handleCheck("snacks")}
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            id="snacks"
          />
          <Label htmlFor={`snacks`} className="text-sm">
            Snacks
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.choix.includes("boissons")}
            onCheckedChange={() => handleCheck("boissons")}
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            id="boissons"
          />
          <Label htmlFor={`boissons`} className="text-sm">
            Boissons
          </Label>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Input
          className={`w-full max-w-xs min-w-20 ${
            snacksFruits.nbPersonnes === client.effectif
              ? "text-destructive"
              : ""
          }`}
          type="number"
          min={1}
          max={300}
          step={1}
          value={snacksFruits.nbPersonnes.toString()}
          onChange={handleChangeNbPersonnes}
          id={`nbPersonnesFood`}
        />
        <Label htmlFor={`nbPersonnesFood`} className="text-sm">
          personnes
        </Label>
      </div>
    </form>
  );
};

export default SnacksFruitsUpdateForm;
