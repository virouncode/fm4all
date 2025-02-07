"use client";
import { insertClientAction } from "@/actions/insertClientAction";
import { insertDevisAction } from "@/actions/insertDevisAction";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { batiments } from "@/constants/batiments";
import { occupations } from "@/constants/occupations";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { toast } from "@/hooks/use-toast";
import { formatLocalStorageData } from "@/lib/formatLocalStorageData";
import { insertClientSchema, InsertClientType } from "@/zod-schemas/client";
import { InsertDevisType } from "@/zod-schemas/devis";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext, useState } from "react";
import { useForm } from "react-hook-form";

const SauvegarderProgression = () => {
  const { client, setClient } = useContext(ClientContext);
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const [accepte, setAccepte] = useState(false);
  const router = useRouter();

  const defaultValues: InsertClientType = {
    ...client,
  };
  const form = useForm<InsertClientType>({
    mode: "onBlur",
    resolver: zodResolver(insertClientSchema),
    defaultValues,
  });
  const {
    execute: executeSaveClient,
    isPending: isSavingClient,
    result: resultSaveClient,
  } = useAction(insertClientAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: "Succès ! 🎉",
        description: data?.message,
      });
      if (data?.data?.clientId) {
        const devisToPost: InsertDevisType = {
          clientId: data?.data?.clientId,
          texte: formatLocalStorageData(),
        };
        executeSaveDevis(devisToPost);
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur ! 😿",
        description: `Impossible de sauvegarder vos coordonnées: veuillez réessayer`,
      });
    },
  });
  const { execute: executeSaveDevis, isPending: isSavingDevis } = useAction(
    insertDevisAction,
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
          description: `Impossible de sauvegarder le devis: veuillez réessayer`,
        });
      },
    }
  );

  const submitForm = async (data: InsertClientType) => {
    if (!accepte) {
      toast({
        variant: "destructive",
        description: "Veuillez accepter les conditions avant de  continuer",
      });
      return;
    }
    //Server action pour insérer ou update le client dans la db
    executeSaveClient(data);
    //TODO: ecrire dans la bdd une log table du devis avec formatted data, client_id, createdAt
    //cf onSuccess
    //TODO envoyez un email à Romu avec toutes les infos du devis grâce aux contextes
    try {
      await fetch("/api/mailgun", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "contact@fm4all.com",
          from: "contact@fm4all.com",
          subject: "Un client a sauvegardé sa progression",
          text: `<p>Un client a sauvegardé sa progression dans le funnel.</p><br/>
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
                  batiments.find(({ id }) => id === data.typeBatiment)
                    ?.description
                }</p>
                <p>Type d'occupation : ${
                  occupations.find(({ id }) => id === data.typeOccupation)
                    ?.description
                }</p><br/>
                <p>Voici les informations de chiffrage :</p><br/>
                ${formatLocalStorageData()}
                `,
        }),
      });
    } catch (err) {
      console.log(err);
    }
    //TODO envoyer un email au client, bienvenue blablabla
    const newCompletedSteps = [
      ...new Set([...devisProgress.completedSteps, 1, 2, 3, 4, 5]),
    ].sort((a, b) => a - b);
    setDevisProgress({ currentStep: 6, completedSteps: newCompletedSteps });
    setClient(data);
    setTimeout(() => {
      router.push("/mon-devis/personnaliser-mon-devis");
    }, 1000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section className="flex-1 overflow-scroll">
      <div className="flex flex-col gap-4 w-full mx-auto h-full py-2">
        <p className="w-full md:w-2/3 mx-auto">
          Dans la prochaine étape, vous allez personnaliser vos services et
          choisir des options avant de valider votre budget final. Afin
          d’améliorer votre expérience et enregistrer votre progression, merci
          de renseigner vos informations suivantes :
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
                  name="emailContact"
                  handleChange={handleChange}
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle="N°de téléphone*"
                  nameInSchema="phoneContact"
                  placeholder="XX XX XX XX XX"
                  name="phoneContact"
                  handleChange={handleChange}
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle="Nom de l'entreprise*"
                  nameInSchema="nomEntreprise"
                  name="nomEntreprise"
                  handleChange={handleChange}
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-4 ">
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
                  fieldTitle="Poste du contact*"
                  nameInSchema="posteContact"
                  name="phoneContact"
                  handleChange={handleChange}
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
            <div className="flex gap-4 items-center">
              <Checkbox
                checked={accepte}
                onCheckedChange={(value: boolean) => setAccepte(value)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                id="acceptation"
              />
              <Label htmlFor="acceptation">
                J&apos;accepte que les informations saisies soient utilisées par
                fm4all dans le cadre de ma demande et conformément à sa{" "}
                <Link
                  href="/politique-de-confidentialite"
                  className="underline"
                  target="_blank"
                >
                  politique de confidentialité.
                </Link>
              </Label>
            </div>
            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="lg"
                title="Sauvegarder ma progression"
                className="text-base min-w-28"
              >
                {isSavingClient || isSavingDevis ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Suivant ↓"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default SauvegarderProgression;
