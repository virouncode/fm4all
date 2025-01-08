"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { companyInfoSchema, CompanyInfoType } from "@/zod-schemas/companyInfo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import { useForm } from "react-hook-form";

const CityOut = () => {
  const router = useRouter();
  const defaultValues: Partial<CompanyInfoType> = {
    email: "",
    phone: "",
    nomEntreprise: "",
    prenomContact: "",
    nomContact: "",
    posteContact: "",
  };
  const form = useForm<Partial<CompanyInfoType>>({
    mode: "onBlur",
    resolver: zodResolver(companyInfoSchema.partial()),
    defaultValues,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.name, e.target.value);
  };

  const submitForm = async (data: Partial<CompanyInfoType>) => {
    //TODO:envoyer email
    console.log(data);
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-10 mt-6">
      <div className="w-full max-w-prose mx-auto text-base md:text-lg hyphens-auto text-wrap flex flex-col gap-4">
        <p>
          Notre matrice de chiffrage automatique est en cours de développement
          pour votre région. Cependant, vous pouvez être contacté pour un devis
          sur mesure ou être averti dès que l&apos;automatisation sera
          disponible dans votre région.
        </p>
        <p className="text-center">Laissez nous vos coordonnées ici :</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="flex flex-col gap-10 mx-auto w-full md:w-2/3"
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="flex-1 flex flex-col gap-4">
              <InputWithLabel<CompanyInfoType>
                fieldTitle="Nom de l'entreprise*"
                nameInSchema="nomEntreprise"
                handleChange={handleChange}
              />
              <InputWithLabel<CompanyInfoType>
                fieldTitle="Email*"
                nameInSchema="email"
                handleChange={handleChange}
              />
              <InputWithLabel<CompanyInfoType>
                fieldTitle="N° de téléphone*"
                nameInSchema="phone"
                handleChange={handleChange}
                placeholder="XX XX XX XX XX"
              />
            </div>
            <div className="flex-1 flex flex-col gap-4 ">
              <InputWithLabel<CompanyInfoType>
                fieldTitle="Prénom*"
                nameInSchema="prenomContact"
                handleChange={handleChange}
              />
              <InputWithLabel<CompanyInfoType>
                fieldTitle="Nom*"
                nameInSchema="nomContact"
                handleChange={handleChange}
              />
              <InputWithLabel<CompanyInfoType>
                fieldTitle="Poste"
                nameInSchema="posteContact"
                handleChange={handleChange}
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
              Envoyer mes coordonnées
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CityOut;
