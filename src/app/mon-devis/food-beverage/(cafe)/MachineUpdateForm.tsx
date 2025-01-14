"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import RadioGroupWithLabel from "@/components/formInputs/RadioGroupWithLabel";
import { SelectWithLabel } from "@/components/formInputs/SelectWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { locationCafeMachine } from "@/constants/locationsDistribHygiene";
import { typesBoissons, TypesBoissonsType } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { cafeMachineFormSchema, CafeMachineFormType } from "@/zod-schemas/cafe";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext } from "react";
import { useForm } from "react-hook-form";

type MachineFormProps = {
  machineId: number;
};

const MachineUpdateForm = ({ machineId }: MachineFormProps) => {
  const { cafe, setCafe } = useContext(CafeContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const machine = cafe.machines.find((item) => item.machineId === machineId);

  const defaultValues: CafeMachineFormType = {
    machineId: machine?.machineId || 0,
    dureeLocation: machine?.dureeLocation ?? "pa12M",
    nbPersonnes: machine?.nbPersonnes.toString() ?? "0",
    typeBoissons: machine?.typeBoissons ?? "cafe",
    nbMachines: 0,
  };
  const form = useForm<CafeMachineFormType>({
    mode: "onBlur",
    resolver: zodResolver(cafeMachineFormSchema),
    defaultValues,
  });

  const handleClickRemove = () => {
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.filter(
        (item) => item.machineId !== machine?.machineId
      ),
    }));
    setTotalCafe((prev) => ({
      ...prev,
      prixCafeMachines: prev.prixCafeMachines.filter(
        (item) => item.machineId !== machine?.machineId
      ),
    }));
  };

  const handleChangeTypeBoissons = (value: string) => {
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine?.machineId
          ? {
              ...item,
              typeBoissons: value as TypesBoissonsType,
            }
          : item
      ),
    }));
  };

  const handleChangeEffectif = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine?.machineId
          ? {
              ...item,
              nbPersonnes: parseInt(value),
            }
          : item
      ),
    }));
  };

  const handleSelectDureeLocation = (value: string) => {
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine?.machineId
          ? {
              ...item,
              dureeLocation: value as DureeLocationCafeType,
            }
          : item
      ),
    }));
  };

  const handleClikPreviousMachine = () => {
    setCafe((prev) => ({
      ...prev,
      currentMachineId:
        prev.machines[
          prev.machines.findIndex((item) => item.machineId === machineId) - 1
        ].machineId,
    }));
  };

  return (
    <div className="w-full flex justify-between items-start">
      <Form {...form}>
        <form className="flex-1 flex justify-between">
          <div className="flex gap-8 flex-1">
            <RadioGroupWithLabel<CafeMachineFormType>
              fieldTitle="Type de boissons*"
              nameInSchema="typeBoissons"
              data={typesBoissons}
              className="flex flex-row gap-4"
              handleChange={handleChangeTypeBoissons}
            />
            <InputWithLabel<CafeMachineFormType>
              fieldTitle="Nombre de personnes*"
              nameInSchema="nbPersonnes"
              type="number"
              pattern="^[1-9]\d*$"
              min={1}
              max={300}
              step={1}
              className="w-20"
              handleChange={handleChangeEffectif}
            />
            <SelectWithLabel<CafeMachineFormType>
              fieldTitle="Durée d'engagement*"
              nameInSchema="dureeLocation"
              data={locationCafeMachine}
              handleSelect={handleSelectDureeLocation}
            />
          </div>
        </form>
      </Form>
      <div className="flex items-center gap-4">
        {cafe.machines.map(({ machineId }) => machineId)[0] !== machineId && (
          <Button
            variant="outline"
            size="lg"
            title="Machine précédente"
            type="button"
            onClick={handleClikPreviousMachine}
          >
            Machine(s) précédente(s) ↑
          </Button>
        )}
        <Button
          variant="destructive"
          size="lg"
          title="Retirer"
          onClick={handleClickRemove}
          type="button"
        >
          Retirer
        </Button>
      </div>
    </div>
  );
};

export default MachineUpdateForm;
