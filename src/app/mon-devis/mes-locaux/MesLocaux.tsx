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
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext, useEffect, useState } from "react";
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
  const router = useRouter();

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

  useEffect(() => {
    setDevisProgress((prev) => ({ ...prev, currentStep: 1 }));
  }, [setDevisProgress]);

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
      setDevisProgress({ ...devisProgress, completedSteps: [] });
      return;
    }
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${data.codePostal}`
      );
      const cityData = await response.json();
      if (cityData.length === 0) {
        setDevisProgress({ ...devisProgress, completedSteps: [] });
        setCityError(true);
        return;
      }
    } catch (err) {
      console.log(err);
    }
    setDevisProgress({ currentStep: 2, completedSteps: [1] });
    setDevisData((prev) => ({
      ...prev,
      services: {
        selectedServicesIds: [],
        nettoyage: {
          nettoyageFournisseurId: null,
          nettoyagePropositionId: null,
          repassePropositionId: null,
          samediPropositionId: null,
          dimanchePropositionId: null,
          vitreriePropositionId: null,
          nbPassageVitrerie: 2,
          propreteFournisseurId: null,
          trilogieGammeSelected: null,
          nbDistribEmp: 0,
          nbDistribSavon: 0,
          nbDistribPh: 0,
          nbDistribDesinfectant: 0,
          nbDistribParfum: 0,
          nbDistribBalai: 0,
          nbDistribPoubelle: 0,
          dureeLocation: "pa36M",
          desinfectantGammeSelected: null,
          parfumGammeSelected: null,
          balaiGammeSelected: null,
          poubelleGammeSelected: null,
        },
      },
    }));
    setLoadingServices(true);
    setTimeout(() => {
      router.push("/mon-devis/mes-services");
    }, 5000);

    console.log(data);
  };

  if (cityError) {
    return (
      <div className="text-base md:text-lg mx-auto max-w-prose mt-6 md:mt-10 text-center">
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
        className="flex flex-col gap-14 mx-auto w-full md:w-2/3 mt-6 md:mt-20"
      >
        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <InputWithLabel<FirstCompanyInfoType>
              fieldTitle="Code postal*"
              nameInSchema="codePostal"
              placeholder="XXXXX"
              handleChange={handleChange}
            />
            <InputWithLabel<FirstCompanyInfoType>
              fieldTitle="Surface en m²*"
              nameInSchema="surface"
              handleChange={handleChange}
              placeholder=""
            />
            <InputWithLabel<FirstCompanyInfoType>
              fieldTitle="Nombre moyen de personnes*"
              nameInSchema="effectif"
              handleChange={handleChange}
              placeholder=""
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 ">
            <SelectWithLabel<FirstCompanyInfoType>
              fieldTitle="Type de bâtiment*"
              nameInSchema="typeBatiment"
              data={batiments}
              handleSelect={handleSelect}
            />
            <SelectWithLabel<FirstCompanyInfoType>
              fieldTitle="Type d'occupation*"
              nameInSchema="typeOccupation"
              data={occupations}
              handleSelect={handleSelect}
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
