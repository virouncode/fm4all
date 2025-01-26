"use client";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { insertClientSchema, InsertClientType } from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useForm } from "react-hook-form";

type SauvegarderProgressionProps = {
  surface: string;
  effectif: string;
  typeBatiment: "bureaux" | "localCommercial" | "entrepot" | "cabinetMedical";
  typeOccupation: "partieEtage" | "plateauComplet" | "batimentEntier";
};

const SauvegarderProgression = ({
  surface,
  effectif,
  typeBatiment,
  typeOccupation,
}: SauvegarderProgressionProps) => {
  const { setClient } = useContext(ClientContext);
  const { setDevisProgress } = useContext(DevisProgressContext);
  const router = useRouter();

  const defaultValues: InsertClientType = {
    nomEntreprise: "",
    siret: null,
    prenomContact: "",
    nomContact: "",
    posteContact: "",
    emailContact: "",
    phoneContact: "",
    adresseLigne1: null,
    adresseLigne2: null,
    codePostal: null,
    ville: null,
    surface: parseInt(surface),
    effectif: parseInt(effectif),
    typeBatiment,
    typeOccupation,
  };
  const form = useForm<InsertClientType>({
    mode: "onBlur",
    resolver: zodResolver(insertClientSchema),
    defaultValues,
  });

  const submitForm = (data: InsertClientType) => {
    console.log("ok data", data);
    //TODO Server action pour insérer le client dans la db
    setDevisProgress({ currentStep: 6, completedSteps: [1, 2, 3, 4, 5] });
    setClient(data);
    router.push("/mon-devis/personnaliser-mon-devis");
  };

  return (
    <section className="flex-1 overflow-scroll">
      <div className="flex flex-col gap-4 w-full mx-auto h-full py-2">
        <p className="w-full md:w-2/3 mx-auto">
          Dans la prochaine étape, vous allez personnaliser vos services et
          choisir des options avant de valider votre budget final. Afin
          d’améliorer votre expérience et enregistrer votre progression, merci
          de compléter les informations suivantes :
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitForm)}
            className="flex flex-col gap-8 mx-auto w-full md:w-2/3 mt-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:gap-8">
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <InputWithLabel<InsertClientType>
                  fieldTitle="Email*"
                  nameInSchema="emailContact"
                  type="email"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle="N°de téléphone*"
                  nameInSchema="phoneContact"
                  placeholder="XX XX XX XX XX"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle="Nom de l'entreprise*"
                  nameInSchema="nomEntreprise"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-4 ">
                <InputWithLabel<InsertClientType>
                  fieldTitle="Prénom du contact*"
                  nameInSchema="prenomContact"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle="Nom du contact*"
                  nameInSchema="nomContact"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle="Poste du contact*"
                  nameInSchema="posteContact"
                />
              </div>
            </div>
            <div className="w-full flex flex-col gap-6">
              <p>
                Parce que nous ne sommes pas un comparateur en ligne comme les
                autres, avant de valider cette étape, voici{" "}
                <strong>3 engagements que nous prenons envers vous :</strong>
              </p>
              <ul className="flex flex-col gap-2 ml-16">
                <li className="list-handshake">
                  Engagement N°1 : Vous allez bien obtenir un devis complet et
                  définitif 100% en ligne
                </li>
                <li className="list-handshake">
                  Engagement N°2 : Sans engagement ! Créer un devis personnalisé
                  est gratuit et ne vous engage à rien
                </li>
                <li className="list-handshake">
                  Engagement N°3 : Pas de SPAM, vos informations sont sécurisées
                  par fm4all et ne seront ni partagées, ni utilisées à des fins
                  de prospection par un tiers
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="lg"
                title="Sauvegarder ma progression"
                className="text-base"
              >
                Suivant ↓
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default SauvegarderProgression;
