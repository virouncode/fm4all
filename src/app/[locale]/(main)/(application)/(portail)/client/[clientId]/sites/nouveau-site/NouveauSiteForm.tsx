"use client";
import { insertSiteAction } from "@/actions/sitesActions";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { insertSiteFormSchema, InsertSiteFormType } from "@/zod-schemas/site";
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
    const payload = normalizeForSubmit(data, {
      optionalStrings: ["adresseLigne2", "commentaires"] as const,
      requiredNumbers: ["surface", "effectif"] as const,
    });
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
        isReadOnly={false}
      />
    </Form>
  );
};

export default NouveauSiteForm;
