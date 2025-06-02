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

const FournisseurAccountForm = ({
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
          <p>Mes informations</p>
        </CardTitle>
        <CardDescription className="text-sm md:text-base max-w-prose italic">
          👉 Renseignez vos informations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitForm)} className="grid gap-2">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-6">
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Nom de l'entreprise*"
                nameInSchema="nomFournisseur"
              />
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="SIRET*"
                nameInSchema="siret"
              />
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Prenom du contact*"
                nameInSchema="prenomContact"
              />
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Nom du contact*"
                nameInSchema="nomContact"
              />
              {/* <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Email*"
                nameInSchema="emailContact"
                type="email"
                readOnly={true}
              /> */}
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="N° de téléphone*"
                nameInSchema="phoneContact"
                type="tel"
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

export default FournisseurAccountForm;
