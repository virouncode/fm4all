"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { SelectWithLabel } from "@/components/formInputs/SelectWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { departements } from "@/constants/departements";
import { occupations } from "@/constants/occupations";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const firstInfoSchema = z.object({
  codePostal: z
    .string()
    .regex(/^\d{5}$/, "Code postal invalide : 5 chiffres attendus"),
  surface: z
    .string()
    .regex(/^\d+$/, "Surface invalide : entrez un chiffre entier"),
  effectif: z
    .string()
    .regex(/^\d+$/, "Nombre de personnes invalide : entrez un chiffre entier"),
  typeBatiment: z.string().min(1, "Veuillez renseigner un type de batiment"),
  typeOccupation: z.string().min(1, "Veuillez renseigner un type d'occupation"),
});
type FirstInfoType = z.infer<typeof firstInfoSchema>;

const MesLocaux = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const defaultValues: FirstInfoType = {
    codePostal: "",
    surface: "",
    effectif: "",
    typeBatiment: "",
    typeOccupation: "",
  };
  const form = useForm<FirstInfoType>({
    mode: "onBlur",
    resolver: zodResolver(firstInfoSchema),
    defaultValues,
  });

  const submitForm = async (data: FirstInfoType) => {
    if (
      !departements.find(({ id }) => id === data.codePostal.substring(0, 2))
    ) {
      console.log("Code postal non francilien");
    }
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/commun?codePostal=${data.codePostal}`
      );
      const cityData = await response.json();
      if (cityData.length === 0) {
        console.log("Code postal invalide, la ville n'existe pas");
      }
    } catch (err) {
      console.log(err);
    }

    console.log("DATA", data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitForm)}
        className="flex flex-col gap-14 mx-auto w-full md:w-2/3 mt-20"
      >
        <div className="flex gap-8">
          <div className="flex-1 flex flex-col gap-4">
            <InputWithLabel<FirstInfoType>
              fieldTitle="Code postal*"
              nameInSchema="codePostal"
              placeholder="XXXXX"
              // className="text-base py-6 w-full max-w-none"
            />
            <InputWithLabel<FirstInfoType>
              fieldTitle="Surface en m²*"
              nameInSchema="surface"
              // className="text-base py-6 w-full max-w-none"
            />
            <InputWithLabel<FirstInfoType>
              fieldTitle="Nombre moyen de personnes*"
              nameInSchema="effectif"
              // className="text-base py-6 w-full max-w-none"
            />
          </div>
          <div className="flex-1 flex flex-col gap-4 ">
            <SelectWithLabel<FirstInfoType>
              fieldTitle="Type de bâtiment*"
              nameInSchema="typeBatiment"
              data={batiments}
              // className="text-base py-6 w-full max-w-none"/>
            />
            <SelectWithLabel<FirstInfoType>
              fieldTitle="Type d'occupation*"
              nameInSchema="typeOccupation"
              data={occupations}
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
