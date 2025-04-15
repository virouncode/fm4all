"use client";
import { insertFournisseurAction } from "@/actions/insertFournisseurAction";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { capitalize } from "@/lib/capitalize";
import {
  insertFournisseurSchema,
  InsertFournisseurType,
} from "@/zod-schemas/fournisseur";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import DisplayServerActionResponse from "./DisplayServerActionResponse";

const FournisseurForm = () => {
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
    result: resultSaveFournisseur,
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

  const submitForm = async (data: InsertFournisseurType) => {
    //insérer le fournisseur
    const fournisseurToPost: InsertFournisseurType = {
      ...data,
      nomFournisseur: data.nomFournisseur.toUpperCase(),
      prenomContact: capitalize(data.prenomContact),
      nomContact: capitalize(data.nomContact),
      emailContact: data.emailContact.toLowerCase(),
    };
    executeSaveFournisseur(fournisseurToPost);
    //creer l'utilisateur
  };

  return (
    <>
      <DisplayServerActionResponse result={resultSaveFournisseur} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-6">
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Nom de l'entreprise*"
                nameInSchema="nomFournisseur"
              />
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Siret"
                nameInSchema="siret"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Prénom du contact*"
                nameInSchema="prenomContact"
              />
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Nom du contact*"
                nameInSchema="nomContact"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="Email*"
                nameInSchema="emailContact"
                type="email"
              />
              <InputWithLabel<InsertFournisseurType>
                fieldTitle="N° de téléphone*"
                nameInSchema="phoneContact"
                type="tel"
              />
            </div>
            <div className="flex justify-center mt-6">
              <Button
                variant="destructive"
                size="lg"
                title="Créer un compte"
                className="text-base"
                disabled={!form.formState.isValid || isSavingFournisseur}
              >
                {isSavingFournisseur ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Créer un compte"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default FournisseurForm;
