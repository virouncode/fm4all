"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { SelectWithLabel } from "@/components/formInputs/SelectWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { departements } from "@/constants/departements";
import { occupations } from "@/constants/occupations";
import { CompanyInfoContext } from "@/context/CompanyInfoProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { PropreteContext } from "@/context/PropreteProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { companyInfoSchema, CompanyInfoType } from "@/zod-schemas/companyInfo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CityOut from "./CityOut";
import ServicesLoader from "./ServicesLoader";

const MesLocaux = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { setServices } = useContext(ServicesContext);
  const { companyInfo, setCompanyInfo } = useContext(CompanyInfoContext);
  const { setNettoyage } = useContext(NettoyageContext);
  const { setProprete } = useContext(PropreteContext);
  const [loadingServices, setLoadingServices] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [cityOut, setCityOut] = useState(false);
  const router = useRouter();

  const defaultValues: Partial<CompanyInfoType> = {
    codePostal: companyInfo.codePostal,
    surface: companyInfo.surface,
    effectif: companyInfo.effectif,
    typeBatiment: companyInfo.typeBatiment,
    typeOccupation: companyInfo.typeOccupation,
  };
  const partialCompanyInfoSchema = companyInfoSchema.partial();

  const form = useForm<Partial<CompanyInfoType>>({
    mode: "onBlur",
    resolver: zodResolver(partialCompanyInfoSchema),
    defaultValues,
  });

  useEffect(() => {
    setDevisProgress((prev) => ({ ...prev, currentStep: 1 }));
  }, [setDevisProgress]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelect = (value: string, name: string) => {
    setCompanyInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitForm = async (data: Partial<CompanyInfoType>) => {
    console.log("afficher les tarifs");

    if (
      !departements.find(({ id }) => id === data.codePostal?.substring(0, 2))
    ) {
      setDevisProgress({ ...devisProgress, completedSteps: [] });
      setCityOut(true);
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
    setNettoyage({
      fournisseurId: null,
      propositionId: null,
      gammeSelected: null,
      repassePropositionId: null,
      samediPropositionId: null,
      dimanchePropositionId: null,
      vitreriePropositionId: null,
      nbPassageVitrerie: 2,
    });
    setProprete({
      fournisseurId: null,
      nbDistribEmp: 0,
      nbDistribSavon: 0,
      nbDistribPh: 0,
      nbDistribDesinfectant: 0,
      nbDistribParfum: 0,
      nbDistribBalai: 0,
      nbDistribPoubelle: 0,
      dureeLocation: "pa36M",
      trilogieGammeSelected: null,
      desinfectantGammeSelected: null,
      parfumGammeSelected: null,
      balaiGammeSelected: null,
      poubelleGammeSelected: null,
    });
    setServices({
      currentServiceId: null,
      selectedServicesIds: [],
    });
    setLoadingServices(true);
    setTimeout(() => {
      router.push("/mon-devis/mes-services");
    }, 5000);
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
            <InputWithLabel<CompanyInfoType>
              fieldTitle="Code postal*"
              nameInSchema="codePostal"
              placeholder="XXXXX"
              handleChange={handleChange}
            />
            <InputWithLabel<CompanyInfoType>
              fieldTitle="Surface en m²*"
              nameInSchema="surface"
              handleChange={handleChange}
              placeholder=""
            />
            <InputWithLabel<CompanyInfoType>
              fieldTitle="Nombre moyen de personnes*"
              nameInSchema="effectif"
              handleChange={handleChange}
              placeholder=""
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 ">
            <SelectWithLabel<CompanyInfoType>
              fieldTitle="Type de bâtiment*"
              nameInSchema="typeBatiment"
              data={batiments}
              handleSelect={handleSelect}
            />
            <SelectWithLabel<CompanyInfoType>
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
