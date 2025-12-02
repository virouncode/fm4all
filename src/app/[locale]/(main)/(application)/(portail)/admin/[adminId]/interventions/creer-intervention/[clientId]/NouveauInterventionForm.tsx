"use client";

import { insertInterventionAction } from "@/actions/interventionsActions";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import {
  insertInterventionFormSchema,
  InsertInterventionFormType,
  InsertInterventionType,
} from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import InterventionForm from "../../../../../forms/InterventionForm";

type NouveauInterventionFormProps = {
  defaultValues: InsertInterventionFormType;
  clientId: number;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
};

export default function NouveauInterventionForm({
  defaultValues,
  clientId,
  sites,
  fournisseurs,
}: NouveauInterventionFormProps) {
  const form = useForm<InsertInterventionFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(insertInterventionFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const {
    execute: executeInsertIntervention,
    isPending: isSavingIntervention,
  } = useAction(insertInterventionAction, {
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
        "Impossible de créer l'intervention, veuillez réessayer.";

      toast({
        variant: "destructive",
        title: "Erreur",
        description: message,
      });
    },
  });

  const submitForm = (data: InsertInterventionFormType) => {
    const payload = normalizeForSubmit(data, {
      requiredDates: ["dateDebutPrevue"],
      optionalDates: ["dateFinPrevue"],
      requiredNumbers: ["siteId", "fournisseurId", "clientId"],
    });
    executeInsertIntervention(payload);
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isSavingIntervention;

  return (
    <Form {...form}>
      <InterventionForm<InsertInterventionType>
        mode="create"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        clientId={clientId}
        sites={sites}
        fournisseurs={fournisseurs}
        userRole="client"
      />
    </Form>
  );
}
