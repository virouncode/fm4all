"use client";

import { updateFournisseurForAdminAction } from "@/actions/fournisseurAction";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { getAllServices } from "@/lib/queries/services/getServices";
import {
  SelectFournisseurType,
  updateFournisseurForAdminFormSchema,
  UpdateFournisseurForAdminFormType,
} from "@/zod-schemas/fournisseur";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import FournisseurForm from "../_components/FournisseurForm";

type AdminUpdateFournisseurFormProps = {
  userId: string;
  fournisseur: SelectFournisseurType;
  fournisseurServices: number[];
  services: Awaited<ReturnType<typeof getAllServices>>;
};

const AdminUpdateFournisseurForm = ({
  userId,
  fournisseur,
  fournisseurServices,
  services,
}: AdminUpdateFournisseurFormProps) => {
  const router = useRouter();

  const defaultValues: UpdateFournisseurForAdminFormType = {
    fournisseur: {
      id: fournisseur.id,
      nomFournisseur: fournisseur.nomFournisseur,
      siret: fournisseur.siret,
      prenomContact: fournisseur.prenomContact,
      nomContact: fournisseur.nomContact,
      emailContact: fournisseur.emailContact,
      phoneContact: fournisseur.phoneContact,
      logoAttachment: fournisseur.logoUrl
        ? {
            url: fournisseur.logoUrl,
            filename: "",
            mimeType: "image/*",
            size: 0,
          }
        : null,
    },
    services: fournisseurServices,
  };

  const form = useForm<UpdateFournisseurForAdminFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(updateFournisseurForAdminFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const { execute: executeUpdateFournisseur, isPending } = useAction(
    updateFournisseurForAdminAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast({
            variant: "default",
            title: "Succès",
            description: data.message,
          });
          router.push(`/admin/${userId}/fournisseurs/tous-les-fournisseurs`);
        } else {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Une erreur est survenue.",
          });
        }
      },
      onError: ({ error }) => {
        const message =
          (typeof error.serverError === "string" && error.serverError) ||
          "Impossible de mettre à jour le fournisseur, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: UpdateFournisseurForAdminFormType) => {
    const payload = {
      ...data,
      fournisseur: {
        ...data.fournisseur,
        logoUrl: data.fournisseur.logoAttachment
          ? data.fournisseur.logoAttachment.url
          : null,
      },
    };
    executeUpdateFournisseur(payload);
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isPending;

  return (
    <Form {...form}>
      <FournisseurForm
        mode="edit"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting || isPending}
        isSubmitDisabled={isSubmitDisabled}
        services={services}
      />
    </Form>
  );
};

export default AdminUpdateFournisseurForm;
