"use client";

import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { insertOccurrenceOnDemandAction } from "@/server/actions/clientServiceOccurrencesActions";
import type { OccurrenceListItem } from "@/server/queries/clientServiceExecutions.query";
import {
  insertOccurrenceOnDemandFormSchema,
  type InsertOccurrenceOnDemandFormType,
} from "@/zod-schemas/clientServiceOccurrences.schema";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestation: PrestationListItem;
  onSuccess: (occurrence: OccurrenceListItem) => void;
};

export function OccurrenceOnDemandDialog({
  open,
  onOpenChange,
  prestation,
  onSuccess,
}: Props) {
  const form = useForm<InsertOccurrenceOnDemandFormType>({
    resolver: zodResolver(insertOccurrenceOnDemandFormSchema),
    mode: "onTouched",
    defaultValues: {
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      dateDebutPrevue: "",
      dateFinPrevue: "",
      notes: "",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        prestationId: prestation.id,
        entrepriseId: prestation.entrepriseId,
        dateDebutPrevue: "",
        dateFinPrevue: "",
        notes: "",
      });
    }
  }, [open, prestation.id, prestation.entrepriseId, form]);

  const onSubmit = async (data: InsertOccurrenceOnDemandFormType) => {
    const result = await insertOccurrenceOnDemandAction({
      prestationId: data.prestationId,
      entrepriseId: data.entrepriseId,
      dateDebutPrevue: data.dateDebutPrevue,
      dateFinPrevue: data.dateFinPrevue || undefined,
      notes: data.notes || undefined,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data?.occurrence) {
      toast.success("Passage créé avec succès.");
      onSuccess(result.data.occurrence);
      onOpenChange(false);
    }
  };

  const isExceptionnel = prestation.modePlanning === "planifie";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une intervention</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 py-2"
          >
            {isExceptionnel && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">
                  Passage exceptionnel
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  Cette prestation utilise un planning automatique. Ce passage
                  s&apos;ajoutera en dehors du planning habituel.
                </AlertDescription>
              </Alert>
            )}

            <RhfInput<InsertOccurrenceOnDemandFormType>
              name="dateDebutPrevue"
              label="Date et heure de début"
              type="datetime-local"
              requiredMark
            />

            <RhfInput<InsertOccurrenceOnDemandFormType>
              name="dateFinPrevue"
              label="Date et heure de fin (facultatif)"
              type="datetime-local"
            />

            <RhfTextArea<InsertOccurrenceOnDemandFormType>
              name="notes"
              label="Notes / instructions (facultatif)"
              placeholder="Précisions sur l'intervention…"
              rows={3}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner />}
                Créer le passage
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
