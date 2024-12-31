"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { SelectWithLabel } from "@/components/formInputs/SelectWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { departements } from "@/constants/departements";
import { occupations } from "@/constants/occupations";
import {
  DevisDataContext,
  FirstCompanyInfoType,
  firstInfoSchema,
} from "@/context/DevisDataProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { useClientOnly } from "@/hooks/use-client-only";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import CityOut from "./CityOut";
import ServicesLoader from "./ServicesLoader";

const MesLocaux = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { devisData, setDevisData } = useContext(DevisDataContext);
  const [loadingServices, setLoadingServices] = useState(false);
  useClientOnly();
  const [cityError, setCityError] = useState(false);
  const [cityOut, setCityOut] = useState(false);

  const defaultValues: FirstCompanyInfoType = {
    codePostal: devisData.firstCompanyInfo.codePostal ?? "",
    surface: devisData.firstCompanyInfo.surface ?? "",
    effectif: devisData.firstCompanyInfo.effectif ?? "",
    typeBatiment: devisData.firstCompanyInfo.typeBatiment ?? "",
    typeOccupation: devisData.firstCompanyInfo.typeOccupation ?? "",
  };
  const form = useForm<FirstCompanyInfoType>({
    mode: "onBlur",
    resolver: zodResolver(firstInfoSchema),
    defaultValues,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDevisData((prev) => ({
      ...prev,
      firstCompanyInfo: { ...prev.firstCompanyInfo, [name]: value },
    }));
  };

  const handleSelect = (value: string, name: string) => {
    setDevisData((prev) => ({
      ...prev,
      firstCompanyInfo: { ...prev.firstCompanyInfo, [name]: value },
    }));
  };

  const submitForm = async (data: FirstCompanyInfoType) => {
    if (
      !departements.find(({ id }) => id === data.codePostal.substring(0, 2))
    ) {
      setCityOut(true);
      return;
    }
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${data.codePostal}`
      );
      const cityData = await response.json();
      if (cityData.length === 0) {
        setCityError(true);
        return;
      }
    } catch (err) {
      console.log(err);
    }
    setDevisProgress({ currentStep: 2, completedSteps: [1] });
    setLoadingServices(true);
    console.log(data);
  };

  if (cityError) {
    return (
      <div className="text-lg mx-auto max-w-prose mt-10 text-center">
        Le code postal que vous avez entré ne correspond à aucune ville.
        <br />
        <div
          className="underline cursor-pointer"
          onClick={() => {
            setCityError(false);
          }}
        >
          Veuillez vérifier et réessayer
        </div>
        .
      </div>
    );
  }

  if (cityOut) {
    return <CityOut />;
  }

  if (loadingServices) {
    return <ServicesLoader />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitForm)}
        className="flex flex-col gap-14 mx-auto w-full md:w-2/3 mt-20"
      >
        <div className="flex gap-8">
          <div className="flex-1 flex flex-col gap-4">
            <InputWithLabel<FirstCompanyInfoType>
              fieldTitle="Code postal*"
              nameInSchema="codePostal"
              placeholder="XXXXX"
              handleChange={handleChange}
              // className="text-base py-6 w-full max-w-none"
            />
            <InputWithLabel<FirstCompanyInfoType>
              fieldTitle="Surface en m²*"
              nameInSchema="surface"
              handleChange={handleChange}
              placeholder=""
              // className="text-base py-6 w-full max-w-none"
            />
            <InputWithLabel<FirstCompanyInfoType>
              fieldTitle="Nombre moyen de personnes*"
              nameInSchema="effectif"
              handleChange={handleChange}
              placeholder=""
              // className="text-base py-6 w-full max-w-none"
            />
          </div>
          <div className="flex-1 flex flex-col gap-4 ">
            <SelectWithLabel<FirstCompanyInfoType>
              fieldTitle="Type de bâtiment*"
              nameInSchema="typeBatiment"
              data={batiments}
              handleSelect={handleSelect}
              // className="text-base py-6 w-full max-w-none"/>
            />
            <SelectWithLabel<FirstCompanyInfoType>
              fieldTitle="Type d'occupation*"
              nameInSchema="typeOccupation"
              data={occupations}
              handleSelect={handleSelect}
              // className="text-base py-6 w-full max-w-none"/>
            />
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            variant="destructive"
            size="lg"
            title="Afficher les tarifs"
            className="text-base"
          >
            Afficher les tarifs
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default MesLocaux;
