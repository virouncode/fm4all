"use client";

import { DateInputWithLabel } from "@/components/formInputs/DateInputWithLabel";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { TextAreaWithLabel } from "@/components/formInputs/TextAreaWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { departements } from "@/constants/departements";
import { ClientContext } from "@/context/ClientProvider";
import { MonDevisContext } from "@/context/MonDevisProvider";
import useScrollIntoMonDevis from "@/hooks/use-scroll-into-mon-devis";
import { toast } from "@/hooks/use-toast";
import {
  InsertClientType,
  updateClientSchema,
  UpdateClientType,
} from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";
import { useForm } from "react-hook-form";

const MonDevisForm = () => {
  const { client, setClient } = useContext(ClientContext);
  const { setMonDevis } = useContext(MonDevisContext);
  const router = useRouter();
  useScrollIntoMonDevis();

  const defaultValues: UpdateClientType = {
    nomEntreprise: client.nomEntreprise ?? "",
    siret: client.siret ?? "",
    prenomContact: client.prenomContact ?? "",
    nomContact: client.nomContact ?? "",
    posteContact: client.posteContact ?? "",
    emailContact: client.emailContact ?? "",
    phoneContact: client.phoneContact ?? "",
    surface: client.surface ?? 100,
    effectif: client.effectif ?? 20,
    typeBatiment: client.typeBatiment as
      | "bureaux"
      | "localCommercial"
      | "entrepot"
      | "cabinetMedical",
    typeOccupation: client.typeOccupation as
      | "partieEtage"
      | "plateauComplet"
      | "batimentEntier",
    adresseLigne1: client.adresseLigne1 ?? "",
    adresseLigne2: client.adresseLigne2 ?? "",
    codePostal: client.codePostal ?? "",
    ville: client.ville ?? "",
    dateDeDemarrage: client.dateDeDemarrage ?? "",
    commentaires: client.commentaires ?? "",
  };
  const form = useForm<UpdateClientType>({
    mode: "onBlur",
    resolver: zodResolver(updateClientSchema),
    defaultValues,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeDate = (date: string | null) => {
    setClient((prev) => ({
      ...prev,
      dateDeDemarrage: date,
    }));
  };

  const submitForm = async (data: UpdateClientType) => {
    console.log(data);
    if (
      !departements.find(({ id }) => id === data.codePostal?.substring(0, 2))
    ) {
      router.push("/city-out");
      return;
    }
    //La ville existe ?
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${data.codePostal}`
      );
      const cityData = await response.json();

      if (cityData.length === 0) {
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
    //TODO enregistrer client dans la bdd
    setMonDevis({ currentMonDevisId: 2 });
  };

  return (
    <div
      className="flex flex-col items-center gap-4 h-full overflow-auto"
      id="1"
    >
      <p className="text-2xl font-bold">
        Félicitations {client.prenomContact} {client.nomContact} !
      </p>
      <p className="text-lg">Votre devis final est prêt</p>
      <div className="flex flex-col gap-2 items-center">
        <p>
          Il ne vous reste plus qu&apos;à le valider pour le transformer en
          contrat.
        </p>
        <p>
          Afin de donner une <strong>entête à votre devis</strong> et faciliter
          vos futures démarches, vous pouvez nous communiquer :
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="flex-1 flex flex-col gap-4 mx-auto w-full mt-6 p-4"
        >
          <div className="flex flex-col gap-10 md:flex-row md:gap-20">
            <div className="w-full md:w-1/4 flex flex-col">
              <InputWithLabel<InsertClientType>
                fieldTitle="Prénom du contact*"
                nameInSchema="prenomContact"
                name="prenomContact"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Nom du contact*"
                nameInSchema="nomContact"
                name="nomContact"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Email du contact*"
                nameInSchema="emailContact"
                type="email"
                name="emailContact"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Poste du contact*"
                nameInSchema="posteContact"
                name="phoneContact"
                handleChange={handleChange}
              />
            </div>
            <div className="w-full md:w-1/4 flex flex-col">
              <InputWithLabel<InsertClientType>
                fieldTitle="Nom de l'entreprise*"
                nameInSchema="nomEntreprise"
                name="nomEntreprise"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Siret"
                nameInSchema="siret"
                name="siret"
                handleChange={handleChange}
                placeholder="XXX XXX XXX XXXX"
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="N°de téléphone*"
                nameInSchema="phoneContact"
                placeholder="XX XX XX XX XX"
                name="phoneContact"
                handleChange={handleChange}
              />
              <DateInputWithLabel<InsertClientType>
                fieldTitle="Date de démarrage souhaitée"
                nameInSchema="dateDeDemarrage"
                handleChangeDate={handleChangeDate}
              />
            </div>

            <div className="w-full md:w-1/4 flex flex-col">
              <InputWithLabel<InsertClientType>
                fieldTitle="Addresse du site ligne 1"
                nameInSchema="adresseLigne1"
                name="addressLigne1"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Addresse du site ligne 2"
                nameInSchema="adresseLigne2"
                name="adresseLigne2"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Code postal*"
                nameInSchema="codePostal"
                name="codePostal"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle="Ville"
                nameInSchema="ville"
                name="ville"
                handleChange={handleChange}
              />
            </div>
            <div className="w-full md:w-1/4 flex flex-col gap-4">
              <TextAreaWithLabel<InsertClientType>
                fieldTitle="Commentaires"
                nameInSchema="commentaires"
                className="resize-none h-40"
                name="commentaires"
                onChange={handleChange}
              />
              <div className="w-full">
                <Button
                  variant="destructive"
                  size="lg"
                  className="text-base w-full"
                >
                  Afficher mon devis
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MonDevisForm;
