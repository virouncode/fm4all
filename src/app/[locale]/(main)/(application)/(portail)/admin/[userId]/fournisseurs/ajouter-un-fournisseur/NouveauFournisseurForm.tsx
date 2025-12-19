"use client";

import { onboardFournisseurAction } from "@/actions/fournisseurAction";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { getAllServices } from "@/lib/queries/services/getServices";
import {
  onboardFournisseurFormSchema,
  OnboardFournisseurFormType,
} from "@/zod-schemas/fournisseur";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import FournisseurForm from "../_components/FournisseurForm";

type NouveauFournisseurFormProps = {
  userId: string;
  services: Awaited<ReturnType<typeof getAllServices>>;
};

const NouveauFournisseurForm = ({
  userId,
  services,
}: NouveauFournisseurFormProps) => {
  const router = useRouter();

  const defaultValues: OnboardFournisseurFormType = {
    fournisseur: {
      nomFournisseur: "",
      siret: "",
      prenomContact: "",
      nomContact: "",
      emailContact: "",
      phoneContact: "",
      logoAttachment: null,
    },
    services: [],
  };

  const form = useForm<OnboardFournisseurFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(onboardFournisseurFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const { execute: executeOnboardFournisseur, isPending } = useAction(
    onboardFournisseurAction,
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
          "Impossible de créer le fournisseur, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: OnboardFournisseurFormType) => {
    const fournisseurPayload = {
      ...data.fournisseur,
      logoUrl: data.fournisseur.logoAttachment
        ? data.fournisseur.logoAttachment.url
        : null,
    };
    const userAdminPayload = {
      name: data.fournisseur.prenomContact + " " + data.fournisseur.nomContact,
      firstName: data.fournisseur.prenomContact,
      lastName: data.fournisseur.nomContact,
      email: data.fournisseur.emailContact,
      phone: data.fournisseur.phoneContact,
      role: "fournisseur" as const,
      fournisseurId: null,
      clientId: null,
      image: null,
    };
    const payload = {
      fournisseur: fournisseurPayload,
      userAdmin: userAdminPayload,
      services: data.services,
    };
    executeOnboardFournisseur(payload);
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isPending;

  return (
    <Form {...form}>
      <FournisseurForm
        mode="create"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting || isPending}
        isSubmitDisabled={isSubmitDisabled}
        services={services}
      />
    </Form>
  );
};

export default NouveauFournisseurForm;
