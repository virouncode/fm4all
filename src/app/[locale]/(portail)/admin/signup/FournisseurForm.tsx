"use client";
import { insertFournisseurAction } from "@/actions/insertFournisseurAction";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { generatePassword } from "@/lib/generatePassword";
import { sendEmailFromClient } from "@/lib/sendEmail";
import {
  createInsertFournisseurSchema,
  InsertFournisseurType,
  SelectFournisseurType,
} from "@/zod-schemas/fournisseur";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FournisseurFormProps = {
  fournisseurs?: SelectFournisseurType[];
};

const FournisseurForm = ({ fournisseurs }: FournisseurFormProps) => {
  const tAuth = useTranslations("auth");
  const tAdmin = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [fournisseurId, setFournisseurId] = useState<number | null>(null);
  const defaultValues: InsertFournisseurType = {
    nomFournisseur: "",
    siret: "",
    prenomContact: "",
    nomContact: "",
    emailContact: "",
    phoneContact: "",
  };
  const form = useForm<InsertFournisseurType>({
    mode: "onBlur",
    resolver: zodResolver(
      createInsertFournisseurSchema({
        nomFournisseur: tAdmin("nom-de-lentreprise-obligatoire"),
        siret: tAdmin("siret-invalide"),
        prenomContact: tAdmin("prenom-du-contact-obligatoire"),
        nomContact: tAdmin("nom-du-contact-obligatoire"),
        emailContact: tAdmin("email-du-contact-obligatoire"),
        emailContactInvalid: tAdmin("email-du-contact-invalide"),
        phoneContact: tAdmin("numero-de-telephone-obligatoire"),
      })
    ),
    defaultValues,
  });
  const {
    execute: executeSaveFournisseur,
    isPending: isSavingFournisseur,
    reset: resetSaveFournisseurAction,
  } = useAction(insertFournisseurAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: tAuth("succes"),
        description: data?.message,
      });
      form.reset(defaultValues);
      resetSaveFournisseurAction();
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          error?.serverError ||
          tAdmin("une-erreur-est-survenue-lors-de-la-creation-de-lutilisateur"),
      });
    },
  });

  const handleSelectFournisseur = (value: string) => {
    const selectedFournisseurId = value ? parseInt(value) : null;
    setFournisseurId(selectedFournisseurId);
    if (selectedFournisseurId) {
      const fournisseur = fournisseurs?.find(
        ({ id }) => id === selectedFournisseurId
      );
      if (fournisseur) {
        form.reset({
          nomFournisseur: fournisseur.nomFournisseur,
          siret: fournisseur.siret,
          prenomContact: fournisseur.prenomContact,
          nomContact: fournisseur.nomContact,
          emailContact: fournisseur.emailContact,
          phoneContact: fournisseur.phoneContact,
        });
      } else {
        console.error("Fournisseur non trouvé");
        toast({
          variant: "destructive",
          title: tAuth("erreur"),
          description: tAdmin("fournisseur-non-trouve"),
        });
      }
    } else {
      form.reset(defaultValues);
    }
  };

  const submitForm = async (data: InsertFournisseurType) => {
    if (!fournisseurId) {
      executeSaveFournisseur(data);
    } else {
      const tempPassword = generatePassword();
      const userToPost = {
        name: data.nomFournisseur.toUpperCase(),
        email: data.emailContact.toLowerCase(),
        password: generatePassword(),
        role: "fournisseur",
        fournisseurId,
        image: tempPassword,
      };
      await authClient.signUp.email(userToPost, {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async () => {
          toast({
            variant: "default",
            title: tAuth("succes"),
            description: tAdmin(
              "le-compte-utilisateur-de-usertopost-name-a-ete-cree-avec-succes-un-email-avec-un-lien-de-verification-a-ete-envoye-a-usertopost-email",
              { userName: userToPost.name, userEmail: userToPost.email }
            ),
          });
          try {
            await sendEmailFromClient({
              to: userToPost.email,
              from: "noreply@fm4all.com",
              subject: "Création de votre compte fournisseur",
              text: `<p>Votre compte fournisseur a été crée avec succès, bienvenue chez fm4all !</p><br/>
                    <p>Voici mot de passe temporaire : ${tempPassword}</p><br/>
                    <p>Nous vous conseillons de le changer dès votre première connexion dans votre espace.</p>
                    <p>Pensez aussi à vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.</p>
                    `,
              nomDestinataire: userToPost.name,
            });
            setFournisseurId(null);
            form.reset(defaultValues);
          } catch (err) {
            toast({
              variant: "destructive",
              title: tAuth("erreur"),
              description:
                (err as Error)?.message ??
                tAdmin("une-erreur-est-survenue-lors-de-lenvoi-de-lemail"),
            });
          } finally {
            setLoading(false);
          }
        },
        onError: (ctx) => {
          toast({
            variant: "destructive",
            title: tAuth("erreur"),
            description:
              ctx.error.message ??
              tAdmin(
                "une-erreur-est-survenue-lors-de-la-creation-du-compte-utilisateur"
              ),
          });
        },
      });
    }
  };

  return (
    <>
      {fournisseurs && fournisseurs.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="text-base" htmlFor="fournisseur">
            {tAdmin("fournisseur")}
          </Label>
          <Select
            value={fournisseurId?.toString() || "0"}
            onValueChange={handleSelectFournisseur}
            aria-label={tAdmin("selectionner-le-fournisseur")}
          >
            <SelectTrigger className={`w-full max-w-xs`} id="fournisseur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{tAdmin("nouveau-fournisseur")}</SelectItem>
              {fournisseurs.map((item) => (
                <SelectItem key={`${item.id}`} value={item.id.toString()}>
                  {item.nomFournisseur}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* <DisplayServerActionResponse result={resultSaveFournisseur} /> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid gap-2">
            <div className="grid md:grid-cols-2 gap-2 md:gap-6">
              <InputWithLabel<InsertFournisseurType>
                fieldTitle={tAdmin("nom-de-lentreprise")}
                nameInSchema="nomFournisseur"
                readOnly={!!fournisseurId}
              />
              <InputWithLabel<InsertFournisseurType>
                fieldTitle={tAdmin("siret")}
                nameInSchema="siret"
                readOnly={!!fournisseurId}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-6">
              <InputWithLabel<InsertFournisseurType>
                fieldTitle={tAdmin("prenom-du-contact")}
                nameInSchema="prenomContact"
                readOnly={!!fournisseurId}
              />
              <InputWithLabel<InsertFournisseurType>
                fieldTitle={tAdmin("nom-du-contact")}
                nameInSchema="nomContact"
                readOnly={!!fournisseurId}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-6">
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Email*"
                nameInSchema="emailContact"
                type="email"
                readOnly={!!fournisseurId}
              />
              <InputWithLabel<InsertFournisseurType>
                fieldTitle={tAdmin("n-de-telephone")}
                nameInSchema="phoneContact"
                type="tel"
                readOnly={!!fournisseurId}
              />
            </div>

            <Button
              variant="destructive"
              size="lg"
              title={tAdmin("creer-un-compte")}
              className="text-base mt-6 w-full"
              disabled={
                !form.formState.isValid || isSavingFournisseur || loading
              }
            >
              {isSavingFournisseur || loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                tAdmin("creer-un-compte")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default FournisseurForm;
