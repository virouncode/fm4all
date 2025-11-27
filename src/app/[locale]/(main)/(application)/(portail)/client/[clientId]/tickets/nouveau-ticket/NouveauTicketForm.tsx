"use client";

import { insertTicketAction } from "@/actions/ticketsActions";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import {
  insertTicketFormSchema,
  InsertTicketFormType,
} from "@/zod-schemas/ticket";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import TicketForm from "./TicketForm";

type NouveauTicketFormProps = {
  defaultValues: InsertTicketFormType;
  clientId: number;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
};

export default function NouveauTicketForm({
  defaultValues,
  clientId,
  sites,
  fournisseurs,
}: NouveauTicketFormProps) {
  const form = useForm<InsertTicketFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(insertTicketFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const { execute: executeInsertTicket, isPending: isSavingTicket } = useAction(
    insertTicketAction,
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
          "Impossible de créer le ticket, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: InsertTicketFormType) => {
    const payload = {
      ...data,
      fournisseurId: data.fournisseurId === 0 ? null : data.fournisseurId,
    };
    // TODO: appeler la server action ici
    executeInsertTicket(payload);
    //
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isSavingTicket;

  return (
    <Form {...form}>
      <TicketForm<InsertTicketFormType>
        mode="create"
        onSubmit={form.handleSubmit(submitForm)}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        clientId={clientId}
        sites={sites}
        fournisseurs={fournisseurs}
      />
    </Form>
  );
}
