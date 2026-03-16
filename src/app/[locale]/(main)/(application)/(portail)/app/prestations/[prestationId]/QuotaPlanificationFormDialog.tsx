"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { upsertQuotaPlanificationAction } from "@/server/actions/clientServiceReglesRecurrenceActions";
import {
  periodeQuotaSchema,
  modeAncragePeriodeSchema,
} from "@/zod-schemas/clientServiceReglesRecurrence.schema";
import { z } from "zod";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { zodResolver } from "@hookform/resolvers/zod";

// Local form schema without .default() (per CLAUDE.md rule)
const quotaFormSchema = z.object({
  clientServiceId: z.uuid(),
  nbOccurrencesParPeriode: z
    .string()
    .refine(
      (v) =>
        !isNaN(Number(v)) &&
        Number(v) >= 1 &&
        Number(v) <= 52 &&
        Number.isInteger(Number(v)),
      "Le nombre d'occurrences doit être un entier entre 1 et 52",
    ),
  periodeQuota: periodeQuotaSchema,
  modeAncragePeriode: modeAncragePeriodeSchema,
  notes: z.string().optional(),
});
type QuotaFormValues = z.infer<typeof quotaFormSchema>;
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type QuotaRow = {
  nbOccurrencesParPeriode: number;
  periodeQuota: "trimestre" | "semestre" | "annee";
  modeAncragePeriode: "contrat" | "civil";
  notes: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestation: PrestationListItem;
  quota?: QuotaRow | null;
  onSuccess: () => void;
};

export function QuotaPlanificationFormDialog({
  open,
  onOpenChange,
  prestation,
  quota,
  onSuccess,
}: Props) {
  const isEdit = !!quota;

  const form = useForm<QuotaFormValues>({
    resolver: zodResolver(quotaFormSchema),
    mode: "onTouched",
    defaultValues: {
      clientServiceId: prestation.id,
      nbOccurrencesParPeriode: quota
        ? String(quota.nbOccurrencesParPeriode)
        : "1",
      periodeQuota: quota?.periodeQuota ?? "annee",
      modeAncragePeriode: quota?.modeAncragePeriode ?? "contrat",
      notes: quota?.notes ?? "",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  useEffect(() => {
    if (open) {
      form.reset({
        clientServiceId: prestation.id,
        nbOccurrencesParPeriode: quota
          ? String(quota.nbOccurrencesParPeriode)
          : "1",
        periodeQuota: quota?.periodeQuota ?? "annee",
        modeAncragePeriode: quota?.modeAncragePeriode ?? "contrat",
        notes: quota?.notes ?? "",
      });
    }
  }, [open, quota, prestation.id, form]);

  const onSubmit = async (data: QuotaFormValues) => {
    const result = await upsertQuotaPlanificationAction({
      ...data,
      entrepriseId: prestation.entrepriseId,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      toast.success(isEdit ? "Quota mis à jour." : "Quota configuré.");
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="sm:max-w-md">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Modifier le quota" : "Configurer le quota de planification"}
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <DialogStyledBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <RhfInput<QuotaFormValues>
                name="nbOccurrencesParPeriode"
                label="Nombre d'occurrences par période"
                type="number"
                min="1"
                max="52"
                requiredMark
              />

              <RhfControlledSelect<QuotaFormValues>
                name="periodeQuota"
                label="Période de référence"
                selectClassName="w-full"
                requiredMark
              >
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="semestre">Semestre</SelectItem>
                <SelectItem value="annee">Année</SelectItem>
              </RhfControlledSelect>

              <RhfControlledSelect<QuotaFormValues>
                name="modeAncragePeriode"
                label="Mode d'ancrage de la période"
                selectClassName="w-full"
              >
                <SelectItem value="contrat">
                  Date de contrat (date de début de prestation)
                </SelectItem>
                <SelectItem value="civil">Calendrier civil</SelectItem>
              </RhfControlledSelect>

              <RhfTextArea<QuotaFormValues>
                name="notes"
                label="Notes (facultatif)"
                placeholder="Instructions sur la planification…"
                rows={3}
              />
            </form>
          </Form>
        </DialogStyledBody>

        <DialogStyledFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner />}
            {isEdit ? "Enregistrer" : "Configurer"}
          </Button>
        </DialogStyledFooter>
      </DialogStyledContent>
    </Dialog>
  );
}
