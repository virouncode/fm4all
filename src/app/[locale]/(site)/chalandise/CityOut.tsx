"use client";

import { insertClientCityOutAction } from "@/actions/insertClientCityOutAction";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { occupation } from "@/constants/occupation";
import { ClientContext } from "@/context/ClientProvider";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import {
  createInsertClientSchema,
  InsertClientType,
} from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { ChangeEvent, useContext } from "react";
import { useForm } from "react-hook-form";

type CityOutProps = {
  destination?: string;
};

const CityOut = ({ destination }: CityOutProps) => {
  const t = useTranslations("DevisPage.locaux.cityOut");
  const tSauverErreurs = useTranslations("DevisPage.sauver.erreurs");
  const { client } = useContext(ClientContext);
  const router = useRouter();
  const defaultValues: InsertClientType = {
    ...client,
  };
  const form = useForm<InsertClientType>({
    mode: "onBlur",
    resolver: zodResolver(
      createInsertClientSchema({
        nomEntreprise: tSauverErreurs("nom-de-lentreprise-obligatoire"),
        siret: tSauverErreurs(
          "siret-invalide-format-attendu-xxx-xxx-xxx-xxxxx"
        ),
        prenomContact: tSauverErreurs("prenom-du-contact-obligatoire"),
        nomContact: tSauverErreurs("nom-du-contact-obligatoire"),
        posteContact: tSauverErreurs("poste-du-contact-obligatoire"),
        emailContact: tSauverErreurs("adresse-email-invalide"),
        phoneContact: tSauverErreurs("numero-de-telephone-invalide"),
        emailSignataire: tSauverErreurs("adresse-email-invalide"),
        surface: tSauverErreurs("surface-obligatoire"),
        surfaceMax: tSauverErreurs("surface-maximum-3000-m"),
        effectif: tSauverErreurs("effectif-obligatoire"),
        effectifMax: tSauverErreurs("effectif-maximum-300-personnes"),
        typeBatiment: tSauverErreurs("batiment"),
        typeOccupation: tSauverErreurs("type-doccupation-invalide"),
        codePostal: tSauverErreurs("code-postal-invalide-entrez-5-chiffres"),
        ville: tSauverErreurs("ville-obligatoire"),
      })
    ),
    defaultValues,
  });
  const { execute: executeSaveClient, isPending: isSavingClient } = useAction(
    insertClientCityOutAction,
    {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: t("succes"),
          description: data?.message,
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: t("erreur"),
          description: t(
            "impossible-de-sauvegarder-vos-coordonnees-veuillez-reessayer"
          ),
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
            occupation.find(({ id }) => id === data.typeOccupation)?.description
          }</p>
          `,
        }),
      });
      //Mettre les coordonnées dans la bdd
      executeSaveClient(data);
      setTimeout(() => {
        //pour laisser le temps au toast de s'afficher
        if (destination) router.push("/");
        else router.back();
      }, 1000);
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        toast({
          title: t("erreur"),
          variant: "destructive",
          description: t(
            "impossible-denvoyer-vos-coordonnees-a-notre-equipe-veuillez-reessayer"
          ),
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-10 mt-6">
      <div className="w-full max-w-prose mx-auto text-base md:text-lg hyphens-auto text-wrap flex flex-col gap-4">
        <p>
          {t(
            "notre-matrice-de-chiffrage-automatique-est-en-cours-de-developpement-pour-votre-region-cependant-vous-pouvez-etre-contacte-pour-un-devis-sur-mesure-ou-etre-averti-des-que-lautomatisation-sera-disponible-dans-votre-region"
          )}
        </p>
        <p className="text-center">{t("laissez-nous-vos-coordonnees-ici")}</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="flex flex-col gap-10 mx-auto w-full md:w-2/3"
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="flex-1 flex flex-col gap-4">
              <InputWithLabel<InsertClientType>
                fieldTitle={t("nom-de-lentreprise")}
                nameInSchema="nomEntreprise"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle={t("email-du-contact")}
                nameInSchema="emailContact"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle={t("n-de-telephone")}
                nameInSchema="phoneContact"
                handleChange={handleChange}
              />
            </div>
            <div className="flex-1 flex flex-col gap-4 ">
              <InputWithLabel<InsertClientType>
                fieldTitle={t("prenom-du-contact")}
                nameInSchema="prenomContact"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle={t("nom-du-contact")}
                nameInSchema="nomContact"
                handleChange={handleChange}
              />
              <InputWithLabel<InsertClientType>
                fieldTitle={t("poste-du-contact")}
                nameInSchema="posteContact"
                handleChange={handleChange}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              variant="destructive"
              size="lg"
              title={t("envoyer-mes-coordonnees")}
              className="text-base min-w-28"
            >
              {isSavingClient ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                t("envoyer-mes-coordonnees")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CityOut;
