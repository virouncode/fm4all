"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { insertTicketAction } from "@/server/actions/ticketsActions";
import { useAppStore } from "@/stores/application/appStore";
import {
  insertTicketFormSchema,
  type InsertTicketFormType,
  type SelectTicketType,
} from "@/zod-schemas/ticket.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

interface TicketFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (ticket: SelectTicketType) => void;
}

export function TicketFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: TicketFormDialogProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const [sites, setSites] = useState<Array<{ id: string; nom: string }>>([]);

  const form = useForm<InsertTicketFormType>({
    resolver: zodResolver(insertTicketFormSchema),
    mode: "onTouched",
    defaultValues: {
      titre: "",
      description: "",
      type: "demande",
      priorite: "normale",
      siteId: "",
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  // Load sites
  useEffect(() => {
    if (!entreprise?.id || !open) return;

    async function loadSites() {
      try {
        const result = await getAccessibleSitesAction({
          entrepriseId: entreprise!.id,
        });

        if (result?.data) {
          setSites(result.data.map((s) => ({ id: s.id, nom: s.nom })));
        }
      } catch {
        toast.error("Erreur lors du chargement des sites");
      }
    }

    loadSites();
  }, [entreprise, open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        titre: "",
        description: "",
        type: "demande",
        priorite: "normale",
        siteId: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (data: InsertTicketFormType) => {
    if (!entreprise?.id) return;

    const result = await insertTicketAction({
      ...data,
      entrepriseId: entreprise.id,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data?.ticket) {
      toast.success("Ticket créé avec succès");
      onSuccess(result.data.ticket);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau ticket</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <RhfInput<InsertTicketFormType>
              name="titre"
              label="Titre"
              requiredMark
              placeholder="Résumé du problème ou de la demande"
            />

            <RhfTextArea<InsertTicketFormType>
              name="description"
              label="Description"
              placeholder="Détails supplémentaires..."
              rows={4}
            />

            <div className="grid grid-cols-2 gap-4">
              <RhfControlledSelect<InsertTicketFormType>
                name="type"
                label="Type"
                requiredMark
              >
                <SelectItem value="incident">Incident</SelectItem>
                <SelectItem value="demande">Demande</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </RhfControlledSelect>

              <RhfControlledSelect<InsertTicketFormType>
                name="priorite"
                label="Priorité"
                requiredMark
              >
                <SelectItem value="critique">Critique</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="normale">Normale</SelectItem>
                <SelectItem value="basse">Basse</SelectItem>
              </RhfControlledSelect>
            </div>

            <RhfControlledSelect<InsertTicketFormType>
              name="siteId"
              label="Site concerné"
              requiredMark
              placeholder="Sélectionnez un site"
            >
              {sites.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nom}
                </SelectItem>
              ))}
            </RhfControlledSelect>

            <DialogFooter className="bg-background flex shrink-0 justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Création..." : "Créer le ticket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
