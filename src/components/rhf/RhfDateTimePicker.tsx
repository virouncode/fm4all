import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TIMEZONE } from "@/constants/time";
import { cn } from "@/lib/utils";
import { toTimestampFromMidnight } from "@/lib/utils/formatDates";
import { CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import React, { useMemo, useState, type ComponentPropsWithoutRef } from "react";
import type { Matcher } from "react-day-picker";
import {
  useFormContext,
  type FieldValues,
  type Path,
  type PathValue,
} from "react-hook-form";

export type TimePickerValue = {
  hours: string;
  min: string;
  ampm?: "AM" | "PM";
};
type NumberFieldPath<S extends FieldValues> = {
  [K in Path<S>]: PathValue<S, K> extends number | undefined | null ? K : never;
}[Path<S>];

const hours12 = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
); // 01..12
const hours24 = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
); // 00..23
const minutes5 = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
); // 00..55
const periods = ["AM", "PM"] as const;

type BaseButtonProps = ComponentPropsWithoutRef<typeof Button>;

type RhfDateTimePickerProps<S extends FieldValues> = {
  name: NumberFieldPath<S>; //(timestamp ms)
  label?: string;
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  requiredMark?: boolean;
  className?: string;
  buttonClassName?: string; // style du bouton date
  selectClassName?: string; // style de chaque select
  zone?: string;
  timeFormat?: "24" | "ampm";
  min?: number; // borne datetime min (ms)
  max?: number; // borne datetime max (ms)
  id?: string;
  dateDisabled?: boolean;
  timeDisabled?: boolean;
  withError?: boolean;
} & Omit<BaseButtonProps, "onBlur" | "disabled">;

const roundTo5 = (m: number) => Math.round(m / 5) * 5;

export function RhfDateTimePicker<S extends FieldValues>({
  name,
  label,
  description,
  orientation = "vertical",
  requiredMark,
  className,
  buttonClassName,
  selectClassName,
  zone = TIMEZONE,
  timeFormat = "ampm",
  min,
  max,
  id: idProp,
  dateDisabled,
  timeDisabled,
  withError = true,
  ...buttonProps
}: RhfDateTimePickerProps<S>) {
  const { control } = useFormContext<S>();
  const [open, setOpen] = useState(false);

  const id = idProp ?? String(name).replace(/\./g, "_");
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  // pour Calendar (bornes)
  const fromDate =
    typeof min === "number"
      ? DateTime.fromMillis(min).setZone(zone).startOf("day").toJSDate()
      : undefined;
  const toDate =
    typeof max === "number"
      ? DateTime.fromMillis(max).setZone(zone).startOf("day").toJSDate()
      : undefined;
  const disabledMatchers = useMemo<Matcher[] | undefined>(() => {
    const arr: Matcher[] = [];
    if (fromDate) arr.push({ before: fromDate });
    if (toDate) arr.push({ after: toDate });
    return arr.length ? arr : undefined;
  }, [fromDate, toDate]);

  // Sous-UI TimePicker interne (non RHF)
  const HoursOptions = timeFormat === "24" ? hours24 : hours12;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const ts = (field.value ?? undefined) as number | undefined;
        // décompose la valeur actuelle (ou now)
        const dt = (ts ? DateTime.fromMillis(ts) : DateTime.now()).setZone(
          zone,
        );

        const dateStartMs = dt.startOf("day").toMillis();
        const curH24 = dt.hour;
        const curMin = roundTo5(dt.minute) % 60;

        const timeParts: TimePickerValue =
          timeFormat === "24"
            ? {
                hours: String(curH24).padStart(2, "0"),
                min: String(curMin).padStart(2, "0"),
              }
            : {
                hours: String(curH24 % 12 || 12).padStart(2, "0"),
                min: String(curMin).padStart(2, "0"),
                ampm: curH24 >= 12 ? "PM" : "AM",
              };

        // helpers de mise à jour
        const setDateOnly = (picked: Date) => {
          const pickedStart = DateTime.fromObject(
            {
              year: picked.getFullYear(),
              month: picked.getMonth() + 1,
              day: picked.getDate(),
            },
            { zone },
          )
            .startOf("day")
            .toMillis();
          const composed = pickedStart + toTimestampFromMidnight(timeParts);
          let next = composed;
          if (typeof min === "number") next = Math.max(next, min);
          if (typeof max === "number") next = Math.min(next, max);
          field.onChange(next);
        };

        const setTimePart = (patch: Partial<TimePickerValue>) => {
          const nextParts: TimePickerValue = { ...timeParts, ...patch };
          const composed = dateStartMs + toTimestampFromMidnight(nextParts);
          let next = composed;
          if (typeof min === "number") next = Math.max(next, min);
          if (typeof max === "number") next = Math.min(next, max);
          field.onChange(next);
        };

        const hasError = !!fieldState.error;
        const describedBy =
          [descriptionId, hasError ? errorId : null]
            .filter(Boolean)
            .join(" ") || undefined;

        // libellé bouton date
        const buttonLabel = DateTime.fromMillis(dateStartMs)
          .setZone(zone)
          .toFormat("yyyy-LL-dd");

        const selectedDate = DateTime.fromMillis(dateStartMs, {
          zone,
        }).toJSDate();
        const defaultMonthDate = ts
          ? DateTime.fromMillis(dateStartMs, { zone })
          : typeof min === "number"
            ? DateTime.fromMillis(min, { zone }).startOf("day")
            : DateTime.now().setZone(zone);

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
            {label && (
              <FormLabel id={labelId} className="text-sm">
                {label}
                {requiredMark && <span aria-hidden="true">*</span>}
              </FormLabel>
            )}

            <FormControl>
              <div
                className={cn(
                  "flex gap-1",
                  orientation === "horizontal" && "items-center",
                )}
              >
                {/* ======= DATE PICKER ======= */}
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      id={id}
                      {...buttonProps}
                      className={cn(
                        "w-48 justify-between font-normal",
                        buttonClassName,
                      )}
                      aria-invalid={hasError || undefined}
                      aria-describedby={describedBy}
                      aria-errormessage={hasError ? errorId : undefined}
                      aria-labelledby={label ? labelId : undefined}
                      aria-required={requiredMark || undefined}
                      aria-haspopup="dialog"
                      aria-expanded={open}
                      aria-controls={`${id}-popover`}
                      onBlur={() => field.onBlur()}
                      disabled={dateDisabled}
                    >
                      {buttonLabel}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
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
                      defaultMonth={defaultMonthDate.toJSDate()}
                      captionLayout="dropdown"
                      onSelect={(d) => {
                        if (!d) return;
                        setDateOnly(d);
                        setOpen(false);
                      }}
                      timeZone={zone}
                      disabled={disabledMatchers}
                    />
                  </PopoverContent>
                </Popover>
                {/* ======= TIME PICKER ======= */}
                <div
                  className="flex items-center gap-1"
                  aria-labelledby={label ? labelId : undefined}
                  aria-label="Time"
                  role="group"
                >
                  {/* hours */}
                  <NativeSelect
                    value={timeParts.hours}
                    onChange={(e) => setTimePart({ hours: e.target.value })}
                    className={cn("w-[68px]", selectClassName)}
                    aria-describedby={describedBy}
                    aria-invalid={hasError || undefined}
                    aria-errormessage={hasError ? errorId : undefined}
                    disabled={timeDisabled}
                  >
                    {HoursOptions.map((v) => (
                      <NativeSelectOption key={v} value={v}>
                        {v}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {/* minutes */}
                  <NativeSelect
                    value={timeParts.min}
                    onChange={(e) => setTimePart({ min: e.target.value })}
                    className={cn("w-[68px]", selectClassName)}
                    aria-describedby={describedBy}
                    aria-invalid={hasError || undefined}
                    aria-errormessage={hasError ? errorId : undefined}
                    disabled={timeDisabled}
                  >
                    {minutes5.map((v) => (
                      <NativeSelectOption key={v} value={v}>
                        {v}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {/* am/pm */}
                  {timeFormat === "ampm" && (
                    <NativeSelect
                      value={timeParts.ampm!}
                      onChange={(e) =>
                        setTimePart({ ampm: e.target.value as "AM" | "PM" })
                      }
                      className={cn("w-[72px]", selectClassName)}
                      aria-describedby={describedBy}
                      aria-invalid={hasError || undefined}
                      aria-errormessage={hasError ? errorId : undefined}
                      disabled={timeDisabled}
                    >
                      {periods.map((v) => (
                        <NativeSelectOption key={v} value={v}>
                          {v}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  )}
                </div>
              </div>
            </FormControl>
            {description ? (
              <FormDescription id={descriptionId}>
                {description}
              </FormDescription>
            ) : null}
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
