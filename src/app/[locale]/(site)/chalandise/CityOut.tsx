"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { occupation } from "@/constants/occupation";
import { ClientContext } from "@/context/ClientProvider";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { sendEmailFromClient } from "@/lib/sendEmail";
import { CityOutType, createCityOutSchema } from "@/zod-schemas/cityout";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";

type CityOutProps = {
  destination?: string;
  codePostal?: string;
  ville?: string;
  surface?: string;
  effectif?: string;
  typeBatiment?: string;
  typeOccupation?: string;
};

const CityOut = ({
  destination,
  codePostal,
  ville,
  surface,
  effectif,
  typeBatiment,
  typeOccupation,
}: CityOutProps) => {
  const t = useTranslations("DevisPage.locaux.cityOut");
  const tSauverErreurs = useTranslations("DevisPage.sauver.erreurs");
  const { client } = useContext(ClientContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const defaultValues: CityOutType = {
    nomEntreprise: client?.nomEntreprise || "",
    prenomContact: client?.prenomContact || "",
    nomContact: client?.nomContact || "",
    posteContact: client?.posteContact || "",
    emailContact: client?.emailContact || "",
    phoneContact: client?.phoneContact || "",
  };
  const form = useForm<CityOutType>({
    mode: "onBlur",
    resolver: zodResolver(
      createCityOutSchema({
        nomEntreprise: tSauverErreurs("nom-de-lentreprise-obligatoire"),
        prenomContact: tSauverErreurs("prenom-du-contact-obligatoire"),
        nomContact: tSauverErreurs("nom-du-contact-obligatoire"),
        posteContact: tSauverErreurs("poste-du-contact-obligatoire"),
        emailContact: tSauverErreurs("adresse-email-obligatoire"),
        emailContactInvalide: tSauverErreurs("adresse-email-invalide"),
        phoneContact: tSauverErreurs("numero-de-telephone-invalide"),
      })
    ),
    defaultValues,
  });

  const submitForm = async (data: CityOutType) => {
    setLoading(true);
    try {
      await sendEmailFromClient({
        to: "contact@fm4all.com",
        from: "contact@fm4all.com",
        subject: "Nouveau client : région en cours de développement",
        text: `<p>Un nouveau client a laissé ses coordonnées sur la page de chiffrage automatique. La matrice de chiffrage est en cours de développement pour sa région.</p><br/>
          <p>Voici ses coordonnées :</p><br/>
          <p>Entreprise : ${data.nomEntreprise}</p>
          <p>Code postal : ${codePostal ?? ""}</p>
          <p>Ville : ${ville ?? ""}</p>
          <p>Surface des locaux : ${surface ?? ""}</p>
          <p>Effectif : ${effectif ?? ""}</p>
          <p>Type de bâtiment : ${typeBatiment ? batiments.find(({ id }) => id === typeBatiment)?.description : ""}</p>
          <p>Type d'occupation : ${typeOccupation ? occupation.find(({ id }) => id === typeOccupation)?.description : ""}</p>
          <p>Nom du contact : ${data.nomContact}</p>
          <p>Prénom du contact : ${data.prenomContact}</p>
          <p>Poste du contact : ${data.posteContact}</p>
          <p>Email du contact : ${data.emailContact}</p>
          <p>N°Tél du contact : ${data.phoneContact}</p>
          `,
      });
      toast({
        variant: "default",
        title: t("succes"),
        description: t(
          "vos-coordonnees-ont-bien-ete-envoyees-a-notre-equipe-nous-vous-contacterons-dans-les-plus-brefs-delais"
        ),
      });
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
    } finally {
      setLoading(false);
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
              <InputWithLabel<CityOutType>
                fieldTitle={t("nom-de-lentreprise")}
                nameInSchema="nomEntreprise"
              />
              <InputWithLabel<CityOutType>
                fieldTitle={t("email-du-contact")}
                nameInSchema="emailContact"
              />
              <InputWithLabel<CityOutType>
                fieldTitle={t("n-de-telephone")}
                nameInSchema="phoneContact"
              />
            </div>
            <div className="flex-1 flex flex-col gap-4 ">
              <InputWithLabel<CityOutType>
                fieldTitle={t("prenom-du-contact")}
                nameInSchema="prenomContact"
              />
              <InputWithLabel<CityOutType>
                fieldTitle={t("nom-du-contact")}
                nameInSchema="nomContact"
              />
              <InputWithLabel<CityOutType>
                fieldTitle={t("poste-du-contact")}
                nameInSchema="posteContact"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              variant="destructive"
              size="lg"
              title={t("envoyer-mes-coordonnees")}
              className="text-base min-w-28"
              disabled={loading}
            >
              {loading ? (
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
