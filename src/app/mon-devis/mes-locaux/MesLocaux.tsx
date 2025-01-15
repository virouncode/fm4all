"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { SelectWithLabel } from "@/components/formInputs/SelectWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { departements } from "@/constants/departements";
import { occupations } from "@/constants/occupations";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { useToast } from "@/hooks/use-toast";
import { roundEffectif } from "@/lib/roundEffectif";
import { roundSurface } from "@/lib/roundSurface";
import {
  InsertClientFormType,
  insertClientSchema,
  InsertClientType,
} from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { reinitialisationDevis } from "./reinitialisationDevis";

const MesLocaux = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { setServices } = useContext(ServicesContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { client, setClient } = useContext(ClientContext);
  const { setNettoyage } = useContext(NettoyageContext);
  const { setHygiene } = useContext(HygieneContext);
  const { setCafe } = useContext(CafeContext);
  const { setThe } = useContext(TheContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
  const { setTotalIncendie } = useContext(TotalIncendieContext);
  const { setTotalMaintenance } = useContext(TotalMaintenanceContext);
  const { setTotalCafe } = useContext(TotalCafeContext);

  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: Partial<InsertClientFormType> = {
    codePostal: client.codePostal,
    surface: client.surface?.toString(),
    effectif: client.effectif?.toString(),
    typeBatiment: client.typeBatiment,
    typeOccupation: client.typeOccupation,
  };
  const partialClientSchema = insertClientSchema.partial().extend({
    surface: z
      .string()
      .refine(
        (value) =>
          /^\d+$/.test(value) &&
          parseInt(value, 10) >= 50 &&
          parseInt(value, 10) <= 3000,
        "La surface doit être un nombre compris entre 50 et 3000 m²"
      ),
    effectif: z
      .string()
      .refine(
        (value) =>
          /^\d+$/.test(value) &&
          parseInt(value, 10) >= 1 &&
          parseInt(value, 10) <= 300,
        "Le nombre de personnes doit être compris entre 1 et 300"
      ),
  });

  const form = useForm<Partial<InsertClientFormType>>({
    mode: "onBlur",
    resolver: zodResolver(partialClientSchema),
    defaultValues,
  });

  const handleSelect = (value: string, name: string) => {
    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitForm = async (data: Partial<InsertClientFormType>) => {
    const dataToPost = {
      ...data,
      surface: roundSurface(parseInt(data.surface as string)),
      effectif: roundEffectif(parseInt(data.effectif as string)),
    };
    //Departement in ou out
    if (
      !departements.find(
        ({ id }) => id === dataToPost.codePostal?.substring(0, 2)
      )
    ) {
      setDevisProgress({ ...devisProgress, completedSteps: [] });
      router.push("/city-out");
      return;
    }
    //La ville existe ?
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${dataToPost.codePostal}`
      );
      const cityData = await response.json();
      if (cityData.length === 0) {
        setDevisProgress({ ...devisProgress, completedSteps: [] });
        toast({
          variant: "destructive",
          title: "Code postal invalide",
          description:
            "Le code postal ne correspond à aucune ville, veullez réessayer",
        });
        return;
      }
    } catch (err) {
      console.log(err);
    }
    //Update client
    setClient(dataToPost);
    //Réinitialisation de tous le devis
    reinitialisationDevis(
      //client
      client,
      //services
      setDevisProgress,
      setNettoyage,
      setHygiene,
      setCafe,
      setThe,
      //navigation
      setServices,
      setFoodBeverage,
      //Total
      setTotalNettoyage,
      setTotalHygiene,
      setTotalIncendie,
      setTotalMaintenance,
      setTotalCafe
    );
    //Passer à l'étape suivante
    router.push(
      `/mon-devis/mes-services?effectif=${dataToPost.effectif}&surface=${dataToPost.surface}`
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitForm)}
        className="flex flex-col gap-14 mx-auto w-full md:w-2/3 mt-6 md:mt-10"
      >
        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <InputWithLabel<InsertClientType>
              fieldTitle="Code postal*"
              nameInSchema="codePostal"
              placeholder="XXXXX"
            />
            <InputWithLabel<InsertClientType>
              fieldTitle="Surface en m²*"
              nameInSchema="surface"
              type="number"
              min={50}
              max={3000}
            />
            <InputWithLabel<InsertClientType>
              fieldTitle="Nombre moyen de personnes*"
              nameInSchema="effectif"
              type="number"
              min={1}
              max={300}
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 ">
            <SelectWithLabel<InsertClientType>
              fieldTitle="Type de bâtiment*"
              nameInSchema="typeBatiment"
              data={batiments}
              handleSelect={handleSelect}
            />
            <SelectWithLabel<InsertClientType>
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
