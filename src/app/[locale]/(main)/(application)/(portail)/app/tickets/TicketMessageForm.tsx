"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { insertTicketMessageAction } from "@/server/actions/ticketsActions";
import { useAppStore } from "@/stores/application/appStore";
import {
  insertTicketMessageFormSchema,
  type InsertTicketMessageFormType,
} from "@/zod-schemas/ticket.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

interface TicketMessageFormProps {
  ticketId: string;
  onSuccess: () => void;
}

export function TicketMessageForm({
  ticketId,
  onSuccess,
}: TicketMessageFormProps) {
  const entreprise = useAppStore((state) => state.entreprise);

  const form = useForm<InsertTicketMessageFormType>({
    resolver: zodResolver(insertTicketMessageFormSchema),
    mode: "onTouched",
    defaultValues: {
      message: "",
      visibilite: "public",
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  // Reset form after successful submit
  useEffect(() => {
    if (!isSubmitting && !isDirty) {
      form.reset();
    }
  }, [isSubmitting, isDirty, form]);

  const onSubmit = async (data: InsertTicketMessageFormType) => {
    if (!entreprise?.id) return;

    const result = await insertTicketMessageAction({
      ...data,
      ticketId,
      entrepriseId: entreprise.id,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data?.message) {
      toast.success("Message ajouté");
      form.reset({ message: "", visibilite: "public" });
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <RhfTextArea<InsertTicketMessageFormType>
          name="message"
          label="Nouveau message"
          placeholder="Écrivez votre message..."
          rows={3}
          requiredMark
        />

        <div className="flex items-end justify-between">
          <RhfControlledSelect<InsertTicketMessageFormType>
            name="visibilite"
            label="Visibilité"
            requiredMark
          >
            <SelectItem value="public">Public (tous)</SelectItem>
            <SelectItem value="client_only">Client uniquement</SelectItem>
            <SelectItem value="fournisseur_only">
              Fournisseur uniquement
            </SelectItem>
            <SelectItem value="fm4all_only">FM4ALL uniquement</SelectItem>
          </RhfControlledSelect>

          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Envoi..." : "Envoyer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
