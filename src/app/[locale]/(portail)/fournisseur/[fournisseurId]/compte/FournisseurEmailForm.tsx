"use client";
import { updateFournisseurAction } from "@/actions/fournisseurAction";
import { InputWithLabel } from "@/components/form-inputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import {
  createUpdateFournisseurFormSchema,
  SelectFournisseurType,
  UpdateFournisseurFormType,
  UpdateFournisseurType,
} from "@/zod-schemas/fournisseur";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FournisseurAccountFormProps = {
  initialFournisseur: SelectFournisseurType;
};

const FournisseurEmailForm = ({
  initialFournisseur,
}: FournisseurAccountFormProps) => {
  const tAuth = useTranslations("auth");
  const tAdmin = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const defaultValues: UpdateFournisseurFormType = {
    ...initialFournisseur,
    anneeCreation: initialFournisseur.anneeCreation?.toString() ?? "",
    nbClients: initialFournisseur.nbClients?.toString() ?? "",
    nbAvis: initialFournisseur.nbAvis?.toString() ?? "",
    presentation: initialFournisseur.presentation ?? "",
  };
  const form = useForm<UpdateFournisseurFormType>({
    mode: "onBlur",
    resolver: zodResolver(
      createUpdateFournisseurFormSchema({
        nomFournisseur: "Nom de l'entreprise obligatoire",
        siret: "Siret invalide",
        prenomContact: "Prénom du contact obligatoire",
        nomContact: "Nom du contact obligatoire",
        emailContact: "Email du contact invalide",
        phoneContact: "Numéro de téléphone obligatoire",
      })
    ),
    defaultValues,
  });
  const {
    execute: executeUpdateFournisseur,
    isPending: isUpdatingFournisseur,
    reset: resetUpdateFournisseurAction,
  } = useAction(updateFournisseurAction, {
    onSuccess: async ({ data }) => {
      if (
        data?.data.fournisseur.emailContact &&
        data?.data.fournisseur.emailContact !== initialFournisseur.emailContact
      ) {
        await authClient.changeEmail({
          newEmail: data?.data.fournisseur.emailContact,
          callbackURL: "/auth/email-ok",
        });
        toast({
          variant: "default",
          title: tAuth("succes"),
          description: data?.message,
        });
        resetUpdateFournisseurAction();
        return;
      }
      toast({
        variant: "default",
        title: tAuth("succes"),
        description: data?.message,
      });
      resetUpdateFournisseurAction();
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          error?.serverError ||
          tAuth(
            "une-erreur-est-survenue-lors-de-la-mise-a-jour-du-fournisseur"
          ),
      });
    },
  });
  const submitForm = async (data: UpdateFournisseurFormType) => {
    setLoading(true);
    const fournisseurToUpdate: UpdateFournisseurType = {
      ...data,
      nbAvis: data.nbAvis ? parseInt(data.nbAvis) : null,
      nbClients: data.nbClients ? parseInt(data.nbClients) : null,
      anneeCreation: data.anneeCreation ? parseInt(data.anneeCreation) : null,
    };
    executeUpdateFournisseur(fournisseurToUpdate);
    setLoading(false);
  };
  return (
    <Card className="rounded-md h-[60%] w-full sm:w-3/4 lg:w-2/3 mx-auto">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          <p>Email</p>
        </CardTitle>
        <CardDescription className="text-sm md:text-base  italic">
          👉 Changez votre email (Attention : le nouvel email sera utilisé pour
          vos futures connexions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitForm)} className="grid gap-2">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-6">
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Email*"
                nameInSchema="emailContact"
                type="email"
              />
            </div>
            <Button
              variant="destructive"
              size="lg"
              title={tAdmin("mettre-a-jour")}
              className="text-base w-full mt-6"
              disabled={isUpdatingFournisseur || loading}
            >
              {isUpdatingFournisseur || loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                tAdmin("mettre-a-jour")
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FournisseurEmailForm;
