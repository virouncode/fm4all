"use client";
import { saveProgressAction } from "@/actions/devisAction";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { formatLocalStorageData } from "@/lib/utils/formatLocalStorageData";
import { useDevisProgressStore } from "@/stores/devisProgressStore";
import { useProspectStore } from "@/stores/prospectStore";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  createInsertProspectFormSchema,
  InsertProspectFormType,
  InsertProspectType,
} from "@/zod-schemas/prospect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/shallow";

const SauvegarderProgression = () => {
  const t = useTranslations("DevisPage");
  const tSauverErreurs = useTranslations("DevisPage.sauver.erreurs");
  const tSauver = useTranslations("DevisPage.sauver");
  const [isLoading, setIsLoading] = useState(false);
  const { prospect, setProspect } = useProspectStore(
    useShallow((s) => ({
      prospect: s.prospect,
      setProspect: s.setProspect,
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

  const defaultValues: InsertProspectFormType = {
    nomEntreprise: prospect.nomEntreprise || "",
    prenomContact: prospect.prenomContact || "",
    nomContact: prospect.nomContact || "",
    posteContact: prospect.posteContact || "",
    emailContact: prospect.emailContact || "",
    phoneContact: prospect.phoneContact || "",
    surface: prospect.surface?.toString() || "100",
    effectif: prospect.effectif?.toString() || "20",
    typeBatiment: prospect.typeBatiment || "bureaux",
    typeOccupation: prospect.typeOccupation || "partieEtage",
    codePostal: prospect.codePostal || "",
    ville: prospect.ville || "",
  };
  const form = useForm<InsertProspectFormType>({
    mode: "all",
    resolver: zodResolver(
      createInsertProspectFormSchema({
        nomEntreprise: tSauverErreurs("nom-de-lentreprise-obligatoire"),
        prenomContact: tSauverErreurs("prenom-du-contact-obligatoire"),
        nomContact: tSauverErreurs("nom-du-contact-obligatoire"),
        posteContact: tSauverErreurs("poste-du-contact-obligatoire"),
        emailContactInvalide: tSauverErreurs("adresse-email-invalide"),
        emailContactObligatoire: tSauverErreurs("adresse-email-obligatoire"),
        phoneContact: tSauverErreurs("numero-de-telephone-invalide"),
      }),
    ),
    defaultValues,
  });
  const { execute: executeSaveProgress, isPending: isSavingProgress } =
    useAction(saveProgressAction, {
      onSuccess: ({ data }) => {
        if (!data || !data.success) {
          toast({
            variant: "destructive",
            title: tSauver("erreur"),
            description: data?.message,
          });
          return;
        }

        toast({
          variant: "default",
          title: tSauver("succes"),
          description: data?.message,
        });

        const newCompletedSteps = [
          ...new Set([...devisProgress.completedSteps, 1, 2, 3, 4, 5]),
        ].sort((a, b) => a - b);

        setDevisProgress({ currentStep: 6, completedSteps: newCompletedSteps });
        setProspect(data.data.prospect);

        setIsLoading(true);
        //Pour donner le temps au toast de s'afficher avant de changer de page
        setTimeout(() => {
          router.push("/devis/personnaliser");
        }, 500);
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
    });

  const submitForm = async (data: InsertProspectFormType) => {
    if (!accepte) {
      toast({
        variant: "destructive",
        description: tSauver(
          "veuillez-accepter-notre-politique-de-confidentialite-avant-de-continuer",
        ),
      });
      return;
    }
    const prospectPayload: InsertProspectType = normalizeForSubmit(data, {
      requiredNumbers: ["surface", "effectif"],
    });
    const textePayload = formatLocalStorageData();
    executeSaveProgress({ prospect: prospectPayload, texte: textePayload });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProspect((prev) => ({
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
            <div className="flex flex-col gap-4 px-1 md:flex-row md:gap-14">
              <div className="flex w-full flex-col gap-4 md:w-1/2">
                <RhfInput<InsertProspectFormType>
                  label="Email"
                  name="emailContact"
                  type="email"
                  onChange={handleChange}
                  data-testid="email-contact-input"
                  requiredMark
                />
                <RhfInput<InsertProspectFormType>
                  label={tSauver("n-de-telephone")}
                  name="phoneContact"
                  onChange={handleChange}
                  data-testid="phone-contact-input"
                  requiredMark
                />
                <RhfInput<InsertProspectFormType>
                  label={tSauver("nom-de-lentreprise")}
                  name="nomEntreprise"
                  onChange={handleChange}
                  data-testid="nom-entreprise-input"
                  requiredMark
                />
              </div>
              <div className="flex w-full flex-col gap-4 md:w-1/2">
                <RhfInput<InsertProspectFormType>
                  label={tSauver("prenom-du-contact")}
                  name="prenomContact"
                  onChange={handleChange}
                  data-testid="prenom-contact-input"
                  requiredMark
                />
                <RhfInput<InsertProspectFormType>
                  label={tSauver("nom-du-contact")}
                  name="nomContact"
                  onChange={handleChange}
                  data-testid="nom-contact-input"
                  requiredMark
                />
                <RhfInput<InsertProspectFormType>
                  label={tSauver("poste-du-contact")}
                  name="posteContact"
                  onChange={handleChange}
                  data-testid="poste-contact-input"
                  requiredMark
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
                disabled={!accepte || isSavingProgress || isLoading}
                data-testid="sauvegarder-progression-button"
              >
                {(isSavingProgress || isLoading) && <Spinner />}
                {t("suivant")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default SauvegarderProgression;
