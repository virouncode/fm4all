"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ClientContext } from "@/context/ClientProvider";
import { insertClientSchema, InsertClientType } from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";
import { useForm } from "react-hook-form";

type CityOutProps = {
  destination?: string;
};

const CityOut = ({ destination }: CityOutProps) => {
  const { client } = useContext(ClientContext);
  const router = useRouter();
  const defaultValues: Partial<InsertClientType> = {
    emailContact: client.emailContact ?? "",
    phoneContact: client.phoneContact ?? "",
    nomEntreprise: client.nomEntreprise ?? "",
    prenomContact: client.prenomContact ?? "",
    nomContact: client.nomContact ?? "",
    posteContact: client.posteContact ?? "",
  };
  const form = useForm<Partial<InsertClientType>>({
    mode: "onBlur",
    resolver: zodResolver(insertClientSchema.partial()),
    defaultValues,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.name, e.target.value);
  };

  const submitForm = async (data: Partial<InsertClientType>) => {
    //TODO:envoyer email à Romu
    //TODO:mettre les coordonnées dans la bdd
    console.log(data);
    if (destination) router.push(destination);
    else router.back();
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
              <InputWithLabel<InsertClientType>
                fieldTitle="Nom de l'entreprise*"
                nameInSchema="nomEntreprise"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Email du contact*"
                nameInSchema="emailContact"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="N° de téléphone*"
                nameInSchema="phoneContact"
                handleChange={handleChange}
                placeholder="XX XX XX XX XX"
              />
            </div>
            <div className="flex-1 flex flex-col gap-4 ">
              <InputWithLabel<InsertClientType>
                fieldTitle="Prénom du contact*"
                nameInSchema="prenomContact"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Nom du contact*"
                nameInSchema="nomContact"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Poste du contact*"
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
