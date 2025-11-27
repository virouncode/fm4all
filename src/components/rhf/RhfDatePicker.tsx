import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { TIMEZONE } from "@/constants/time";
import { CalendarIcon, X } from "lucide-react";
import { DateTime } from "luxon";
import { useMemo, useState, type ReactElement } from "react";
import { type Matcher } from "react-day-picker";
import {
  useFormContext,
  type FieldValues,
  type Path,
  type PathValue,
} from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

// ===================== Types utilitaires =====================

type BaseProps = React.ComponentPropsWithoutRef<typeof Button>;

type StringFieldPath<S extends FieldValues> = {
  [K in Path<S>]: PathValue<S, K> extends string | null | undefined ? K : never;
}[Path<S>];

type CommonProps<S extends FieldValues> = {
  id?: string;
  label?: string;
  description?: string;
  orientation?: "horizontal" | "vertical";
  requiredMark?: boolean;
  className?: string;
  buttonClassName?: string;
  ref?: React.Ref<HTMLButtonElement>;
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  /**
   * Borne minimale, au format ISO "YYYY-MM-DD"
   */
  min?: string;
  /**
   * Borne maximale, au format ISO "YYYY-MM-DD"
   */
  max?: string;
  /**
   * Fuseau sur lequel se baser pour interpréter les dates civiles.
   * Par défaut : TIMEZONE (fuseau de la clinique)
   */
  zone?: string;
  withError?: boolean;
  name: StringFieldPath<S>;
} & Omit<BaseProps, "onBlur">;

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.RefObject<T | null>).current = value;
}

// ===================== Composant =====================

export function RhfDatePicker<S extends FieldValues>(
  props: CommonProps<S>,
): ReactElement {
  const {
    id: idProp,
    label,
    name,
    description,
    orientation = "vertical",
    requiredMark,
    className,
    buttonClassName,
    ref: parentRef,
    onChange,
    onBlur,
    min,
    max,
    zone = TIMEZONE,
    withError = true,
    ...buttonProps
  } = props;

  const [open, setOpen] = useState(false);
  const { control } = useFormContext<S>();

  const id = idProp ?? String(name).replace(/\./g, "_");
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  // Borne min/max en DateTime (dans le fuseau clinique)
  const minDt = useMemo(
    () => (min ? DateTime.fromISO(min, { zone }).startOf("day") : null),
    [min, zone],
  );

  const maxDt = useMemo(
    () => (max ? DateTime.fromISO(max, { zone }).endOf("day") : null),
    [max, zone],
  );

  // Borne min/max pour react-day-picker (en Date JS)
  const fromDate = minDt?.toJSDate();
  const toDate = maxDt?.toJSDate();

  const hiddenMatchers = useMemo<Matcher[] | undefined>(() => {
    const arr: Matcher[] = [];
    if (fromDate) arr.push({ before: fromDate });
    if (toDate) arr.push({ after: toDate });
    return arr.length ? arr : undefined;
  }, [fromDate, toDate]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const describedBy = cn(descriptionId, hasError ? errorId : undefined);

        const rawValue = field.value as string | null | undefined;
        const isEmpty =
          rawValue == null ||
          (typeof rawValue === "string" && rawValue.trim() === "");

        const dt = !isEmpty
          ? DateTime.fromISO(rawValue as string, { zone })
          : null;

        const selectedDate = dt?.toJSDate();

        const defaultMonth =
          selectedDate ??
          fromDate ?? // si min est défini, on ouvre sur lui
          new Date();

        const buttonLabel = dt?.toFormat("yyyy-LL-dd") ?? "Choisr une date";

        return (
          <FormItem
            className={cn(
              "gap-2",
              orientation === "horizontal"
                ? "flex flex-row items-center"
                : "flex flex-col",
              className,
            )}
          >
            {/* LABEL */}
            {label && (
              <FormLabel id={`${id}-label`} className="text-sm">
                {label}
                {requiredMark && <span aria-hidden="true">*</span>}
              </FormLabel>
            )}

            <FormControl>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    id={id}
                    {...buttonProps}
                    ref={(node) => {
                      field.ref(node);
                      assignRef(parentRef, node);
                    }}
                    className={cn(
                      "w-48 justify-between font-normal",
                      buttonClassName,
                    )}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy || undefined}
                    aria-errormessage={hasError ? errorId : undefined}
                    aria-haspopup="dialog"
                    aria-required={requiredMark || undefined}
                    aria-labelledby={label ? `${id}-label` : undefined}
                    aria-expanded={open}
                    aria-controls={`${id}-popover`}
                    onBlur={(e) => {
                      field.onBlur();
                      onBlur?.(e);
                    }}
                  >
                    {buttonLabel}

                    {!rawValue ? (
                      <span>
                        <CalendarIcon />
                      </span>
                    ) : (
                      <span
                        className="h-4 w-4 shrink-0 opacity-60 hover:opacity-100"
                        onMouseDown={(e) => {
                          // Empêche le click de rouvrir le popover
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          // On vide la valeur (toujours une string)
                          field.onChange("");
                          onChange?.("");
                        }}
                      >
                        <X />
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                  id={`${id}-popover`}
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    defaultMonth={defaultMonth}
                    captionLayout="dropdown"
                    timeZone={zone}
                    disabled={hiddenMatchers}
                    onSelect={(d: Date | undefined) => {
                      if (!d) return;
                      // d est un Date à minuit dans le fuseau local (même si timeZone est passé à Calendar)
                      // Date civile choisie interprétée dans le fuseau clinique
                      let picked = DateTime.fromObject(
                        {
                          year: d.getFullYear(),
                          month: d.getMonth() + 1,
                          day: d.getDate(),
                        },
                        { zone },
                      ).startOf("day");

                      // Clamp avec min/max éventuels
                      if (minDt && picked < minDt) picked = minDt;
                      if (maxDt && picked > maxDt) picked = maxDt;

                      const iso = picked.toISODate() ?? "";

                      field.onChange(iso);
                      onChange?.(iso);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </FormControl>

            {/* DESCRIPTION */}
            {description ? (
              <FormDescription id={descriptionId}>
                {description}
              </FormDescription>
            ) : null}

            {/* ERREUR */}
            {withError && (
              <div className="min-h-[19px]">
                <FormMessage id={errorId} />
              </div>
            )}
          </FormItem>
        );
      }}
    />
  );
}
