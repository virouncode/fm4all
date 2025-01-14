"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { SelectWithLabel } from "@/components/formInputs/SelectWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { departements } from "@/constants/departements";
import { occupations } from "@/constants/occupations";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { useToast } from "@/hooks/use-toast";
import { roundEffectif } from "@/lib/roundEffectif";
import { roundSurface } from "@/lib/roundSurface";
import { insertClientSchema, InsertClientType } from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const MesLocaux = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { setServices } = useContext(ServicesContext);
  const { client, setClient } = useContext(ClientContext);
  const { setNettoyage } = useContext(NettoyageContext);
  const { setHygiene } = useContext(HygieneContext);
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: Partial<InsertClientType> = {
    codePostal: client.codePostal,
    surface: client.surface,
    effectif: client.effectif,
    typeBatiment: client.typeBatiment,
    typeOccupation: client.typeOccupation,
  };
  const partialClientSchema = insertClientSchema.partial().extend({
    surface: z
      .string()
      .min(1, "Surface obligatoire")
      .transform((value) => parseInt(value, 10)),
    effectif: z
      .string()
      .min(1, "Effectif obligatoire")
      .transform((value) => parseInt(value, 10)),
  });

  const form = useForm<Partial<InsertClientType>>({
    mode: "onBlur",
    resolver: zodResolver(partialClientSchema),
    defaultValues,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    let value: string | number = e.target.value;
    if (name === "surface" || name === "effectif") value = parseInt(value);
    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelect = (value: string, name: string) => {
    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitForm = async (data: Partial<InsertClientType>) => {
    if (
      !departements.find(({ id }) => id === data.codePostal?.substring(0, 2))
    ) {
      setDevisProgress({ ...devisProgress, completedSteps: [] });
      router.push("/city-out");
      return;
    }

    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${data.codePostal}`
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
    setHygiene({
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
      currentServiceId: 1,
    });
    router.push(
      `/mon-devis/mes-services?surface=${roundSurface(
        data.surface as number
      )}&effectif=${roundEffectif(data.effectif as number)}`
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
              handleChange={handleChange}
            />
            <InputWithLabel<InsertClientType>
              fieldTitle="Surface en m²*"
              nameInSchema="surface"
              handleChange={handleChange}
              placeholder=""
            />
            <InputWithLabel<InsertClientType>
              fieldTitle="Nombre moyen de personnes*"
              nameInSchema="effectif"
              handleChange={handleChange}
              placeholder=""
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
