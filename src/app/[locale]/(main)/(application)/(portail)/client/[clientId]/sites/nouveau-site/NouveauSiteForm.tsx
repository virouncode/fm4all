"use client";
import { insertSiteAction } from "@/actions/sitesActions";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import {
  insertSiteFormSchema,
  InsertSiteFormType,
  InsertSiteType,
} from "@/zod-schemas/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import SiteForm from "./SiteForm";

type NouveauSiteFormProps = {
  defaultValues: InsertSiteFormType;
  clientId: number;
};

const NouveauSiteForm = ({ defaultValues, clientId }: NouveauSiteFormProps) => {
  const form = useForm<InsertSiteFormType>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(insertSiteFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const { execute: executeInsertSite, isPending: isSavingSite } = useAction(
    insertSiteAction,
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
          "Impossible de créer le site, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: InsertSiteFormType) => {
    const payload: InsertSiteType = {
      ...data,
      clientId,
      adresseLigne2: data.adresseLigne2 ?? null,
      commentaires: data.commentaires ?? null,
      surface: Number(data.surface),
      effectif: Number(data.effectif),
    };
    executeInsertSite(payload);
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isSavingSite;

  return (
    <Form {...form}>
      <SiteForm<InsertSiteFormType>
        mode="create"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        clientId={clientId}
        userRole="client"
      />
    </Form>
  );
};

export default NouveauSiteForm;
