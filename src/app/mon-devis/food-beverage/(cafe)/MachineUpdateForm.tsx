"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locationCafeMachine } from "@/constants/locationsDistribHygiene";
import { typesBoissons, TypesBoissonsType } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { CafeMachineType } from "@/zod-schemas/cafe";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";

type MachineFormProps = {
  machine: CafeMachineType;
};

const MachineUpdateForm = ({ machine }: MachineFormProps) => {
  const { client } = useContext(ClientContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const cafeMachinesIds = cafe.machines.map((item) => item.machineId);
  const router = useRouter();

  const handleChangeTypeBoissons = (value: string) => {
    if (cafeMachinesIds[0] === machine.machineId) {
      setCafe((prev) => ({
        ...prev,
        cafeFournisseurId: null,
        machines: prev.machines.map((item) =>
          item.machineId === machine?.machineId
            ? {
                ...item,
                typeBoissons: value as TypesBoissonsType,
                propositionId: null,
              }
            : { ...item, propositionId: null }
        ),
      }));
      setThe((prev) => ({
        ...prev,
        theGammeSelected: null,
      }));
      setTotalCafe((prev) => ({
        ...prev,
        nomFournisseur: null,
        prixCafeMachines: prev.prixCafeMachines.map((item) => ({
          ...item,
          prix: null,
          marque: "",
          modele: "",
          reconditionnne: false,
        })),
        prixThe: null,
      }));
      router.push(`/mon-devis/food-beverage?effectif=${client.effectif}`);
      return;
    }
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine?.machineId
          ? {
              ...item,
              typeBoissons: value as TypesBoissonsType,
              propositionId: null,
            }
          : item
      ),
    }));
    setTotalCafe((prev) => ({
      ...prev,
      prixCafeMachines: prev.prixCafeMachines.map((item) =>
        item.machineId === machine.machineId
          ? {
              ...item,
              prix: null,
              marque: "",
              modele: "",
              reconditionnne: false,
            }
          : item
      ),
    }));
  };

  const handleChangeEffectif = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newNbPersonnes = value ? parseInt(value) : client.effectif ?? 0;
    if (cafeMachinesIds[0] === machine.machineId) {
      setCafe((prev) => ({
        ...prev,
        cafeFournisseurId: null,
        machines: prev.machines.map((item) =>
          item.machineId === machine?.machineId
            ? {
                ...item,
                nbPersonnes: newNbPersonnes,
                propositionId: null,
              }
            : { ...item, propositionId: null }
        ),
      }));
      setThe((prev) => ({
        ...prev,
        theGammeSelected: null,
      }));
      setTotalCafe((prev) => ({
        ...prev,
        nomFournisseur: null,
        prixCafeMachines: prev.prixCafeMachines.map((item) => ({
          ...item,
          prix: null,
          marque: "",
          modele: "",
          reconditionnne: false,
        })),
        prixThe: null,
      }));
      router.push(`/mon-devis/food-beverage?effectif=${client.effectif}`); //ne pas mettre newNbPersonnes
      return;
    }
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine?.machineId
          ? {
              ...item,
              nbPersonnes: newNbPersonnes,
              propositionId: null,
            }
          : item
      ),
    }));
    setTotalCafe((prev) => ({
      ...prev,
      prixCafeMachines: prev.prixCafeMachines.map((item) =>
        item.machineId === machine.machineId
          ? {
              ...item,
              prix: null,
              marque: "",
              modele: "",
              reconditionnne: false,
            }
          : item
      ),
    }));
  };

  const handleSelectDureeLocation = (value: string) => {
    if (cafeMachinesIds[0] === machine.machineId) {
      setCafe((prev) => ({
        ...prev,
        cafeFournisseurId: null,
        machines: prev.machines.map((item) =>
          item.machineId === machine?.machineId
            ? {
                ...item,
                dureeLocation: value as DureeLocationCafeType,
                propositionId: null,
              }
            : { ...item, propositionId: null }
        ),
      }));
      setThe((prev) => ({
        ...prev,
        theGammeSelected: null,
      }));
      setTotalCafe((prev) => ({
        ...prev,
        nomFournisseur: null,
        prixCafeMachines: prev.prixCafeMachines.map((item) => ({
          ...item,
          prix: null,
          marque: "",
          modele: "",
          reconditionnne: false,
        })),
        prixThe: null,
      }));
      router.push(`/mon-devis/food-beverage?effectif=${client.effectif}`);
      return;
    }
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine?.machineId
          ? {
              ...item,
              dureeLocation: value as DureeLocationCafeType,
              propositionId: null,
            }
          : item
      ),
    }));
    setTotalCafe((prev) => ({
      ...prev,
      prixCafeMachines: prev.prixCafeMachines.map((item) =>
        item.machineId === machine.machineId
          ? {
              ...item,
              prix: null,
              marque: "",
              modele: "",
              reconditionnne: false,
            }
          : item
      ),
    }));
  };

  return (
    <form className="w-2/3">
      <div className="flex gap-8 items-center mb-6">
        <div>
          <RadioGroup
            onValueChange={handleChangeTypeBoissons}
            value={machine.typeBoissons}
            className="flex gap-4 items-center"
            name="typeBoissons"
          >
            {typesBoissons.map(({ id, description }) => (
              <div key={id} className="flex gap-2 items-center">
                <RadioGroupItem
                  value={id}
                  title={description}
                  id={`${id}_${machine.machineId}`}
                />
                <Label htmlFor={`${id}_${machine.machineId}`}>
                  {description}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            className={`w-full max-w-xs min-w-20 ${
              machine.nbPersonnes === client.effectif ? "text-destructive" : ""
            }`}
            type="number"
            min={1}
            max={300}
            step={1}
            value={machine.nbPersonnes}
            onChange={handleChangeEffectif}
            id={`nbPersonnes_${machine.machineId}`}
          />
          <Label
            htmlFor={`nbPersonnes_${machine.machineId}`}
            className="text-base"
          >
            personnes
          </Label>
        </div>

        <Select
          value={machine.dureeLocation}
          onValueChange={handleSelectDureeLocation}
        >
          <SelectTrigger className={`w-full max-w-xs`}>
            <SelectValue placeholder="Choisir" />
          </SelectTrigger>
          <SelectContent>
            {locationCafeMachine.map((item) => (
              <SelectItem key={`${location}_${item.id}`} value={item.id}>
                {item.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  );
};

export default MachineUpdateForm;
