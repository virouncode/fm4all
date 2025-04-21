"use client";
import { insertFournisseurAction } from "@/actions/fournisseurAction";
import { insertUserAction } from "@/actions/userAction";
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
        emailContact: tAdmin("email-du-contact-invalide"),
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
          tAuth(
            "une-erreur-est-survenue-lors-de-la-creation-du-compte-utilisateur"
          ),
      });
    },
  });

  const {
    execute: executeSaveUser,
    isPending: isSavingUser,
    reset: resetSaveUserAction,
  } = useAction(insertUserAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: tAuth("succes"),
        description: data?.message,
      });
      form.reset(defaultValues);
      resetSaveUserAction();
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          error?.serverError ||
          tAuth(
            "une-erreur-est-survenue-lors-de-la-creation-du-compte-utilisateur"
          ),
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
      executeSaveUser({
        name: data.nomFournisseur.toUpperCase(),
        email: data.emailContact.toLowerCase(),
        password: "temp",
        role: "fournisseur",
        fournisseurId,
        image: null,
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
              disabled={isSavingFournisseur || isSavingUser}
            >
              {isSavingFournisseur || isSavingUser ? (
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
