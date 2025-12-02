"use client";
import { updateSiteAction } from "@/actions/sitesActions";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { updateSiteFormSchema, UpdateSiteFormType } from "@/zod-schemas/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import SiteForm from "../nouveau-site/SiteForm";

type ClientUpdateSiteFormProps = {
  defaultValues: UpdateSiteFormType;
  clientId: number;
};

const ClientUpdateSiteForm = ({
  defaultValues,
  clientId,
}: ClientUpdateSiteFormProps) => {
  const router = useRouter();
  const form = useForm<UpdateSiteFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(updateSiteFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const { execute: executeUpdateSite, isPending: isSavingSite } = useAction(
    updateSiteAction,
    {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: "Succès",
          description: data.message,
        });
        router.push(`/client/${clientId}/sites/mes-sites`);
      },
      onError: ({ error }) => {
        const message =
          (typeof error.serverError === "string" && error.serverError) ||
          "Impossible de mettre à jour le site, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: UpdateSiteFormType) => {
    const payload = normalizeForSubmit(data, {
      requiredNumbers: ["surface", "effectif"],
      optionalStrings: ["adresseLigne2", "commentaires"],
    });
    executeUpdateSite(payload);
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isSavingSite;
  return (
    <Form {...form}>
      <SiteForm<UpdateSiteFormType>
        mode="edit"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        clientId={clientId}
        userRole="client"
      />
    </Form>
  );
};

export default ClientUpdateSiteForm;
