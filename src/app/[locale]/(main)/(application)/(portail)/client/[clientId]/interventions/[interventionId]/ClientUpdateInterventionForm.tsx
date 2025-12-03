"use client";

import { updateInterventionAction } from "@/actions/interventionsActions";
import { Form } from "@/components/ui/form";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/hooks/use-toast";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import {
  updateInterventionFormSchema,
  UpdateInterventionFormType,
} from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InterventionForm from "../../../../forms/InterventionForm";

type ClientUpdateInterventionFormProps = {
  defaultValues: UpdateInterventionFormType;
  clientId: number;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
  isReadOnly: boolean;
};

export default function ClientUpdateInterventionForm({
  defaultValues,
  clientId,
  sites,
  fournisseurs,
  isReadOnly,
}: ClientUpdateInterventionFormProps) {
  const confirm = useConfirm();
  const router = useRouter();

  const form = useForm<UpdateInterventionFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(updateInterventionFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const {
    execute: executeUpdateIntervention,
    isPending: isSavingIntervention,
  } = useAction(updateInterventionAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: "Succès",
        description: data.message,
      });
      router.push(`/client/${clientId}/interventions/mes-interventions`);
    },
    onError: ({ error }) => {
      const message =
        (typeof error.serverError === "string" && error.serverError) ||
        "Impossible de créer le ticket, veuillez réessayer.";

      toast({
        variant: "destructive",
        title: "Erreur",
        description: message,
      });
    },
  });

  const submitForm = (data: UpdateInterventionFormType) => {
    const payload = normalizeForSubmit(data, {
      requiredDates: ["dateDebutPrevue"] as const,
      optionalDates: ["dateFinPrevue"] as const,
      requiredNumbers: ["siteId", "clientId", "fournisseurId"] as const,
    });
    executeUpdateIntervention(payload);
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isSavingIntervention;

  const handleAnnuler = async () => {
    const ok = await confirm({
      title: "Confirmer l'annulation",
      description:
        "Êtes-vous sûr de vouloir annuler cette intervention ? Cette action est irréversible.",
      confirmText: "Oui",
      cancelText: "Non",
      danger: true,
    });
    if (!ok) return;
    const payload = normalizeForSubmit(defaultValues, {
      requiredDates: ["dateDebutPrevue"] as const,
      optionalDates: ["dateFinPrevue"] as const,
      requiredNumbers: ["siteId", "clientId", "fournisseurId"] as const,
    });
    executeUpdateIntervention({ ...payload, status: "annulee" });
  };

  return (
    <Form {...form}>
      <InterventionForm<UpdateInterventionFormType>
        mode="edit"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        clientId={clientId}
        sites={sites}
        fournisseurs={fournisseurs}
        userRole="client"
        handleAnnuler={handleAnnuler}
        isReadOnly={isReadOnly}
      />
    </Form>
  );
}
