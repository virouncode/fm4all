"use client";

import { insertUserAction } from "@/actions/userAction";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { insertUserFormSchema, InsertUserFormType } from "@/zod-schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import UserForm from "../../mon-profil/[userId]/UserForm";

type NouveauMembreFormProps = {
  defaultValues: InsertUserFormType;
  clientId: number;
};

const NouveauMembreForm = ({
  defaultValues,
  clientId,
}: NouveauMembreFormProps) => {
  const form = useForm<InsertUserFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(insertUserFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const { execute: executeInsertUser, isPending: isSavingUser } = useAction(
    insertUserAction,
    {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: "Succès",
          description: data.message,
        });
        form.reset(defaultValues);
      },
      onError: ({ error }) => {
        const message =
          (typeof error.serverError === "string" && error.serverError) ||
          "Impossible de créer l'utilisateur, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: InsertUserFormType) => {
    const payload = {
      ...data,
      name: data.firstName + " " + data.lastName,
      image: data.avatarAttachment ? data.avatarAttachment.url : null,
      role: "client" as const,
      clientId,
    };
    executeInsertUser(payload);
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isSavingUser;

  return (
    <Form {...form}>
      <UserForm<InsertUserFormType>
        mode="create"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        clientId={clientId}
      />
    </Form>
  );
};

export default NouveauMembreForm;
