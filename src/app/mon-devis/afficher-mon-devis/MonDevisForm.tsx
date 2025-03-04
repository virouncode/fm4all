"use client";

import { DateInputWithLabel } from "@/components/formInputs/DateInputWithLabel";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { batiments } from "@/constants/batiments";
import { departements } from "@/constants/departements";
import { occupations } from "@/constants/occupations";
import { ClientContext } from "@/context/ClientProvider";
import { CommentairesContext } from "@/context/CommentairesProvider";
import { MonDevisContext } from "@/context/MonDevisProvider";
import { TotalContext } from "@/context/TotalProvider";
import useScrollIntoMonDevis from "@/hooks/use-scroll-into-mon-devis";
import { toast } from "@/hooks/use-toast";
import fillDevis from "@/lib/fillDevis";
import {
  InsertClientType,
  updateClientSchema,
  UpdateClientType,
} from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    //TODO update client dans la bdd

    try {
      setLoading(true);
      const numerosDevis = `${client.nomEntreprise}_${format(
        new Date(),
        "yyyyMMddHHmmss"
      )}`;
      const nomDevis = `Devis_${numerosDevis}.pdf`;

      const url = await fillDevis(
        numerosDevis,
        format(new Date(), "dd/MM/yyyy", { locale: fr }),
        "FM4ALL comparateur en ligne",
        client,
        total.totalAnnuelHt,
        total.totalInstallationHt
      );
      if (url) {
        setDevisUrl(url);

        try {
          //Le Fichier du devis
          const responseBlob = await fetch(url);
          const blob = await responseBlob.blob();
          const file = new File([blob], nomDevis);
          //Dans vercel blob
          const response = await fetch(
            `/api/vercelblob/upload?filename=${nomDevis}`,
            {
              method: "POST",
              body: file,
            }
          );
          const urlToPost = (await response.json()).url;

          await fetch("/api/mailgun", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: "contact@fm4all.com",
              from: "devis@fm4all.com",
              subject: "Un client a finalisé son devis",
              text: `<p>Un client a finalisé son devis.</p><br/>
                        <p>Voici ses coordonnées :</p><br/>
                        <p>Entreprise : ${data.nomEntreprise}</p>
                        <p>Nom du contact : ${data.nomContact}</p>
                        <p>Prénom du contact : ${data.prenomContact}</p>
                        <p>Poste du contact : ${data.posteContact}</p>
                        <p>Email du contact : ${data.emailContact}</p>
                        <p>N°Tél du contact : ${data.phoneContact}</p>
                        <p>Nom du signataire : ${data.nomSignataire}</p>
                        <p>Prénom du signataire : ${data.prenomSignataire}</p>
                        <p>Poste du signataire : ${data.posteSignataire}</p>
                        <p>Email du signataire : ${data.emailSignataire}</p>
                        <p>Code postal : ${data.codePostal}</p>
                        <p>Ville : ${data.ville}</p>
                        <p>Surface des locaux : ${data.surface}</p>
                        <p>Nombre de personnes : ${data.effectif}</p>
                        <p>Type de bâtiment : ${
                          batiments.find(({ id }) => id === data.typeBatiment)
                            ?.description
                        }</p>
                        <p>Type d'occupation : ${
                          occupations.find(
                            ({ id }) => id === data.typeOccupation
                          )?.description
                        }</p><br/>
                        <p>Commentaires du client : ${commentaires}</p><br/>
                        <p>Veuillez trouver en pièce jointe le devis</p>
                        `,
              attachment: urlToPost,
              filename: nomDevis,
            }),
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
          title: "Erreur",
          description: err.message,
        });
      } else console.log(err);
    } finally {
      setLoading(false);
    }
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
      <p className="text-base max-w-prose mx-auto hyphens-auto text-wrap">
        Afin de donner une <strong>entête à votre devis</strong> et faciliter
        vos futures démarches, vous pouvez nous communiquer vos coordonnées,
        ainsi que celles du signataire du contrat (si différentes) :
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)} className="mt-6 p-4">
          <div className="flex-1 flex flex-col gap-4">
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
                  name="posteContact"
                  handleChange={handleChange}
                />
              </div>
              <div className="w-full md:w-1/4 flex flex-col">
                <InputWithLabel<InsertClientType>
                  fieldTitle="Prénom du signataire"
                  nameInSchema="prenomSignataire"
                  name="prenomSignataire"
                  handleChange={handleChange}
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle="Nom du signataire"
                  nameInSchema="nomSignataire"
                  name="nomSignataire"
                  handleChange={handleChange}
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle="Email du signataire"
                  nameInSchema="emailSignataire"
                  type="email"
                  name="emailSignataire"
                  handleChange={handleChange}
                />
                <InputWithLabel<InsertClientType>
                  fieldTitle="Poste du signataire"
                  nameInSchema="posteSignataire"
                  name="posteSignataire"
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
                  placeholder="XXX XXX XXX XXXXX"
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
            </div>
            <div className="flex gap-4 items-center justify-center mb-6">
              <Checkbox
                checked={accepte}
                onCheckedChange={(value: boolean) => setAccepte(value)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                id="acceptation"
                aria-label="Acceptez les conditions"
              />
              <Label htmlFor="acceptation">
                J&apos;accepte les{" "}
                <Link href="/cgv" className="underline" target="_blank">
                  conditions générales de vente
                </Link>
              </Label>
            </div>
            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="lg"
                className="text-base min-w-[200px]"
                disabled={loading || !accepte}
              >
                {loading ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Afficher mon devis"
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
