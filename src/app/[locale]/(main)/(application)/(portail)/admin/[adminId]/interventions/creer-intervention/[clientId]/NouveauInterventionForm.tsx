"use client";

import { insertInterventionAction } from "@/actions/interventionsActions";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import {
  InsertInterventionType,
  insertInterventionSchema,
} from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import InterventionForm from "../../../../../forms/InterventionForm";

type NouveauInterventionFormProps = {
  defaultValues: InsertInterventionType;
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
  const form = useForm<InsertInterventionType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(insertInterventionSchema),
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

  const submitForm = (data: InsertInterventionType) => {
    console.log("Payload Intervention:", data);
    executeInsertIntervention(data);
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
