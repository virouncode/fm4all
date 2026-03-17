"use client";

import { RhfCheckbox } from "@/components/rhf/RhfCheckbox";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDateTimePicker } from "@/components/rhf/RhfDateTimePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Toggle } from "@/components/ui/toggle";
import {
  insertRegleRecurrenceAction,
  updateRegleRecurrenceAction,
} from "@/server/actions/clientServiceReglesRecurrenceActions";
import type { TacheListeTemplateWithItems } from "@/server/queries/tacheListesTemplates.query";
import type { SelectRegleRecurrenceType } from "@/zod-schemas/clientServiceReglesRecurrence.schema";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime } from "luxon";
import { ClipboardList, Info, Pencil, Repeat, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ChecklistPickerDialog } from "./ChecklistPickerDialog";
import { TacheListeManagerDialog } from "./TacheListeManagerDialog";

// ==================== CONSTANTES ====================

const JOURS_OPTIONS = [
  { code: "MO", label: "L", field: "byDayMO" },
  { code: "TU", label: "M", field: "byDayTU" },
  { code: "WE", label: "M", field: "byDayWE" },
  { code: "TH", label: "J", field: "byDayTH" },
  { code: "FR", label: "V", field: "byDayFR" },
  { code: "SA", label: "S", field: "byDaySA" },
  { code: "SU", label: "D", field: "byDaySU" },
] as const;

const ORDINAL_LABELS: Record<string, string> = {
  "1": "premier",
  "2": "deuxième",
  "3": "troisième",
  "4": "quatrième",
  "-1": "dernier",
};

const DAY_NAMES: Record<string, string> = {
  MO: "lundi",
  TU: "mardi",
  WE: "mercredi",
  TH: "jeudi",
  FR: "vendredi",
  SA: "samedi",
  SU: "dimanche",
};

// ==================== SCHEMA LOCAL ====================

const regleFormSchema = z
  .object({
    libelle: z.string().optional(),
    dtstartLocal: z.string().min(1, "Date de début obligatoire"),
    fuseauHoraire: z.string(),
    freqMode: z.enum(["daily", "weekly", "monthly", "weekdays"]),
    interval: z.string().refine(
      (v) =>
        !isNaN(Number(v)) &&
        Number.isInteger(Number(v)) &&
        Number(v) >= 1 &&
        Number(v) <= 52,
      "Entre 1 et 52",
    ),
    // Hebdomadaire — jours cochés
    byDayMO: z.boolean(),
    byDayTU: z.boolean(),
    byDayWE: z.boolean(),
    byDayTH: z.boolean(),
    byDayFR: z.boolean(),
    byDaySA: z.boolean(),
    byDaySU: z.boolean(),
    // Mensuel — sous-mode
    monthlyMode: z.enum(["byMonthDay", "byWeekday"]),
    byMonthDay: z.string().optional(),
    byWeekdayOrdinal: z.enum(["1", "2", "3", "4", "-1"]),
    byWeekdayDay: z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]),
    dureePrevueMinutes: z.string().optional().refine(
      (v) =>
        !v ||
        (!isNaN(Number(v)) &&
          Number.isInteger(Number(v)) &&
          Number(v) >= 0 &&
          Number(v) <= 1440),
      "Entre 0 et 1440 minutes",
    ),
    actif: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.freqMode === "weekly") {
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
          code: "custom",
          path: ["byDayMO"],
          message: "Sélectionnez au moins un jour",
        });
      }
    }
    if (
      data.freqMode === "monthly" &&
      data.monthlyMode === "byMonthDay" &&
      !data.byMonthDay
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["byMonthDay"],
        message: "Sélectionnez un jour du mois",
      });
    }
  });

type RegleFormValues = z.infer<typeof regleFormSchema>;

// ==================== HELPERS ====================

function getByDayCode(dtstartLocal: string): string | null {
  if (!dtstartLocal) return null;
  const d = DateTime.fromISO(dtstartLocal);
  if (!d.isValid) return null;
  // Luxon weekday : 1=Lun … 7=Dim
  return ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][d.weekday - 1] ?? null;
}

function getDayOfMonth(dtstartLocal: string): number | null {
  if (!dtstartLocal) return null;
  const d = DateTime.fromISO(dtstartLocal);
  if (!d.isValid) return null;
  return d.day;
}

function buildRruleString(values: RegleFormValues): string {
  const {
    freqMode,
    interval,
    monthlyMode,
    byMonthDay,
    byWeekdayOrdinal,
    byWeekdayDay,
  } = values;
  const n = parseInt(interval, 10);
  const intervalPart = n > 1 ? `;INTERVAL=${n}` : "";

  if (freqMode === "weekdays") return "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";

  if (freqMode === "daily") return `FREQ=DAILY${intervalPart}`;

  if (freqMode === "weekly") {
    const days = JOURS_OPTIONS.map((j) => values[j.field] && j.code)
      .filter(Boolean)
      .join(",");
    return `FREQ=WEEKLY${intervalPart}${days ? `;BYDAY=${days}` : ""}`;
  }

  // monthly
  if (monthlyMode === "byWeekday") {
    return `FREQ=MONTHLY${intervalPart};BYDAY=${byWeekdayOrdinal}${byWeekdayDay}`;
  }
  return `FREQ=MONTHLY${intervalPart}${byMonthDay ? `;BYMONTHDAY=${byMonthDay}` : ""}`;
}

function detectFreqMode(rrule: string): RegleFormValues["freqMode"] {
  const parts = Object.fromEntries(
    rrule.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k!, v ?? ""];
    }),
  );
  const freq = parts["FREQ"];
  const byday = parts["BYDAY"] ?? "";
  if (freq === "DAILY") return "daily";
  if (freq === "MONTHLY") return "monthly";
  if (freq === "WEEKLY" && byday === "MO,TU,WE,TH,FR") return "weekdays";
  return "weekly";
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

  const dtstartJs = regle.dtstartLocal as Date;
  const dtstartStr =
    DateTime.fromObject(
      {
        year: dtstartJs.getUTCFullYear(),
        month: dtstartJs.getUTCMonth() + 1,
        day: dtstartJs.getUTCDate(),
        hour: dtstartJs.getUTCHours(),
        minute: dtstartJs.getUTCMinutes(),
      },
      { zone: regle.fuseauHoraire },
    ).toISO() ?? "";

  const freqMode = detectFreqMode(rule);
  const interval = parts["INTERVAL"] ?? "1";
  const byDays = (parts["BYDAY"] ?? "").split(",").filter(Boolean);

  // Mensuel byWeekday : BYDAY comme "1MO", "-1FR"
  const byWeekdayMatch = parts["BYDAY"]?.match(/^(-?[1-4])([A-Z]{2})$/);
  const monthlyMode: RegleFormValues["monthlyMode"] = byWeekdayMatch
    ? "byWeekday"
    : "byMonthDay";
  const byWeekdayOrdinal = (byWeekdayMatch?.[1] ?? "1") as RegleFormValues["byWeekdayOrdinal"];
  const byWeekdayDay = (byWeekdayMatch?.[2] ?? "MO") as RegleFormValues["byWeekdayDay"];

  return {
    libelle: regle.libelle ?? "",
    dtstartLocal: dtstartStr,
    fuseauHoraire: regle.fuseauHoraire,
    freqMode,
    interval,
    byDayMO: byDays.includes("MO"),
    byDayTU: byDays.includes("TU"),
    byDayWE: byDays.includes("WE"),
    byDayTH: byDays.includes("TH"),
    byDayFR: byDays.includes("FR"),
    byDaySA: byDays.includes("SA"),
    byDaySU: byDays.includes("SU"),
    monthlyMode,
    byMonthDay: parts["BYMONTHDAY"] ?? "",
    byWeekdayOrdinal,
    byWeekdayDay,
    dureePrevueMinutes: regle.dureePrevueMinutes
      ? String(regle.dureePrevueMinutes)
      : "",
    actif: regle.actif,
  };
}

function buildSummary(values: Partial<RegleFormValues>): string {
  const { freqMode, interval, dtstartLocal, monthlyMode } = values;
  if (!freqMode || !dtstartLocal) return "";

  const n = interval ? parseInt(interval, 10) : 1;
  const ordinal = (d: number) => (d === 1 ? "1er" : `${d}`);
  const plural = (n: number, singular: string, plural: string) =>
    n <= 1 ? singular : plural;

  if (freqMode === "weekdays")
    return "Une intervention aura lieu chaque jour ouvré (lundi au vendredi).";

  if (freqMode === "daily") {
    return n === 1
      ? "Une intervention aura lieu chaque jour."
      : `Une intervention aura lieu tous les ${n} jours.`;
  }

  if (freqMode === "weekly") {
    const selectedDays = JOURS_OPTIONS.filter((j) => values[j.field]).map(
      (j) => DAY_NAMES[j.code] ?? j.code,
    );
    const freqStr =
      n === 1
        ? "chaque semaine"
        : `toutes les ${n} ${plural(n, "semaine", "semaines")}`;
    if (selectedDays.length === 0)
      return `Une intervention aura lieu ${freqStr}.`;
    return `Une intervention aura lieu ${freqStr} le ${selectedDays.join(", ")}.`;
  }

  if (freqMode === "monthly") {
    const freqStr =
      n === 1
        ? "chaque mois"
        : `tous les ${n} ${plural(n, "mois", "mois")}`;
    if (monthlyMode === "byWeekday") {
      const ordinalLabel =
        ORDINAL_LABELS[values.byWeekdayOrdinal ?? "1"] ?? "premier";
      const dayLabel = DAY_NAMES[values.byWeekdayDay ?? "MO"] ?? "";
      return `Une intervention aura lieu le ${ordinalLabel} ${dayLabel} ${freqStr}.`;
    }
    const dom = values.byMonthDay ? parseInt(values.byMonthDay) : null;
    if (!dom || isNaN(dom))
      return `Une intervention aura lieu ${freqStr}.`;
    return `Une intervention aura lieu le ${ordinal(dom)} ${freqStr}.`;
  }

  return "";
}

// ==================== COMPONENT ====================

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestation: PrestationListItem;
  regle?: SelectRegleRecurrenceType;
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

  const minDateStr = prestation.dateDebut
    ? DateTime.fromJSDate(prestation.dateDebut).toFormat("yyyy-MM-dd")
    : undefined;
  const maxDateStr = prestation.dateFin
    ? DateTime.fromJSDate(prestation.dateFin).toFormat("yyyy-MM-dd")
    : undefined;

  const [checklistPickerOpen, setChecklistPickerOpen] = useState(false);
  const [checklistManagerOpen, setChecklistManagerOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<TacheListeTemplateWithItems | null>(null);
  // Tracks the tacheListeTemplateId to send — separate from selectedChecklist so that
  // in edit mode the original ID is preserved even if the user never re-opens the picker.
  const [tacheListeTemplateId, setTacheListeTemplateId] = useState<string | null>(null);

  const defaultValues: RegleFormValues = {
    libelle: "",
    dtstartLocal: "",
    fuseauHoraire: "Europe/Paris",
    freqMode: "weekly",
    interval: "1",
    byDayMO: false,
    byDayTU: false,
    byDayWE: false,
    byDayTH: false,
    byDayFR: false,
    byDaySA: false,
    byDaySU: false,
    monthlyMode: "byMonthDay",
    byMonthDay: "",
    byWeekdayOrdinal: "1",
    byWeekdayDay: "MO",
    dureePrevueMinutes: "",
    actif: true,
  };

  const form = useForm<RegleFormValues>({
    resolver: zodResolver(regleFormSchema),
    mode: "onTouched",
    defaultValues,
  });

  const { isSubmitting } = useFormState({ control: form.control });
  const watched = useWatch({ control: form.control });
  const freqMode = watched.freqMode ?? "weekly";
  const monthlyMode = watched.monthlyMode ?? "byMonthDay";
  const summary = buildSummary(watched);

  useEffect(() => {
    if (open) {
      setSelectedChecklist(null);
      setTacheListeTemplateId(regle?.tacheListeTemplateId ?? null);
      if (isEdit && regle) {
        form.reset({ ...defaultValues, ...parseRruleToFormValues(regle) });
      } else {
        form.reset(defaultValues);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // En création : pré-sélectionner le jour depuis dtstartLocal
  useEffect(() => {
    if (isEdit || !watched.dtstartLocal) return;
    const byDayCode = getByDayCode(watched.dtstartLocal);
    const dom = getDayOfMonth(watched.dtstartLocal);

    const anyDaySelected = JOURS_OPTIONS.some((j) => form.getValues(j.field));
    if (!anyDaySelected && byDayCode) {
      JOURS_OPTIONS.forEach((j) =>
        form.setValue(j.field, j.code === byDayCode),
      );
    }

    if (!form.getValues("byMonthDay") && dom) {
      form.setValue("byMonthDay", String(dom));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched.dtstartLocal, isEdit]);

  const onSubmit = async (data: RegleFormValues) => {
    const regleRrule = buildRruleString(data);

    // RhfDateTimePicker produit une ISO avec timezone → wall-clock pour le serveur
    const dtstartWallClock = DateTime.fromISO(data.dtstartLocal, {
      zone: data.fuseauHoraire,
    }).toFormat("yyyy-MM-dd'T'HH:mm:ss");

    const payload = {
      clientServiceId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      libelle: data.libelle || undefined,
      dtstartLocal: dtstartWallClock,
      fuseauHoraire: data.fuseauHoraire,
      regleRrule,
      dureePrevueMinutes: data.dureePrevueMinutes || undefined,
      actif: data.actif,
      tacheListeTemplateId: selectedChecklist
        ? selectedChecklist.id
        : tacheListeTemplateId,
    };

    if (isEdit && regle) {
      const result = await updateRegleRecurrenceAction({ id: regle.id, ...payload });
      if (result?.serverError) { toast.error(result.serverError.message); return; }
      if (result?.data?.regle) {
        toast.success("Règle mise à jour.");
        onSuccess(result.data.regle);
        onOpenChange(false);
      }
    } else {
      const result = await insertRegleRecurrenceAction(payload);
      if (result?.serverError) { toast.error(result.serverError.message); return; }
      if (result?.data?.regle) {
        toast.success("Règle ajoutée.");
        onSuccess(result.data.regle);
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="flex max-h-[90vh] max-w-lg flex-col">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Repeat className="text-primary h-4 w-4" />{isEdit ? "Modifier la règle" : "Ajouter une règle de récurrence"}</DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 pb-2">

              {/* Libellé */}
              <RhfInput<RegleFormValues>
                name="libelle"
                label="Libellé (facultatif)"
                placeholder="Ex: Passage du lundi matin"
              />

              {/* Première occurrence */}
              <div className="space-y-1.5">
                <RhfDateTimePicker<RegleFormValues>
                  name="dtstartLocal"
                  label="Première occurrence"
                  timeFormat="24"
                  defaultTime={{ hour: 8, minute: 0 }}
                  requiredMark
                  min={minDateStr}
                  max={maxDateStr}
                />
                <div className="flex items-start gap-1.5 rounded-md bg-muted/50 px-2 py-1.5">
                  <Info className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p className="text-muted-foreground text-xs">
                    Une intervention n&apos;est générée que si une{" "}
                    <strong>exécution valide</strong> (prestataire) couvre sa date. Si aucune
                    exécution ne couvre la période de la première occurrence, cette date sera
                    ignorée — les interventions reprendront dès qu&apos;une exécution
                    compatible sera configurée.
                  </p>
                </div>
              </div>

              {/* Fuseau horaire — forcé Europe/Paris */}
              <RhfControlledSelect<RegleFormValues>
                name="fuseauHoraire"
                label="Fuseau horaire"
                selectClassName="w-full"
                disabled
              >
                <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
              </RhfControlledSelect>

              <Separator />

              {/* ===== RÉCURRENCE — style iCal ===== */}

              {/* Sélecteur de mode */}
              <RhfControlledSelect<RegleFormValues>
                name="freqMode"
                label="Récurrence"
                selectClassName="w-full"
                requiredMark
              >
                <SelectItem value="daily">Tous les jours</SelectItem>
                <SelectItem value="weekly">Toutes les semaines</SelectItem>
                <SelectItem value="monthly">Tous les mois</SelectItem>
                <SelectItem value="weekdays">Tous les jours ouvrés</SelectItem>
              </RhfControlledSelect>

              {/* ── Quotidien ── */}
              {freqMode === "daily" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">Tous les</span>
                  <RhfInput<RegleFormValues>
                    name="interval"
                    type="number"
                    min="1"
                    max="52"
                    inputClassName="w-20"
                    withError={false}
                  />
                  <span className="text-sm text-muted-foreground shrink-0">jours</span>
                </div>
              )}

              {/* ── Hebdomadaire ── */}
              {freqMode === "weekly" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Toutes les</span>
                    <RhfInput<RegleFormValues>
                      name="interval"
                      type="number"
                      min="1"
                      max="52"
                      inputClassName="w-20"
                      withError={false}
                    />
                    <span className="text-sm text-muted-foreground shrink-0">semaines le :</span>
                  </div>
                  <div className="flex gap-1.5">
                    {JOURS_OPTIONS.map((jour) => (
                      <Toggle
                        key={jour.code}
                        variant="outline"
                        size="sm"
                        pressed={watched[jour.field] ?? false}
                        onPressedChange={(v) =>
                          form.setValue(jour.field, v, { shouldValidate: true })
                        }
                        type="button"
                        className="w-9 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        {jour.label}
                      </Toggle>
                    ))}
                  </div>
                  {form.formState.errors.byDayMO && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.byDayMO.message}
                    </p>
                  )}
                </div>
              )}

              {/* ── Mensuel ── */}
              {freqMode === "monthly" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Tous les</span>
                    <RhfInput<RegleFormValues>
                      name="interval"
                      type="number"
                      min="1"
                      max="12"
                      inputClassName="w-20"
                      withError={false}
                    />
                    <span className="text-sm text-muted-foreground shrink-0">mois</span>
                  </div>

                  {/* Radio : par jour du mois ou par Nème jour de semaine */}
                  <div className="space-y-3">
                    {/* Option 1 — Tous les [N] du mois */}
                    <div
                      role="radio"
                      aria-checked={monthlyMode === "byMonthDay"}
                      tabIndex={0}
                      className="flex w-full cursor-pointer items-start gap-2 text-left"
                      onClick={() => form.setValue("monthlyMode", "byMonthDay")}
                      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") form.setValue("monthlyMode", "byMonthDay"); }}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${monthlyMode === "byMonthDay" ? "border-primary" : "border-muted-foreground/40"}`}
                      >
                        {monthlyMode === "byMonthDay" && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </span>
                      <div className="space-y-2">
                        <span className={`text-sm ${monthlyMode === "byMonthDay" ? "text-primary font-medium" : ""}`}>Tous les</span>
                        {monthlyMode === "byMonthDay" && (
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                              <Toggle
                                key={d}
                                variant="outline"
                                size="sm"
                                pressed={watched.byMonthDay === String(d)}
                                onPressedChange={(v) => {
                                  if (v)
                                    form.setValue("byMonthDay", String(d), {
                                      shouldValidate: true,
                                    });
                                }}
                                type="button"
                                className="w-9 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                              >
                                {d}
                              </Toggle>
                            ))}
                          </div>
                        )}
                        {form.formState.errors.byMonthDay && monthlyMode === "byMonthDay" && (
                          <p className="text-destructive text-xs">
                            {form.formState.errors.byMonthDay.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Option 2 — Le [premier] [lundi] */}
                    <div
                      role="radio"
                      aria-checked={monthlyMode === "byWeekday"}
                      tabIndex={0}
                      className="flex w-full cursor-pointer items-center gap-2 text-left"
                      onClick={() => form.setValue("monthlyMode", "byWeekday")}
                      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") form.setValue("monthlyMode", "byWeekday"); }}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${monthlyMode === "byWeekday" ? "border-primary" : "border-muted-foreground/40"}`}
                      >
                        {monthlyMode === "byWeekday" && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </span>
                      <span className={`text-sm ${monthlyMode === "byWeekday" ? "text-primary font-medium" : ""}`}>Le</span>
                      <RhfControlledSelect<RegleFormValues>
                        name="byWeekdayOrdinal"
                        selectClassName="w-32"
                        disabled={monthlyMode !== "byWeekday"}
                      >
                        <SelectItem value="1">premier</SelectItem>
                        <SelectItem value="2">deuxième</SelectItem>
                        <SelectItem value="3">troisième</SelectItem>
                        <SelectItem value="4">quatrième</SelectItem>
                        <SelectItem value="-1">dernier</SelectItem>
                      </RhfControlledSelect>
                      <RhfControlledSelect<RegleFormValues>
                        name="byWeekdayDay"
                        selectClassName="w-32"
                        disabled={monthlyMode !== "byWeekday"}
                      >
                        <SelectItem value="MO">lundi</SelectItem>
                        <SelectItem value="TU">mardi</SelectItem>
                        <SelectItem value="WE">mercredi</SelectItem>
                        <SelectItem value="TH">jeudi</SelectItem>
                        <SelectItem value="FR">vendredi</SelectItem>
                        <SelectItem value="SA">samedi</SelectItem>
                        <SelectItem value="SU">dimanche</SelectItem>
                      </RhfControlledSelect>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Résumé en langage naturel ── */}
              {summary && (
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {summary}
                </p>
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

              <Separator />

              {/* Checklist */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Label>Checklist (facultatif)</Label>
                    {selectedChecklist ? (
                      <div className="flex items-center gap-2 overflow-hidden rounded-md border px-3 py-2">
                        <ClipboardList className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {selectedChecklist.nom}
                        </span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground shrink-0"
                          onClick={() => {
                            setSelectedChecklist(null);
                            setTacheListeTemplateId(null);
                          }}
                          aria-label="Retirer la checklist"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : tacheListeTemplateId ? (
                      <div className="flex items-center gap-2 overflow-hidden rounded-md border border-dashed px-3 py-2">
                        <ClipboardList className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs italic">
                          Checklist assignée — cliquez sur &laquo;&nbsp;Modifier&nbsp;&raquo; pour la changer
                        </span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground shrink-0"
                          onClick={() => setTacheListeTemplateId(null)}
                          aria-label="Retirer la checklist"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs italic">
                        Aucune — hérite de la checklist de l&apos;exécution (si définie).
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5 pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setChecklistPickerOpen(true)}
                    >
                      <Pencil className="h-3 w-3" />
                      Modifier
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setChecklistManagerOpen(true)}
                    >
                      Gérer les checklists
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-md bg-muted/50 px-2 py-1.5">
                  <Info className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p className="text-muted-foreground text-xs">
                    <strong>1 règle = 1 checklist.</strong> Pour des tâches différentes selon le jour
                    (ex : vitres le lundi, sol le vendredi), créez une règle par jour avec sa propre checklist.
                  </p>
                </div>
              </div>
            </div>

            <ChecklistPickerDialog
              open={checklistPickerOpen}
              onOpenChange={setChecklistPickerOpen}
              serviceId={prestation.serviceId}
              entrepriseId={prestation.entrepriseId}
              currentPackId={
                selectedChecklist
                  ? selectedChecklist.id
                  : tacheListeTemplateId
              }
              onSelect={(pack) => {
                setSelectedChecklist(pack);
                setTacheListeTemplateId(pack?.id ?? null);
              }}
            />
            <TacheListeManagerDialog
              open={checklistManagerOpen}
              onOpenChange={setChecklistManagerOpen}
              serviceId={prestation.serviceId}
              serviceNom={prestation.serviceNom}
              proprietaireEntrepriseId={prestation.entrepriseId}
            />

            <DialogStyledFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="size-3" /> : <Repeat className="size-3" />}
                {isEdit ? "Enregistrer" : "Ajouter la règle"}
              </Button>
            </DialogStyledFooter>
          </form>
        </Form>
      </DialogStyledContent>
    </Dialog>
  );
}
