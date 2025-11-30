"use client";

import { updateTicketAction } from "@/actions/ticketsActions";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import {
  updateTicketFormSchema,
  UpdateTicketFormType,
} from "@/zod-schemas/ticket";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import TicketForm from "../nouveau-ticket/TicketForm";

type UpdateTicketFormProps = {
  defaultValues: UpdateTicketFormType;
  clientId: number;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
};

export default function UpdateTicketForm({
  defaultValues,
  clientId,
  sites,
  fournisseurs,
}: UpdateTicketFormProps) {
  const form = useForm<UpdateTicketFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(updateTicketFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const { execute: executeUpdateTicket, isPending: isSavingTicket } = useAction(
    updateTicketAction,
    {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: "Succès",
          description: data.message,
        });
      },
      onError: ({ error }) => {
        const message =
          (typeof error.serverError === "string" && error.serverError) ||
          "Impossible de mettre à jour le ticket, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: UpdateTicketFormType) => {
    const payload = {
      ...data,
      fournisseurId: data.fournisseurId === 0 ? null : data.fournisseurId,
    };
    executeUpdateTicket(payload);
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isSavingTicket;

  return (
    <Form {...form}>
      <TicketForm<UpdateTicketFormType>
        mode="edit"
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
