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
import { toast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { sendEmailFromClient } from "@/lib/email/sendEmail";
import { formatLocalStorageData } from "@/lib/utils/formatLocalStorageData";
import { useClientStore } from "@/stores/clientStore";
import { useDevisProgressStore } from "@/stores/devisProgressStore";
import {
  createInsertClientSchema,
  InsertClientType,
} from "@/zod-schemas/client";
import { InsertDevisTemporaireType } from "@/zod-schemas/devis";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/shallow";

const SauvegarderProgression = () => {
  const t = useTranslations("DevisPage");
  const tSauverErreurs = useTranslations("DevisPage.sauver.erreurs");
  const tSauver = useTranslations("DevisPage.sauver");
  const [loading, setLoading] = useState(false);
  const { client, setClient } = useClientStore(
    useShallow((s) => ({
      client: s.client,
      setClient: s.setClient,
    })),
  );
  const { devisProgress, setDevisProgress } = useDevisProgressStore(
    useShallow((s) => ({
      devisProgress: s.devisProgress,
      setDevisProgress: s.setDevisProgress,
    })),
  );
  const [accepte, setAccepte] = useState(false);
  const router = useRouter();

  const defaultValues: InsertClientType = {
    ...client,
  };
  const form = useForm<InsertClientType>({
    mode: "all",
    resolver: zodResolver(
      createInsertClientSchema({
        nomEntreprise: tSauverErreurs("nom-de-lentreprise-obligatoire"),
        siret: tSauverErreurs(
          "siret-invalide-format-attendu-xxx-xxx-xxx-xxxxx",
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
        codePostal: tSauverErreurs("code-postal-invalide-entrez-5-chiffres"),
        ville: tSauverErreurs("ville-obligatoire"),
      }),
    ),
    defaultValues,
  });
  const { execute: executeSaveClient, isPending: isSavingClient } = useAction(
    insertClientAction,
    {
      onSuccess: ({ data }) => {
        if (!data?.success) {
          return toast({
            variant: "destructive",
            title: tSauver("erreur"),
            description: data?.message,
          });
        }
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
            "impossible-de-sauvegarder-vos-coordonnees-veuillez-reessayer",
          ),
        });
      },
    },
  );
  const {
    execute: executeSaveDevisTemporaire,
    isPending: isSavingDevisTemporaire,
  } = useAction(insertDevisTemporaireAction, {
    onSuccess: ({ data }) => {
      if (!data?.success) {
        return toast({
          variant: "destructive",
          title: tSauver("erreur"),
          description: data?.message,
        });
      }
      toast({
        variant: "default",
        title: tSauver("succes"),
        description: data?.message,
      });
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tSauver("erreur"),
        description:
          error?.serverError ??
          tSauver("impossible-de-sauvegarder-le-devis-veuillez-reessayer"),
      });
    },
  });

  const submitForm = async (data: InsertClientType) => {
    console.log("submit");

    if (!accepte) {
      toast({
        variant: "destructive",
        description: tSauver(
          "veuillez-accepter-notre-politique-de-confidentialite-avant-de-continuer",
        ),
      });
      return;
    }
    if (data.emailContact !== "virounk@gmail.com") {
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
    }
    //TODO envoyer un email au client, bienvenue blablabla
    const newCompletedSteps = [
      ...new Set([...devisProgress.completedSteps, 1, 2, 3, 4, 5]),
    ].sort((a, b) => a - b);
    setDevisProgress({ currentStep: 6, completedSteps: newCompletedSteps });
    setClient(data);
    setLoading(true);
    setTimeout(() => {
      router.push("/devis/personnaliser");
    }, 1000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("handle change", client);

    const { name, value } = e.target;
    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section className="flex-1 overflow-scroll">
      <div className="mx-auto flex h-full w-full flex-col gap-4 py-2">
        <p className="mx-auto w-full md:w-2/3">
          {tSauver(
            "dans-la-prochaine-etape-vous-allez-personnaliser-vos-services-et-choisir-des-options-avant-de-valider-votre-budget-final-afin-dameliorer-votre-experience-et-enregistrer-votre-progression-merci-de-renseigner-vos-informations-suivantes",
          )}
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitForm)}
            className="mx-auto mt-6 flex w-full flex-col gap-8 md:w-2/3"
          >
            <div className="flex flex-col gap-4 px-1 md:flex-row md:gap-8">
              <div className="flex w-full flex-col gap-4 md:w-1/2">
                <InputWithLabel<InsertClientType>
                  fieldTitle="Email*"
                  nameInSchema="emailContact"
                  type="email"
                  name="emailContact"
                  handleChange={handleChange}
                  data-testid="email-contact-input"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("n-de-telephone")}
                  nameInSchema="phoneContact"
                  name="phoneContact"
                  handleChange={handleChange}
                  data-testid="phone-contact-input"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("nom-de-lentreprise")}
                  nameInSchema="nomEntreprise"
                  name="nomEntreprise"
                  handleChange={handleChange}
                  data-testid="nom-entreprise-input"
                />
              </div>
              <div className="flex w-full flex-col gap-4 md:w-1/2">
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("prenom-du-contact")}
                  nameInSchema="prenomContact"
                  name="prenomContact"
                  handleChange={handleChange}
                  data-testid="prenom-contact-input"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("nom-du-contact")}
                  nameInSchema="nomContact"
                  name="nomContact"
                  handleChange={handleChange}
                  data-testid="nom-contact-input"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={tSauver("poste-du-contact")}
                  nameInSchema="posteContact"
                  name="phoneContact"
                  handleChange={handleChange}
                  data-testid="poste-contact-input"
                />
              </div>
            </div>
            <div className="flex w-full flex-col gap-6">
              <p>
                {tSauver(
                  "parce-que-nous-ne-sommes-pas-un-comparateur-en-ligne-comme-les-autres-avant-de-valider-cette-etape-voici",
                )}{" "}
                <strong>
                  {tSauver("3-engagements-que-nous-prenons-envers-vous")}
                </strong>
              </p>
              <ul className="ml-10 flex flex-col gap-2 lg:ml-16">
                <li className="list-handshake">
                  {tSauver(
                    "engagement-n-1-vous-allez-bien-obtenir-un-devis-complet-et-definitif-100-en-ligne",
                  )}
                </li>
                <li className="list-handshake">
                  {tSauver(
                    "engagement-n-2-sans-engagement-creer-un-devis-personnalise-est-gratuit-et-ne-vous-engage-a-rien",
                  )}
                </li>
                <li className="list-handshake">
                  {tSauver(
                    "engagement-n-3-pas-de-spam-vos-informations-sont-securisees-par-fm4all-et-ne-seront-ni-partagees-ni-utilisees-a-des-fins-de-prospection-par-un-tiers",
                  )}
                </li>
              </ul>
            </div>
            <div className="flex items-center gap-4">
              <Checkbox
                checked={accepte}
                onCheckedChange={(value: boolean) => setAccepte(value)}
                className="bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground font-bold"
                id="acceptation"
                aria-label={tSauver("acceptez-les-conditions")}
                data-testid="sauvegarder-acceptation-checkbox"
              />
              <Label htmlFor="acceptation" className="inline">
                {tSauver(
                  "jaccepte-que-les-informations-saisies-soient-utilisees-par-fm4all-dans-le-cadre-de-ma-demande-et-conformement-a-sa",
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
                size="lg"
                title={tSauver("sauvegarder-ma-progression")}
                className="min-w-28 text-base"
                disabled={!accepte}
                data-testid="sauvegarder-progression-button"
              >
                {isSavingClient || isSavingDevisTemporaire || loading ? (
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
