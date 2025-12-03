"use client";

import { updateUserAction } from "@/actions/userAction";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { updateUserFormSchema, UpdateUserFormType } from "@/zod-schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import UserForm from "./UserForm";

type UpdateUserFormProps = {
  clientId: number;
  defaultValues: UpdateUserFormType;
};

const UpdateUserForm = ({ clientId, defaultValues }: UpdateUserFormProps) => {
  const router = useRouter();
  const form = useForm<UpdateUserFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(updateUserFormSchema),
  });
  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const { execute: executeUpdateUser, isPending: isSavingUser } = useAction(
    updateUserAction,
    {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: "Succès",
          description: data.message,
        });
        router.push(`/client/${clientId}`);
      },

      onError: ({ error }) => {
        const message =
          (typeof error.serverError === "string" && error.serverError) ||
          "Impossible de mettre à jour votre profil, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: UpdateUserFormType) => {
    executeUpdateUser({
      ...data,
      name: data.firstName + " " + data.lastName,
      image: data.avatarAttachment ? data.avatarAttachment.url : null,
    });
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isSavingUser;

  return (
    <Form {...form}>
      <UserForm<UpdateUserFormType>
        mode="edit"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        clientId={clientId}
      />
    </Form>
  );
};

export default UpdateUserForm;
