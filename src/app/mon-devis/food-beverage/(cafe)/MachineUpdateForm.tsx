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
import {
  cafeMachineFormSchema,
  CafeMachineFormType,
  CafeMachineType,
} from "@/zod-schemas/cafe";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext } from "react";
import { useForm } from "react-hook-form";

type MachineFormProps = {
  machine: CafeMachineType;
};

const MachineUpdateForm = ({ machine }: MachineFormProps) => {
  const { client } = useContext(ClientContext);
  const { setCafe } = useContext(CafeContext);
  const { setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);

  const handleChangeTypeBoissons = (value: string) => {
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
      })),
      prixThe: null,
    }));
  };

  const handleChangeEffectif = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newNbPersonnes = value ? parseInt(value) : client.effectif ?? 0;
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
      })),
      prixThe: null,
    }));
  };

  const handleSelectDureeLocation = (value: string) => {
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
      })),
      prixThe: null,
    }));
  };

  const defaultValues: CafeMachineFormType = {
    machineId: machine.machineId || 0,
    dureeLocation: machine.dureeLocation ?? "pa12M",
    nbPersonnes: machine.nbPersonnes.toString() || "0",
    typeBoissons: machine.typeBoissons ?? "cafe",
    nbMachines: 0,
  };

  const form = useForm<CafeMachineFormType>({
    mode: "onBlur",
    resolver: zodResolver(cafeMachineFormSchema),
    defaultValues,
  });

  // return (
  //   <Form {...form}>
  //     <form className="flex-1 mr-20">
  //       <div className="flex gap-8">
  //         <RadioGroupWithLabel<CafeMachineFormType>
  //           fieldTitle="Type de boissons*"
  //           nameInSchema="typeBoissons"
  //           data={typesBoissons}
  //           containerClassName="w-1/3"
  //           className="flex flex-row gap-4 w-1/3"
  //           handleChange={handleChangeTypeBoissons}
  //         />
  //         <InputWithLabel<CafeMachineFormType>
  //           fieldTitle="Nombre de personnes*"
  //           nameInSchema="nbPersonnes"
  //           type="number"
  //           pattern="^[1-9]\d*$"
  //           min={1}
  //           max={300}
  //           step={1}
  //           containerClassName="w-1/3"
  //           handleChange={handleChangeEffectif}
  //         />
  //         <SelectWithLabel<CafeMachineFormType>
  //           fieldTitle="Durée d'engagement*"
  //           nameInSchema="dureeLocation"
  //           data={locationCafeMachine}
  //           handleSelect={handleSelectDureeLocation}
  //           containerClassName="w-1/3"
  //         />
  //       </div>
  //     </form>
  //   </Form>
  // );
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
                <RadioGroupItem value={id} title={description} id={id} />
                <Label htmlFor={id}>{description}</Label>
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
            id="nbPersonnes"
          />
          <Label htmlFor="nbPersonnes" className="text-base">
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
