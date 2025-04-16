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
  insertFournisseurSchema,
  InsertFournisseurType,
  SelectFournisseurType,
} from "@/zod-schemas/fournisseur";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FournisseurFormProps = {
  fournisseurs?: SelectFournisseurType[];
};

const FournisseurForm = ({ fournisseurs }: FournisseurFormProps) => {
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
    resolver: zodResolver(insertFournisseurSchema),
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
        title: "Success! 🎉",
        description: data?.message,
      });
      form.reset(defaultValues);
      resetSaveFournisseurAction();
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: "Erreur 😿",
        description:
          error?.serverError ||
          "Une erreur est survenue lors de la création de l'utilisateur",
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
          title: "Erreur 😿",
          description: "Fournisseur non trouvé",
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
            title: "Success! 🎉",
            description: `Le compte utilisateur de ${userToPost.name} a été crée avec succès, un email avec un lien de vérification a été envoyé à ${userToPost.email}`,
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
              title: "Erreur 😿",
              description:
                (err as Error)?.message ??
                "Une erreur est survenue lors de l'envoi de l'email",
            });
          } finally {
            setLoading(false);
          }
        },
        onError: (ctx) => {
          toast({
            variant: "destructive",
            title: "Erreur 😿",
            description:
              ctx.error.message ??
              "Une erreur est survenue lors de la création du compte utilisateur",
          });
        },
      });
    }
  };

  return (
    <>
      {fournisseurs && fournisseurs.length > 0 && (
        <div className="flex items-center gap-4">
          <Label className="text-base" htmlFor="fournisseur">
            Fournisseur :
          </Label>
          <Select
            value={fournisseurId?.toString() || "0"}
            onValueChange={handleSelectFournisseur}
            aria-label="Sélectionner le fournisseur"
          >
            <SelectTrigger className={`w-full max-w-xs`} id="fournisseur">
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Nouveau fournisseur</SelectItem>
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
            <div className="grid grid-cols-2 gap-6">
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Nom de l'entreprise*"
                nameInSchema="nomFournisseur"
                readOnly={!!fournisseurId}
              />
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Siret"
                nameInSchema="siret"
                readOnly={!!fournisseurId}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Prénom du contact*"
                nameInSchema="prenomContact"
                readOnly={!!fournisseurId}
              />
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Nom du contact*"
                nameInSchema="nomContact"
                readOnly={!!fournisseurId}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Email*"
                nameInSchema="emailContact"
                type="email"
                readOnly={!!fournisseurId}
              />
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="N° de téléphone*"
                nameInSchema="phoneContact"
                type="tel"
                readOnly={!!fournisseurId}
              />
            </div>

            <Button
              variant="destructive"
              size="lg"
              title="Créer un compte"
              className="text-base mt-6 w-full"
              disabled={!form.formState.isValid || isSavingFournisseur}
            >
              {isSavingFournisseur ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Créer un compte"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default FournisseurForm;
