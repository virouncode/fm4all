"use client";

import { insertClientAction } from "@/actions/clientAction";
import { insertDevisAction } from "@/actions/devisAction";
import { DateInputWithLabel } from "@/components/form-inputs/DateInputWithLabel";
import { InputWithLabel } from "@/components/form-inputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { batiments } from "@/constants/batiments";
import { departements } from "@/constants/departements";
import { occupation } from "@/constants/occupation";
import { ClientContext } from "@/context/ClientProvider";
import { CommentairesContext } from "@/context/CommentairesProvider";
import { MonDevisContext } from "@/context/MonDevisProvider";
import { TotalContext } from "@/context/TotalProvider";
import useScrollIntoMonDevis from "@/hooks/use-scroll-into-mon-devis";
import { toast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { sendEmailFromClient } from "@/lib/email/sendEmail";
import fillDevis from "@/lib/utils/fillDevis";
import {
  createUpdateClientSchema,
  InsertClientType,
  UpdateClientType,
} from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader } from "lucide-react";
import { DateTime } from "luxon";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { useForm } from "react-hook-form";

type MonDevisFormProps = {
  setDevisUrl: Dispatch<SetStateAction<string | null>>;
};

const MonDevisForm = ({ setDevisUrl }: MonDevisFormProps) => {
  const tDevisErreurs = useTranslations("DevisPage.sauver.erreurs");
  const t = useTranslations("DevisPage.afficher");
  const tSauver = useTranslations("DevisPage.sauver");
  const { client, setClient } = useContext(ClientContext);
  const { total } = useContext(TotalContext);
  const { commentaires } = useContext(CommentairesContext);
  const { setMonDevis } = useContext(MonDevisContext);
  const [loading, setLoading] = useState(false);
  const [accepte, setAccepte] = useState(false);
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
    prenomSignataire: client.prenomSignataire ?? "",
    nomSignataire: client.nomSignataire ?? "",
    posteSignataire: client.posteSignataire ?? "",
    emailSignataire: client.emailSignataire ?? "",
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
    dateDeDemarrage: client.dateDeDemarrage ?? null,
    commentaires: client.commentaires ?? "",
  };

  const form = useForm<UpdateClientType>({
    mode: "onBlur",
    resolver: zodResolver(
      createUpdateClientSchema({
        nomEntreprise: tDevisErreurs("nom-de-lentreprise-obligatoire"),
        siret: tDevisErreurs("siret-invalide-format-attendu-xxx-xxx-xxx-xxxxx"),
        prenomContact: tDevisErreurs("prenom-du-contact-obligatoire"),
        nomContact: tDevisErreurs("nom-du-contact-obligatoire"),
        posteContact: tDevisErreurs("poste-du-contact-obligatoire"),
        emailContact: tDevisErreurs("adresse-email-invalide"),
        phoneContact: tDevisErreurs("numero-de-telephone-invalide"),
        emailSignataire: tDevisErreurs("adresse-email-invalide"),
        surface: tDevisErreurs("surface-obligatoire"),
        surfaceMax: tDevisErreurs("surface-maximum-3000-m"),
        effectif: tDevisErreurs("effectif-obligatoire"),
        effectifMax: tDevisErreurs("effectif-maximum-300-personnes"),
        typeBatiment: tDevisErreurs("batiment"),
        typeOccupation: tDevisErreurs("type-doccupation-invalide"),
        codePostal: tDevisErreurs("code-postal-invalide-entrez-5-chiffres"),
        ville: tDevisErreurs("ville-obligatoire"),
      })
    ),
    defaultValues,
  });

  const { execute: executeSaveClient, isPending: isSavingClient } = useAction(
    insertClientAction,
    {
      onSuccess: async ({ data }) => {
        try {
          setLoading(true);
          const newClientData = data?.data.client;
          if (!newClientData) {
            toast({
              variant: "destructive",
              title: t("erreur"),
              description: t("une-erreur-est-survenue"),
            });
            return;
          }
          const numerosDevis = `${newClientData?.nomEntreprise}_${DateTime.local().toFormat(
            "dd-MM-yyyy'T'HH:mm"
          )}`;
          const nomDevis = `Devis_fm4all_${numerosDevis}.pdf`;

          const url = await fillDevis(
            numerosDevis,
            format(new Date(), "dd/MM/yyyy", { locale: fr }),
            "FM4ALL comparateur en ligne",
            newClientData,
            total.totalAnnuelHt,
            total.totalInstallationHt,
            commentaires ?? "",
            newClientData.dateDeDemarrage
              ? format(new Date(newClientData.dateDeDemarrage), "dd/MM/yyyy", {
                  locale: fr,
                })
              : ""
          );
          if (url) {
            try {
              //Le Fichier du devis
              const responseBlob = await fetch(url);
              const blob = await responseBlob.blob();
              const file = new File([blob], nomDevis);
              //Dans vercel blob
              const response = await fetch(
                `/api/vercelblob?filename=${nomDevis}&foldername=devis`,
                {
                  method: "POST",
                  body: file,
                }
              );
              const urlToPost: string = (await response.json()).url;
              executeSaveDevis({
                clientId: newClientData.id,
                devisUrl: urlToPost,
              });
              setDevisUrl(urlToPost);
              await sendEmailFromClient({
                to: "contact@fm4all.com",
                from: "devis@fm4all.com",
                subject: "Un client a finalisé son devis",
                text: `<p>Un client a finalisé son devis.</p><br/>
                            <p>Voici ses coordonnées :</p><br/>
                            <p>Entreprise : ${newClientData.nomEntreprise}</p>
                            <p>Siret : ${newClientData.siret}</p>
                            <p>Adresse ligne 1 : ${newClientData.adresseLigne1}</p>
                            <p>Adresse ligne 2 : ${newClientData.adresseLigne2}</p>
                            <p>Code postal : ${newClientData.codePostal}</p>
                            <p>Ville : ${newClientData.ville}</p>
                            <p>Surface des locaux : ${newClientData.surface}</p>
                            <p>Effectif : ${newClientData.effectif}</p>
                            <p>Type de bâtiment : ${batiments.find(({ id }) => id === newClientData.typeBatiment)?.description}</p>
                            <p>Type d'occupation : ${occupation.find(({ id }) => id === newClientData.typeOccupation)?.description}</p>
                            <p>Nom du contact : ${newClientData.nomContact}</p>
                            <p>Prénom du contact : ${newClientData.prenomContact}</p>
                            <p>Poste du contact : ${newClientData.posteContact}</p>
                            <p>Email du contact : ${newClientData.emailContact}</p>
                            <p>N°Tél du contact : ${newClientData.phoneContact}</p>
                            <p>Nom du signataire : ${newClientData.nomSignataire}</p>
                            <p>Prénom du signataire : ${newClientData.prenomSignataire}</p>
                            <p>Poste du signataire : ${newClientData.posteSignataire}</p>
                            <p>Email du signataire : ${newClientData.emailSignataire}</p>
                            <p>Date de démarrage : ${
                              newClientData.dateDeDemarrage
                                ? format(
                                    new Date(newClientData.dateDeDemarrage),
                                    "dd/MM/yyyy",
                                    {
                                      locale: fr,
                                    }
                                  )
                                : newClientData.dateDeDemarrage
                            }</p></br>
                            <p>Commentaires du client : ${commentaires}</p><br/>
                            <p>Veuillez trouver en pièce jointe le devis</p>
                            `,
                attachment: urlToPost,
                filename: nomDevis,
              });
            } catch (err) {
              console.log(err);
            }
          }
          setMonDevis({ currentMonDevisId: 2 });
        } catch (err) {
          if (err instanceof Error) {
            toast({
              variant: "destructive",
              title: t("erreur"),
              description: err.message,
            });
          } else console.log(err);
        } finally {
          setLoading(false);
        }
        // toast({
        //   variant: "default",
        //   title: tSauver("succes"),
        //   description: data?.message,
        // });
      },
      onError: ({ error }) => {
        toast({
          variant: "destructive",
          title: tSauver("erreur"),
          description:
            error?.serverError ??
            tSauver(
              "impossible-de-sauvegarder-vos-coordonnees-veuillez-reessayer"
            ),
        });
      },
    }
  );

  const { execute: executeSaveDevis, isPending: isSavingDevis } = useAction(
    insertDevisAction,
    {
      onSuccess: ({ data }) => {
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
    }
  );

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
    if (
      !departements.find(({ id }) => id === data.codePostal?.substring(0, 2))
    ) {
      router.push("/chalandise");
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
          title: t("code-postal-invalide"),
          description: t(
            "le-code-postal-ne-correspond-a-aucune-ville-veuillez-reessayer"
          ),
        });
        return;
      }
    } catch (err) {
      console.log(err);
    }
    const clientToPost: InsertClientType = {
      nomEntreprise: data.nomEntreprise ?? "",
      siret: data.siret ?? "",
      prenomContact: data.prenomContact ?? "",
      nomContact: data.nomContact ?? "",
      posteContact: data.posteContact ?? "",
      emailContact: data.emailContact ?? "",
      phoneContact: data.phoneContact ?? "",
      emailSignataire: data.emailSignataire ?? "",
      surface: data.surface ?? 100,
      effectif: data.effectif ?? 20,
      typeBatiment: data.typeBatiment,
      typeOccupation: data.typeOccupation,
      codePostal: data.codePostal ?? "",
      ville: data.ville ?? "",
      id: client.id,
      prenomSignataire: data.prenomSignataire,
      nomSignataire: data.nomSignataire,
      posteSignataire: data.posteSignataire,
      adresseLigne1: data.adresseLigne1,
      adresseLigne2: data.adresseLigne2,
      dateDeDemarrage: data.dateDeDemarrage,
      commentaires: data.commentaires,
      createdAt: data.createdAt,
    };
    executeSaveClient(clientToPost);
  };

  return (
    <div
      className="flex flex-col items-center gap-4 h-full overflow-auto"
      id="1"
    >
      <p className="text-2xl font-bold">
        {t("felicitations")} {client.prenomContact} {client.nomContact} !
      </p>
      <p className="text-lg">{t("votre-devis-final-est-pret")}</p>
      <p className="text-base max-w-prose mx-auto hyphens-auto text-wrap">
        {t("afin-de-donner-une")} <strong>{t("entete-a-votre-devis")}</strong>{" "}
        {t(
          "et-faciliter-vos-futures-demarches-vous-pouvez-nous-communiquer-vos-coordonnees-ainsi-que-celles-du-signataire-du-contrat-si-differentes"
        )}
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="mt-6 p-1 md:p-4 w-full"
        >
          <div className="flex-1 flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-4 lg:flex-row lg:gap-20">
              <div className="w-full lg:w-1/4 flex flex-col">
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("prenom-du-contact")}
                  nameInSchema="prenomContact"
                  name="prenomContact"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("nom-du-contact")}
                  nameInSchema="nomContact"
                  name="nomContact"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("email-du-contact")}
                  nameInSchema="emailContact"
                  type="email"
                  name="emailContact"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("poste-du-contact")}
                  nameInSchema="posteContact"
                  name="posteContact"
                  handleChange={handleChange}
                  className="w-full"
                />
              </div>
              <div className="w-full lg:w-1/4 flex flex-col">
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("prenom-du-signataire")}
                  nameInSchema="prenomSignataire"
                  name="prenomSignataire"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("nom-du-signataire")}
                  nameInSchema="nomSignataire"
                  name="nomSignataire"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("email-du-signataire")}
                  nameInSchema="emailSignataire"
                  type="email"
                  name="emailSignataire"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("poste-du-signataire")}
                  nameInSchema="posteSignataire"
                  name="posteSignataire"
                  handleChange={handleChange}
                  className="w-full"
                />
              </div>
              <div className="w-full lg:w-1/4 flex flex-col">
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("nom-de-lentreprise")}
                  nameInSchema="nomEntreprise"
                  name="nomEntreprise"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("siret")}
                  nameInSchema="siret"
                  name="siret"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("n-de-telephone")}
                  nameInSchema="phoneContact"
                  name="phoneContact"
                  handleChange={handleChange}
                  className="w-full"
                />
                <DateInputWithLabel<InsertClientType>
                  fieldTitle={t("date-de-demarrage")}
                  nameInSchema="dateDeDemarrage"
                  handleChangeDate={handleChangeDate}
                />
              </div>

              <div className="w-full lg:w-1/4 flex flex-col">
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("addresse-du-site-ligne-1")}
                  nameInSchema="adresseLigne1"
                  name="addressLigne1"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("addresse-du-site-ligne-2")}
                  nameInSchema="adresseLigne2"
                  name="adresseLigne2"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("code-postal")}
                  nameInSchema="codePostal"
                  name="codePostal"
                  handleChange={handleChange}
                  className="w-full"
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle={t("ville")}
                  nameInSchema="ville"
                  name="ville"
                  handleChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-4 items-center justify-center mb-6">
              <Checkbox
                checked={accepte}
                onCheckedChange={(value: boolean) => setAccepte(value)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                id="acceptation"
                aria-label={t("acceptez-les-conditions")}
              />
              <Label htmlFor="acceptation" className="max-w-prose">
                {t(
                  "en-cochant-cette-case-je-reconnais-avoir-lu-compris-et-accepte-sans-reserve-les"
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
                variant="destructive"
                size="lg"
                className="text-base min-w-[200px]"
                disabled={
                  loading || isSavingClient || isSavingDevis || !accepte
                }
              >
                {loading || isSavingClient || isSavingDevis ? (
                  <Loader className="animate-spin" />
                ) : (
                  t("afficher-mon-devis")
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MonDevisForm;
