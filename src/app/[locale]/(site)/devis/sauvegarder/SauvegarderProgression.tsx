"use client";
import { insertClientAction } from "@/actions/clientAction";
import { insertDevisTemporaireAction } from "@/actions/devisAction";
import { InputWithLabel } from "@/components/form-inputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { batiments } from "@/constants/batiments";
import { occupation } from "@/constants/occupation";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { toast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { formatLocalStorageData } from "@/lib/formatLocalStorageData";
import { sendEmailFromClient } from "@/lib/sendEmail";
import {
  createInsertClientSchema,
  InsertClientType,
} from "@/zod-schemas/client";
import { InsertDevisTemporaireType } from "@/zod-schemas/devis";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { ChangeEvent, useContext, useState } from "react";
import { useForm } from "react-hook-form";

const SauvegarderProgression = () => {
  const t = useTranslations("DevisPage");
  const tSauverErreurs = useTranslations("DevisPage.sauver.erreurs");
  const tSauver = useTranslations("DevisPage.sauver");
  const { client, setClient } = useContext(ClientContext);
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const [accepte, setAccepte] = useState(false);
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
    insertClientAction,
    {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: tSauver("succes"),
          description: data?.message,
        });
        if (data?.data?.client?.id) {
          const devisToPost: InsertDevisTemporaireType = {
            clientId: data?.data.client.id,
            texte: formatLocalStorageData(),
          };
          executeSaveDevisTemporaire(devisToPost);
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: tSauver("erreur"),
          description: tSauver(
            "impossible-de-sauvegarder-vos-coordonnees-veuillez-reessayer"
          ),
        });
      },
    }
  );
  const {
    execute: executeSaveDevisTemporaire,
    isPending: isSavingDevisTemporaire,
  } = useAction(insertDevisTemporaireAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: tSauver("succes"),
        description: data?.message,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: tSauver("erreur"),
        description: tSauver(
          "impossible-de-sauvegarder-le-devis-veuillez-reessayer"
        ),
      });
    },
  });

  const submitForm = async (data: InsertClientType) => {
    if (!accepte) {
      toast({
        variant: "destructive",
        description: tSauver(
          "veuillez-accepter-notre-politique-de-confidentialite-avant-de-continuer"
        ),
      });
      return;
    }
    //Server action pour insérer ou update le client dans la db
    executeSaveClient(data);
    //TODO: ecrire dans la bdd une log table du devis avec formatted data, client_id, createdAt
    //cf onSuccess
    //TODO envoyez un email à Romu avec toutes les infos du devis grâce aux contextes
    try {
      await sendEmailFromClient({
        to: "contact@fm4all.com",
        from: "contact@fm4all.com",
        subject: "Un client a sauvegardé sa progression",
        text: `<p>Un client a sauvegardé sa progression dans le funnel.</p><br/>
                <p>Voici ses coordonnées :</p><br/>
                <p>Entreprise : ${data.nomEntreprise}</p>
                <p>Code postal : ${data.codePostal}</p>
                <p>Ville : ${data.ville}</p>
                <p>Surface des locaux : ${data.surface}</p>
                <p>Effectif : ${data.effectif}</p>
                <p>Type de bâtiment : ${batiments.find(({ id }) => id === data.typeBatiment)?.description}</p>
                <p>Type d'occupation : ${occupation.find(({ id }) => id === data.typeOccupation)?.description}</p><br/>
                <p>Nom du contact : ${data.nomContact}</p>
                <p>Prénom du contact : ${data.prenomContact}</p>
                <p>Poste du contact : ${data.posteContact}</p>
                <p>Email du contact : ${data.emailContact}</p>
                <p>N°Tél du contact : ${data.phoneContact}</p><br/>
                <p>Voici ses informations de chiffrage (avant personnalisation) :</p><br/>
                <pre>${formatLocalStorageData()}</pre>
                `,
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
      router.push("/devis/personnaliser");
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
          {tSauver(
            "dans-la-prochaine-etape-vous-allez-personnaliser-vos-services-et-choisir-des-options-avant-de-valider-votre-budget-final-afin-dameliorer-votre-experience-et-enregistrer-votre-progression-merci-de-renseigner-vos-informations-suivantes"
          )}
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitForm)}
            className="flex flex-col gap-8 mx-auto w-full md:w-2/3 mt-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:gap-8 px-1">
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <InputWithLabel<InsertClientType>
                  fieldTitle="Email*"
                  nameInSchema="emailContact"
                  type="email"
                  name="emailContact"
                  handleChange={handleChange}
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("n-de-telephone")}
                  nameInSchema="phoneContact"
                  name="phoneContact"
                  handleChange={handleChange}
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("nom-de-lentreprise")}
                  nameInSchema="nomEntreprise"
                  name="nomEntreprise"
                  handleChange={handleChange}
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-4 ">
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("prenom-du-contact")}
                  nameInSchema="prenomContact"
                  name="prenomContact"
                  handleChange={handleChange}
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("nom-du-contact")}
                  nameInSchema="nomContact"
                  name="nomContact"
                  handleChange={handleChange}
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("poste-du-contact")}
                  nameInSchema="posteContact"
                  name="phoneContact"
                  handleChange={handleChange}
                />
              </div>
            </div>
            <div className="w-full flex flex-col gap-6">
              <p>
                {tSauver(
                  "parce-que-nous-ne-sommes-pas-un-comparateur-en-ligne-comme-les-autres-avant-de-valider-cette-etape-voici"
                )}{" "}
                <strong>
                  {tSauver("3-engagements-que-nous-prenons-envers-vous")}
                </strong>
              </p>
              <ul className="flex flex-col gap-2 ml-10 lg:ml-16">
                <li className="list-handshake">
                  {tSauver(
                    "engagement-n-1-vous-allez-bien-obtenir-un-devis-complet-et-definitif-100-en-ligne"
                  )}
                </li>
                <li className="list-handshake">
                  {tSauver(
                    "engagement-n-2-sans-engagement-creer-un-devis-personnalise-est-gratuit-et-ne-vous-engage-a-rien"
                  )}
                </li>
                <li className="list-handshake">
                  {tSauver(
                    "engagement-n-3-pas-de-spam-vos-informations-sont-securisees-par-fm4all-et-ne-seront-ni-partagees-ni-utilisees-a-des-fins-de-prospection-par-un-tiers"
                  )}
                </li>
              </ul>
            </div>
            <div className="flex gap-4 items-center">
              <Checkbox
                checked={accepte}
                onCheckedChange={(value: boolean) => setAccepte(value)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                id="acceptation"
                aria-label={tSauver("acceptez-les-conditions")}
              />
              <Label htmlFor="acceptation">
                {tSauver(
                  "jaccepte-que-les-informations-saisies-soient-utilisees-par-fm4all-dans-le-cadre-de-ma-demande-et-conformement-a-sa"
                )}{" "}
                <Link
                  href="/confidentialite"
                  className="underline"
                  target="_blank"
                >
                  {tSauver("politique-de-confidentialite")}
                </Link>
              </Label>
            </div>
            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="lg"
                title={tSauver("sauvegarder-ma-progression")}
                className="text-base min-w-28"
                disabled={!accepte}
              >
                {isSavingClient || isSavingDevisTemporaire ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  t("suivant")
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
