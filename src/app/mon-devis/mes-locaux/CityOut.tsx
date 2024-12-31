"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DevisDataContext } from "@/context/DevisDataProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const contactSchema = z.object({
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro invalide : 10 chiffres attendus"),
  nomEntreprise: z.string().min(1, "Le nom de l'entreprise est obligatoire"),
  prenom: z.string().min(1, "Le prénom est obligatoire"),
  nom: z.string().min(1, "Le nom est obligatoire"),
  poste: z.string(),
});

type ContactType = z.infer<typeof contactSchema>;

const CityOut = () => {
  const { devisData, setDevisData } = useContext(DevisDataContext);
  const defaultValues = {
    email: "",
    phone: "",
    nomEntreprise: "",
    prenom: "",
    nom: "",
    poste: "",
  };
  const form = useForm<ContactType>({
    mode: "onBlur",
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.name, e.target.value);
  };

  const submitForm = async (data: ContactType) => {
    //TODO:envoyer email
    console.log(data);
  };

  return (
    <div className="flex flex-col gap-10 mt-6">
      <p className="w-full max-w-prose mx-auto text-base md:text-lg hyphens-auto text-wrap">
        Notre matrice de chiffrage automatique est en cours de développement
        pour votre région. Cependant, vous pouvez être contacté pour un devis
        sur mesure ou être averti dès que l&apos;automatisation sera disponible
        dans votre région. Laissez nous vos coordonnées ici :
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="flex flex-col gap-10 mx-auto w-full md:w-2/3"
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="flex-1 flex flex-col gap-4">
              <InputWithLabel<ContactType>
                fieldTitle="Nom de l'entreprise*"
                nameInSchema="nomEntreprise"
                handleChange={handleChange}
                placeholder=""
                // className="text-base py-6 w-full max-w-none"
              />
              <InputWithLabel<ContactType>
                fieldTitle="Email*"
                nameInSchema="email"
                handleChange={handleChange}
                // className="text-base py-6 w-full max-w-none"
              />
              <InputWithLabel<ContactType>
                fieldTitle="N° de téléphone*"
                nameInSchema="phone"
                handleChange={handleChange}
                placeholder="10 chiffres sans espaces ni tirets"
                // className="text-base py-6 w-full max-w-none"
              />
            </div>
            <div className="flex-1 flex flex-col gap-4 ">
              <InputWithLabel<ContactType>
                fieldTitle="Prénom*"
                nameInSchema="prenom"
                handleChange={handleChange}
                // className="text-base py-6 w-full max-w-none"
              />
              <InputWithLabel<ContactType>
                fieldTitle="Nom*"
                nameInSchema="nom"
                handleChange={handleChange}
                // className="text-base py-6 w-full max-w-none"
              />
              <InputWithLabel<ContactType>
                fieldTitle="Poste"
                nameInSchema="poste"
                handleChange={handleChange}
                // className="text-base py-6 w-full max-w-none"
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
