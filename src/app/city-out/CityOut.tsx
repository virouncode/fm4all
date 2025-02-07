"use client";

import { insertClientCityOutAction } from "@/actions/insertClientCityOutAction";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { occupations } from "@/constants/occupations";
import { ClientContext } from "@/context/ClientProvider";
import { toast } from "@/hooks/use-toast";
import { insertClientSchema, InsertClientType } from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";
import { useForm } from "react-hook-form";

type CityOutProps = {
  destination?: string;
};

const CityOut = ({ destination }: CityOutProps) => {
  const { client } = useContext(ClientContext);
  const router = useRouter();
  const defaultValues: InsertClientType = {
    ...client,
  };
  const form = useForm<InsertClientType>({
    mode: "onBlur",
    resolver: zodResolver(insertClientSchema),
    defaultValues,
  });
  const { execute: executeSaveClient, isPending: isSavingClient } = useAction(
    insertClientCityOutAction,
    {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: "Succès ! 🎉",
          description: data?.message,
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erreur ! 😿",
          description: `Impossible de sauvegarder vos coordonnées: veuillez réessayer`,
        });
      },
    }
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.name, e.target.value);
  };

  const submitForm = async (data: InsertClientType) => {
    //Envoyer email à Romu
    try {
      await fetch("/api/mailgun", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "contact@fm4all.com",
          from: "contact@fm4all.com",
          subject: "Nouveau client : région en cours de développement",
          text: `<p>Un nouveau client a laissé ses coordonnées sur la page de chiffrage automatique. La matrice de chiffrage est en cours de développement pour sa région.</p><br/>
          <p>Voici ses coordonnées :</p><br/>
          <p>Entreprise : ${data.nomEntreprise}</p>
          <p>Nom du contact : ${data.nomContact}</p>
          <p>Prénom du contact : ${data.prenomContact}</p>
          <p>Poste du contact : ${data.posteContact}</p>
          <p>Email du contact : ${data.emailContact}</p>
          <p>N°Tél du contact : ${data.phoneContact}</p>
          <p>Code postal : ${data.codePostal}</p>
          <p>Ville : ${data.ville}</p>
          <p>Surface des locaux : ${data.surface}</p>
          <p>Nombre de personnes : ${data.effectif}</p>
          <p>Type de bâtiment : ${
            batiments.find(({ id }) => id === data.typeBatiment)?.description
          }</p>
          <p>Type d'occupation : ${
            occupations.find(({ id }) => id === data.typeOccupation)
              ?.description
          }</p>
          `,
        }),
      });
      //Mettre les coordonnées dans la bdd
      executeSaveClient(data);
      setTimeout(() => {
        //pour laisser le temps au toast de s'afficher
        if (destination) router.push(destination);
        else router.back();
      }, 1000);
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        toast({
          title: "Erreur ! 😿",
          variant: "destructive",
          description:
            "Impossible d'envoyer vos coordonnées à notre équipe. Veuillez réessayer.",
        });
      }
    }
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
              className="text-base min-w-28"
            >
              {isSavingClient ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Envoyer mes coordonnées"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CityOut;
