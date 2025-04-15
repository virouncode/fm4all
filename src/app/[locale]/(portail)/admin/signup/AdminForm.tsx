"use client";
import { insertAdminAction } from "@/actions/insertAdminAction";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { insertAdminSchema, InsertAdminType } from "@/zod-schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

const AdminForm = () => {
  const defaultValues: InsertAdminType = {
    prenom: "",
    nom: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    image: null,
    role: "admin",
  };
  const form = useForm<InsertAdminType>({
    mode: "onBlur",
    resolver: zodResolver(insertAdminSchema),
    defaultValues,
  });
  const {
    execute: executeSaveAdmin,
    isPending: isSavingAdmin,
    reset: resetSaveAdminAction,
    result: resultSaveAdmin,
  } = useAction(insertAdminAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: "Success! 🎉",
        description: data?.message,
      });
      form.reset(defaultValues);
      resetSaveAdminAction();
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
  const submitForm = async (data: InsertAdminType) => {
    executeSaveAdmin(data);
  };
  return (
    <>
      {/* <DisplayServerActionResponse result={resultSaveAdmin} /> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid gap-2">
            <InputWithLabel<InsertAdminType>
              fieldTitle="Email*"
              nameInSchema="email"
              type="email"
              className="max-w-full"
            />
            <div className="grid grid-cols-2 gap-6">
              <InputWithLabel<InsertAdminType>
                fieldTitle="Prénom*"
                nameInSchema="prenom"
              />
              <InputWithLabel<InsertAdminType>
                fieldTitle="Nom*"
                nameInSchema="nom"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <InputWithLabel<InsertAdminType>
                fieldTitle="Mot de passe*"
                nameInSchema="password"
                type="password"
              />
              <InputWithLabel<InsertAdminType>
                fieldTitle="Confirmation mot de passe*"
                nameInSchema="passwordConfirmation"
                type="password"
              />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button
              variant="destructive"
              size="lg"
              title="Créer un compte"
              className="text-base"
              disabled={!form.formState.isValid || isSavingAdmin}
            >
              {isSavingAdmin ? (
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

export default AdminForm;
