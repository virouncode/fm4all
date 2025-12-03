"use client";

import { finaliserDevisAction } from "@/actions/devisAction";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { MARGE, RATIO } from "@/constants/constants";
import { departements } from "@/constants/departements";
import useScrollIntoMonDevis from "@/hooks/use-scroll-into-mon-devis";
import { toast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { postVercelBlob } from "@/lib/queries/vercel-blob/postVercelBlob";
import fillDevis from "@/lib/utils/fillDevis";
import { useCommentairesStore } from "@/stores/commentairesStore";
import { useMonDevisStore } from "@/stores/monDevisStore";
import { useProspectStore } from "@/stores/prospectStore";
import { useTotalStore } from "@/stores/totalStore";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  createUpdateProspectFormSchema,
  UpdateProspectFormType,
  UpdateProspectType,
} from "@/zod-schemas/prospect";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateTime } from "luxon";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/shallow";

type MonDevisFormProps = {
  setDevisUrl: Dispatch<SetStateAction<string | null>>;
};

const MonDevisForm = ({ setDevisUrl }: MonDevisFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const tDevisErreurs = useTranslations("DevisPage.sauver.erreurs");
  const t = useTranslations("DevisPage.afficher");
  const tSauver = useTranslations("DevisPage.sauver");
  const { prospect, setProspect } = useProspectStore(
    useShallow((s) => ({
      prospect: s.prospect,
      setProspect: s.setProspect,
    })),
  );
  const total = useTotalStore((s) => s.total);
  const commentaires = useCommentairesStore((s) => s.commentaires);
  const setMonDevis = useMonDevisStore((s) => s.setMonDevis);
  const [accepte, setAccepte] = useState(false);
  const router = useRouter();
  useScrollIntoMonDevis();

  const defaultValues: UpdateProspectFormType = {
    nomEntreprise: prospect.nomEntreprise ?? "",
    siret: prospect.siret ?? "",
    prenomContact: prospect.prenomContact ?? "",
    nomContact: prospect.nomContact ?? "",
    posteContact: prospect.posteContact ?? "",
    emailContact: prospect.emailContact ?? "",
    phoneContact: prospect.phoneContact ?? "",
    prenomSignataire: prospect.prenomSignataire ?? "",
    nomSignataire: prospect.nomSignataire ?? "",
    posteSignataire: prospect.posteSignataire ?? "",
    emailSignataire: prospect.emailSignataire ?? "",
    adresseLigne1: prospect.adresseLigne1 ?? "",
    adresseLigne2: prospect.adresseLigne2 ?? "",
    codePostal: prospect.codePostal ?? "",
    ville: prospect.ville ?? "",
    dateDeDemarrage: prospect.dateDeDemarrage ?? "",
    commentaires: prospect.commentaires ?? "",
  };

  const form = useForm<UpdateProspectFormType>({
    mode: "onTouched",
    resolver: zodResolver(
      createUpdateProspectFormSchema({
        nomEntreprise: tDevisErreurs("nom-de-lentreprise-obligatoire"),
        siret: tDevisErreurs("siret-invalide-format-attendu-xxx-xxx-xxx-xxxxx"),
        prenomContact: tDevisErreurs("prenom-du-contact-obligatoire"),
        nomContact: tDevisErreurs("nom-du-contact-obligatoire"),
        posteContact: tDevisErreurs("poste-du-contact-obligatoire"),
        emailContact: tDevisErreurs("adresse-email-invalide"),
        phoneContact: tDevisErreurs("numero-de-telephone-invalide"),
        emailSignataire: tDevisErreurs("adresse-email-invalide"),
        codePostal: tDevisErreurs("code-postal-invalide-entrez-5-chiffres"),
        ville: tDevisErreurs("ville-obligatoire"),
      }),
    ),
    defaultValues,
  });

  const { execute: executeFinaliserDevis, isPending: isSavingFinaliserDevis } =
    useAction(finaliserDevisAction, {
      onSuccess: ({ data }) => {
        if (!data?.success || !data.data) {
          toast({
            variant: "destructive",
            title: t("erreur"),
            description: t("une-erreur-est-survenue"),
          });
          return;
        }
        setProspect(data.data.prospect);
        setDevisUrl(data.data.devisUrl);
        setMonDevis({ currentMonDevisId: 2 });
        toast({
          variant: "default",
          title: tSauver("succes"),
          description: data.message,
        });
      },
      onError: ({ error }) => {
        console.error("[finaliserDevisAction error]", error);
        // Pour voir plus clair :
        console.log("serverError:", error.serverError);
        console.log("validationErrors:", (error as any).validationErrors);

        toast({
          variant: "destructive",
          title: tSauver("erreur"),
          description:
            error?.serverError ??
            tSauver("impossible-de-generer-votre-devis-veuillez-reessayer"),
        });
      },
    });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProspect((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeDate = (value: string) => {
    setProspect((prev) => ({
      ...prev,
      dateDeDemarrage: value,
    }));
  };

  const submitForm = async (data: UpdateProspectFormType) => {
    if (!accepte) {
      toast({
        variant: "destructive",
        title: tSauver("erreur"),
        description: t(
          "en-cochant-cette-case-je-reconnais-avoir-lu-compris-et-accepte-sans-reserve-les",
        ),
      });
      return;
    }

    if (!prospect.id) {
      toast({
        variant: "destructive",
        title: t("erreur"),
        description: t(
          "impossible-de-finaliser-votre-devis-aucun-prospect-associe",
        ),
      });
      return;
    }

    if (
      !departements.find(({ id }) => id === data.codePostal?.substring(0, 2))
    ) {
      router.push("/chalandise");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${data.codePostal}`,
      );
      const cityData = await response.json();

      if (cityData.length === 0) {
        toast({
          variant: "destructive",
          title: t("code-postal-invalide"),
          description: t(
            "le-code-postal-ne-correspond-a-aucune-ville-veuillez-reessayer",
          ),
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.log(err);
    }

    // 1) fusionner prospect store + valeurs form
    const merged = { ...prospect, ...data };

    // 2) normaliser pour la base (surface/effectif → number, trim, capitalize, etc.)
    const payload = normalizeForSubmit(merged, {
      requiredNumbers: ["surface", "effectif"] as const,
      optionalStrings: [
        "siret",
        "prenomSignataire",
        "nomSignataire",
        "posteSignataire",
        "emailSignataire",
        "adresseLigne1",
        "adresseLigne2",
        "commentaires",
        "dateDeDemarrage",
      ] as const,
    });

    try {
      // 3) générer le PDF côté client avec ce prospect normalisé
      const numeroDevis = `${payload.nomEntreprise}_${DateTime.local().toFormat(
        "dd-MM-yyyy'T'HH:mm",
      )}`;
      const nomDevis = `Devis_fm4all_${numeroDevis}.pdf`;

      const urlTemp = await fillDevis({
        numeroDevis,
        dateEmission: format(new Date(), "dd/MM/yyyy", { locale: fr }),
        nomEmetteur: "FM4ALL comparateur en ligne",
        prospect: payload as UpdateProspectType,
        totalAnnuelHTMarge: total.totalAnnuelHt ?? 0,
        totalInstallationHTMarge: total.totalInstallationHt ?? 0,
        commentaires: commentaires ?? "",
        dateDemarrage: payload.dateDeDemarrage
          ? format(new Date(payload.dateDeDemarrage), "dd/MM/yyyy", {
              locale: fr,
            })
          : "",
      });

      if (!urlTemp) {
        toast({
          variant: "destructive",
          title: t("erreur"),
          description: t("une-erreur-est-survenue"),
        });

        setIsLoading(false);
        return;
      }
      // 4) uploader le PDF vers Vercel Blob
      const responseBlob = await fetch(urlTemp);
      const blob = await responseBlob.blob();
      const file = new File([blob], nomDevis, {
        type: "application/pdf",
      });

      const uploadResponse = await postVercelBlob({
        file,
        filename: nomDevis,
        foldername: "devis",
      });

      const finalDevisUrl = uploadResponse.url;

      // 5) appeler la server action avec prospectToUpdate + finalDevisUrl
      executeFinaliserDevis({
        prospect: payload as UpdateProspectType,
        devisUrl: finalDevisUrl,
        commentaires: commentaires ?? null,
        devisMontants: {
          totalMensuelHt: Math.round(((total.totalAnnuelHt ?? 0) / 12) * RATIO),
          totalInstallationHt: Math.round(
            (total.totalInstallationHt ?? 0) * RATIO,
          ),
          margeCoefficient: MARGE,
        },
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("erreur"),
        description: t("une-erreur-est-survenue"),
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex h-full flex-col items-center gap-4 overflow-auto"
      id="1"
    >
      <p className="text-2xl font-bold">
        {t("felicitations")} {prospect.prenomContact} {prospect.nomContact} !
      </p>
      <p className="text-lg">{t("votre-devis-final-est-pret")}</p>
      <p className="mx-auto max-w-prose text-base text-wrap hyphens-auto">
        {t("afin-de-donner-une")} <strong>{t("entete-a-votre-devis")}</strong>{" "}
        {t(
          "et-faciliter-vos-futures-demarches-vous-pouvez-nous-communiquer-vos-coordonnees-ainsi-que-celles-du-signataire-du-contrat-si-differentes",
        )}
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="mt-6 w-full p-1 md:p-4"
        >
          <div className="flex w-full flex-1 flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:gap-20">
              <div className="flex w-full flex-col lg:w-1/4">
                <RhfInput<UpdateProspectFormType>
                  label={t("prenom-du-contact")}
                  name="prenomContact"
                  onChange={handleChange}
                  requiredMark
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("nom-du-contact")}
                  name="nomContact"
                  onChange={handleChange}
                  requiredMark
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("email-du-contact")}
                  type="email"
                  name="emailContact"
                  onChange={handleChange}
                  requiredMark
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("poste-du-contact")}
                  name="posteContact"
                  onChange={handleChange}
                  requiredMark
                  className="w-full"
                />
              </div>
              <div className="flex w-full flex-col lg:w-1/4">
                <RhfInput<UpdateProspectFormType>
                  label={t("prenom-du-signataire")}
                  name="prenomSignataire"
                  onChange={handleChange}
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("nom-du-signataire")}
                  name="nomSignataire"
                  onChange={handleChange}
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("email-du-signataire")}
                  type="email"
                  name="emailSignataire"
                  onChange={handleChange}
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("poste-du-signataire")}
                  name="posteSignataire"
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div className="flex w-full flex-col lg:w-1/4">
                <RhfInput<UpdateProspectFormType>
                  label={t("nom-de-lentreprise")}
                  name="nomEntreprise"
                  onChange={handleChange}
                  requiredMark
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("siret")}
                  name="siret"
                  onChange={handleChange}
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("n-de-telephone")}
                  name="phoneContact"
                  onChange={handleChange}
                  requiredMark
                  className="w-full"
                />
                <RhfDatePicker<UpdateProspectFormType>
                  label={t("date-de-demarrage")}
                  name="dateDeDemarrage"
                  onChange={handleChangeDate}
                  requiredMark
                  className="w-full"
                />
              </div>
              <div className="flex w-full flex-col lg:w-1/4">
                <RhfInput<UpdateProspectFormType>
                  label={t("addresse-du-site-ligne-1")}
                  name="adresseLigne1"
                  onChange={handleChange}
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("addresse-du-site-ligne-2")}
                  name="adresseLigne2"
                  onChange={handleChange}
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("code-postal")}
                  name="codePostal"
                  onChange={handleChange}
                  requiredMark
                  className="w-full"
                />
                <RhfInput<UpdateProspectFormType>
                  label={t("ville")}
                  name="ville"
                  onChange={handleChange}
                  requiredMark
                  className="w-full"
                />
              </div>
            </div>
            <div className="mb-6 flex items-center justify-center gap-4">
              <Checkbox
                checked={accepte}
                onCheckedChange={(value: boolean) => setAccepte(value)}
                className="bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground font-bold"
                id="acceptation"
                aria-label={t("acceptez-les-conditions")}
                data-testid="acceptation-checkbox"
              />
              <Label htmlFor="acceptation" className="inline max-w-prose">
                {t(
                  "en-cochant-cette-case-je-reconnais-avoir-lu-compris-et-accepte-sans-reserve-les",
                )}{" "}
                <Link href="/cgu" className="underline" target="_blank">
                  {t("conditions-generales-dutilisation-cgu")}
                </Link>{" "}
                {t("et-les")}{" "}
                <Link href="/cgv" className="underline" target="_blank">
                  {t("conditions-generales-de-vente")}
                </Link>{" "}
                {t("de-fm4all-applicables-a-tout-contrat-ulterieur")}
              </Label>
            </div>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="min-w-[200px] text-base"
                disabled={isSavingFinaliserDevis || isLoading || !accepte}
                data-testid="afficher-devis-button"
              >
                {(isSavingFinaliserDevis || isLoading) && <Spinner />}
                {t("afficher-mon-devis")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MonDevisForm;
