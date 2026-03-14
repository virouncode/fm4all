"use client";

import { RhfCheckbox } from "@/components/rhf/RhfCheckbox";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  insertRegleRecurrenceAction,
  updateRegleRecurrenceAction,
} from "@/server/actions/clientServiceReglesRecurrenceActions";
import type { SelectRegleRecurrenceType } from "@/zod-schemas/clientServiceReglesRecurrence.schema";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ==================== SCHEMA LOCAL UI ====================

const JOURS_OPTIONS = [
  { code: "MO", label: "Lun" },
  { code: "TU", label: "Mar" },
  { code: "WE", label: "Mer" },
  { code: "TH", label: "Jeu" },
  { code: "FR", label: "Ven" },
  { code: "SA", label: "Sam" },
  { code: "SU", label: "Dim" },
] as const;

const regleFormSchema = z
  .object({
    libelle: z.string().optional(),
    dtstartLocal: z.string().min(1, "Heure de début obligatoire"),
    fuseauHoraire: z.string(),
    freqType: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    interval: z
      .string()
      .refine(
        (v) =>
          !isNaN(Number(v)) &&
          Number.isInteger(Number(v)) &&
          Number(v) >= 1 &&
          Number(v) <= 52,
        "L'intervalle doit être un entier entre 1 et 52",
      ),
    // Jours de la semaine (pour WEEKLY)
    byDayMO: z.boolean(),
    byDayTU: z.boolean(),
    byDayWE: z.boolean(),
    byDayTH: z.boolean(),
    byDayFR: z.boolean(),
    byDaySA: z.boolean(),
    byDaySU: z.boolean(),
    // Jour du mois (pour MONTHLY)
    byMonthDay: z
      .string()
      .optional()
      .refine(
        (v) =>
          !v ||
          (!isNaN(Number(v)) &&
            Number.isInteger(Number(v)) &&
            Number(v) >= 1 &&
            Number(v) <= 31),
        "Le jour du mois doit être un entier entre 1 et 31",
      ),
    dureePrevueMinutes: z
      .string()
      .optional()
      .refine(
        (v) =>
          !v ||
          (!isNaN(Number(v)) &&
            Number.isInteger(Number(v)) &&
            Number(v) >= 0 &&
            Number(v) <= 1440),
        "La durée doit être un entier entre 0 et 1440 minutes",
      ),
    actif: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.freqType === "WEEKLY") {
      const anyDay =
        data.byDayMO ||
        data.byDayTU ||
        data.byDayWE ||
        data.byDayTH ||
        data.byDayFR ||
        data.byDaySA ||
        data.byDaySU;
      if (!anyDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["byDayMO"],
          message: "Sélectionnez au moins un jour de la semaine",
        });
      }
    }
    if (data.freqType === "MONTHLY" && !data.byMonthDay) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["byMonthDay"],
        message: "Le jour du mois est obligatoire pour une fréquence mensuelle",
      });
    }
  });

type RegleFormValues = z.infer<typeof regleFormSchema>;

// ==================== HELPERS ====================

function buildRruleString(values: RegleFormValues): string {
  const parts = [`FREQ=${values.freqType}`];
  const interval = parseInt(values.interval, 10);
  if (interval > 1) parts.push(`INTERVAL=${interval}`);

  if (values.freqType === "WEEKLY") {
    const days = [
      values.byDayMO && "MO",
      values.byDayTU && "TU",
      values.byDayWE && "WE",
      values.byDayTH && "TH",
      values.byDayFR && "FR",
      values.byDaySA && "SA",
      values.byDaySU && "SU",
    ].filter(Boolean) as string[];
    if (days.length > 0) parts.push(`BYDAY=${days.join(",")}`);
  }

  if (values.freqType === "MONTHLY" && values.byMonthDay) {
    parts.push(`BYMONTHDAY=${values.byMonthDay}`);
  }

  return parts.join(";");
}

function parseRruleToFormValues(
  regle: SelectRegleRecurrenceType,
): Partial<RegleFormValues> {
  const rule = regle.regleRrule;
  const parts = Object.fromEntries(
    rule.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k!, v ?? ""];
    }),
  );

  const freqType =
    parts["FREQ"] === "DAILY"
      ? "DAILY"
      : parts["FREQ"] === "MONTHLY"
        ? "MONTHLY"
        : "WEEKLY";

  const interval = parts["INTERVAL"] ?? "1";

  const byDays = (parts["BYDAY"] ?? "").split(",").filter(Boolean);

  // dtstartLocal: timestamp without timezone from DB → comes as JS Date (UTC)
  const dtstartJs = regle.dtstartLocal as Date;
  const pad = (n: number) => String(n).padStart(2, "0");
  const dtstartStr = `${dtstartJs.getFullYear()}-${pad(dtstartJs.getMonth() + 1)}-${pad(dtstartJs.getDate())}T${pad(dtstartJs.getHours())}:${pad(dtstartJs.getMinutes())}`;

  return {
    libelle: regle.libelle ?? "",
    dtstartLocal: dtstartStr,
    fuseauHoraire: regle.fuseauHoraire,
    freqType,
    interval,
    byDayMO: byDays.includes("MO"),
    byDayTU: byDays.includes("TU"),
    byDayWE: byDays.includes("WE"),
    byDayTH: byDays.includes("TH"),
    byDayFR: byDays.includes("FR"),
    byDaySA: byDays.includes("SA"),
    byDaySU: byDays.includes("SU"),
    byMonthDay: parts["BYMONTHDAY"] ?? "",
    dureePrevueMinutes: regle.dureePrevueMinutes
      ? String(regle.dureePrevueMinutes)
      : "",
    actif: regle.actif,
  };
}

// ==================== COMPONENT ====================

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestation: PrestationListItem;
  regle?: SelectRegleRecurrenceType; // undefined = create mode
  onSuccess: (regle: SelectRegleRecurrenceType) => void;
};

export function RegleRecurrenceFormDialog({
  open,
  onOpenChange,
  prestation,
  regle,
  onSuccess,
}: Props) {
  const isEdit = !!regle;

  const defaultValues: RegleFormValues = {
    libelle: "",
    dtstartLocal: "",
    fuseauHoraire: "Europe/Paris",
    freqType: "WEEKLY",
    interval: "1",
    byDayMO: false,
    byDayTU: false,
    byDayWE: false,
    byDayTH: false,
    byDayFR: false,
    byDaySA: false,
    byDaySU: false,
    byMonthDay: "",
    dureePrevueMinutes: "",
    actif: true,
  };

  const form = useForm<RegleFormValues>({
    resolver: zodResolver(regleFormSchema),
    mode: "onTouched",
    defaultValues,
  });

  const { isSubmitting } = useFormState({ control: form.control });
  const freqType = useWatch({ control: form.control, name: "freqType" });

  useEffect(() => {
    if (open) {
      if (isEdit && regle) {
        form.reset({ ...defaultValues, ...parseRruleToFormValues(regle) });
      } else {
        form.reset(defaultValues);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: RegleFormValues) => {
    const regleRrule = buildRruleString(data);

    const payload = {
      clientServiceId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      libelle: data.libelle || undefined,
      dtstartLocal: data.dtstartLocal,
      fuseauHoraire: data.fuseauHoraire,
      regleRrule,
      dureePrevueMinutes: data.dureePrevueMinutes || undefined,
      actif: data.actif,
    };

    if (isEdit && regle) {
      const result = await updateRegleRecurrenceAction({
        id: regle.id,
        ...payload,
      });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.regle) {
        toast.success("Règle mise à jour.");
        onSuccess(result.data.regle);
        onOpenChange(false);
      }
    } else {
      const result = await insertRegleRecurrenceAction(payload);
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.regle) {
        toast.success("Règle ajoutée.");
        onSuccess(result.data.regle);
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {isEdit ? "Modifier la règle" : "Ajouter une règle de récurrence"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-2">
              {/* Libelle */}
              <RhfInput<RegleFormValues>
                name="libelle"
                label="Libellé (facultatif)"
                placeholder="Ex: Passage du lundi matin"
              />

              {/* Heure de début locale */}
              <RhfInput<RegleFormValues>
                name="dtstartLocal"
                label="Première occurrence (date et heure locales)"
                type="datetime-local"
                requiredMark
              />

              {/* Fuseau horaire */}
              <RhfControlledSelect<RegleFormValues>
                name="fuseauHoraire"
                label="Fuseau horaire"
                selectClassName="w-full"
                requiredMark
              >
                <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </RhfControlledSelect>

              <Separator />

              {/* Fréquence */}
              <RhfControlledSelect<RegleFormValues>
                name="freqType"
                label="Fréquence"
                selectClassName="w-full"
                requiredMark
              >
                <SelectItem value="DAILY">Quotidienne</SelectItem>
                <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                <SelectItem value="MONTHLY">Mensuelle</SelectItem>
              </RhfControlledSelect>

              {/* Intervalle */}
              <RhfInput<RegleFormValues>
                name="interval"
                label={
                  freqType === "DAILY"
                    ? "Tous les N jours"
                    : freqType === "WEEKLY"
                      ? "Toutes les N semaines"
                      : "Tous les N mois"
                }
                type="number"
                min="1"
                max="52"
                requiredMark
              />

              {/* Jours de la semaine (WEEKLY uniquement) */}
              {freqType === "WEEKLY" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Jours de la semaine <span className="ml-0.5">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {JOURS_OPTIONS.map((jour) => (
                      <RhfCheckbox<RegleFormValues>
                        key={jour.code}
                        name={
                          `byDay${jour.code}` as
                            | "byDayMO"
                            | "byDayTU"
                            | "byDayWE"
                            | "byDayTH"
                            | "byDayFR"
                            | "byDaySA"
                            | "byDaySU"
                        }
                        label={jour.label}
                        orientation="horizontal"
                        withError={false}
                      />
                    ))}
                  </div>
                  {form.formState.errors.byDayMO && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.byDayMO.message}
                    </p>
                  )}
                </div>
              )}

              {/* Jour du mois (MONTHLY uniquement) */}
              {freqType === "MONTHLY" && (
                <RhfInput<RegleFormValues>
                  name="byMonthDay"
                  label="Jour du mois"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 15"
                  requiredMark
                />
              )}

              <Separator />

              {/* Durée estimée */}
              <RhfInput<RegleFormValues>
                name="dureePrevueMinutes"
                label="Durée estimée (minutes, facultatif)"
                type="number"
                min="0"
                max="1440"
                placeholder="Ex: 90"
              />

              {/* Actif */}
              <RhfCheckbox<RegleFormValues>
                name="actif"
                label="Règle active"
                orientation="horizontal"
              />
            </div>

            <DialogFooter className="sticky bottom-0 border-t bg-background px-6 py-4">
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
                {isEdit ? "Enregistrer" : "Ajouter la règle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
