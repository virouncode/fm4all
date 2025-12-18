"use client";

import { updateInterventionAction } from "@/actions/interventionsActions";
import { Form } from "@/components/ui/form";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/hooks/use-toast";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { SelectClientType } from "@/zod-schemas/client";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import {
  updateInterventionFormSchema,
  UpdateInterventionFormType,
} from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { SelectTicketType } from "@/zod-schemas/ticket";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InterventionForm from "../../../../forms/InterventionForm";

type AdminUpdateInterventionFormProps = {
  defaultValues: UpdateInterventionFormType;
  clients: SelectClientType[];
  tickets: SelectTicketType[];
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
  isReadOnly: boolean;
};

export default function AdminUpdateInterventionForm({
  defaultValues,
  clients,
  tickets,
  sites,
  fournisseurs,
  isReadOnly,
}: AdminUpdateInterventionFormProps) {
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
      router.push("../toutes-les-interventions");
    },
    onError: ({ error }) => {
      const message =
        (typeof error.serverError === "string" && error.serverError) ||
        "Impossible de modifier l'intervention, veuillez réessayer.";

      toast({
        variant: "destructive",
        title: "Erreur",
        description: message,
      });
    },
  });

  const submitForm = (data: UpdateInterventionFormType) => {
    const payload = normalizeForSubmit(data, {
      optionalDates: ["dateDebutPrevue", "dateFinPrevue"] as const,
      optionalNumbers: [
        "siteId",
        "clientId",
        "fournisseurId",
        "ticketId",
      ] as const,
    });
    // Convert null to undefined for compatibility
    executeUpdateIntervention({
      ...payload,
      siteId: payload.siteId ?? undefined,
      clientId: payload.clientId ?? undefined,
      fournisseurId: payload.fournisseurId ?? undefined,
      ticketId: payload.ticketId ?? undefined,
    });
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
      optionalDates: ["dateDebutPrevue", "dateFinPrevue"] as const,
      optionalNumbers: [
        "siteId",
        "clientId",
        "fournisseurId",
        "ticketId",
      ] as const,
    });
    executeUpdateIntervention({
      ...payload,
      status: "annulee",
      siteId: payload.siteId ?? undefined,
      clientId: payload.clientId ?? undefined,
      fournisseurId: payload.fournisseurId ?? undefined,
      ticketId: payload.ticketId ?? undefined,
    });
  };

  return (
    <Form {...form}>
      <InterventionForm<UpdateInterventionFormType>
        mode="edit"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        clients={clients}
        tickets={tickets}
        sites={sites}
        fournisseurs={fournisseurs}
        userRole="admin"
        handleAnnuler={handleAnnuler}
        isReadOnly={isReadOnly}
      />
    </Form>
  );
}
