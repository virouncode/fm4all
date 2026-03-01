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
import { CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import {
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
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

type StringFieldPath<S extends FieldValues> = {
  [K in Path<S>]: PathValue<S, K> extends string | null | undefined ? K : never;
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
  name: StringFieldPath<S>; // ✅ string, comme RhfDatePicker
  label?: string;
  description?: ReactNode;
  orientation?: "horizontal" | "vertical";
  requiredMark?: boolean;
  className?: string;
  buttonClassName?: string;
  selectClassName?: string;
  zone?: string;
  timeFormat?: "24" | "ampm";
  /**
   * Borne minimale au format ISO "YYYY-MM-DD"
   * (jour civil dans le fuseau `zone`)
   */
  min?: string;
  /**
   * Borne maximale au format ISO "YYYY-MM-DD"
   * (jour civil dans le fuseau `zone`)
   */
  max?: string;
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

  // ====== Bornes ISO -> DateTime (comme RhfDatePicker) ======
  const minDt = useMemo(
    () => (min ? DateTime.fromISO(min, { zone }).startOf("day") : null),
    [min, zone],
  );

  const maxDt = useMemo(
    () => (max ? DateTime.fromISO(max, { zone }).endOf("day") : null),
    [max, zone],
  );

  const fromDate = minDt?.toJSDate();
  const toDate = maxDt?.toJSDate();

  const disabledMatchers = useMemo<Matcher[] | undefined>(() => {
    const arr: Matcher[] = [];
    if (fromDate) arr.push({ before: fromDate });
    if (toDate) arr.push({ after: toDate });
    return arr.length ? arr : undefined;
  }, [fromDate, toDate]);

  const HoursOptions = timeFormat === "24" ? hours24 : hours12;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const rawValue = field.value as string | null | undefined;
        const isEmpty =
          rawValue == null ||
          (typeof rawValue === "string" && rawValue.trim() === "");

        // dt = valeur du champ (ISO) interprétée dans le fuseau clinique
        const dt = !isEmpty
          ? DateTime.fromISO(rawValue as string, { zone })
          : null;

        const base = (dt ?? DateTime.now().setZone(zone)).setZone(zone);

        const dateStart = base.startOf("day");
        const curH24 = base.hour;
        const curMin = roundTo5(base.minute) % 60;

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

        const applyTime = (
          date: DateTime,
          parts: TimePickerValue,
        ): DateTime => {
          let hour24: number;
          if (timeFormat === "24") {
            hour24 = parseInt(parts.hours, 10) || 0;
          } else {
            const h12 = parseInt(parts.hours, 10) || 12;
            const isPM = parts.ampm === "PM";
            hour24 = (h12 % 12) + (isPM ? 12 : 0);
          }
          const minute = parseInt(parts.min, 10) || 0;

          return date.set({
            hour: hour24,
            minute,
            second: 0,
            millisecond: 0,
          });
        };

        const clampToBounds = (value: DateTime): DateTime => {
          let next = value;
          if (minDt && next < minDt) next = minDt;
          if (maxDt && next > maxDt) next = maxDt;
          return next;
        };

        const setDateOnly = (picked: Date) => {
          // d est un Date à minuit dans le fuseau local (même si timeZone est passé à Calendar)
          // Date civile choisie interprétée dans le fuseau clinique
          let pickedDt = DateTime.fromObject(
            {
              year: picked.getFullYear(),
              month: picked.getMonth() + 1,
              day: picked.getDate(),
            },
            { zone },
          ).startOf("day");

          pickedDt = applyTime(pickedDt, timeParts);
          pickedDt = clampToBounds(pickedDt);

          const iso = pickedDt.toISO() ?? "";
          field.onChange(iso);
        };

        const setTimePart = (patch: Partial<TimePickerValue>) => {
          // Si aucune date n'a encore été choisie, ne pas commiter silencieusement
          // "aujourd'hui" simplement parce que l'utilisateur a touché un select d'heure.
          if (isEmpty) return;

          const nextParts: TimePickerValue = { ...timeParts, ...patch };
          let nextDt = applyTime(dateStart, nextParts);
          nextDt = clampToBounds(nextDt);

          const iso = nextDt.toISO() ?? "";
          field.onChange(iso);
        };

        const hasError = !!fieldState.error;
        const describedBy =
          [descriptionId, hasError ? errorId : null]
            .filter(Boolean)
            .join(" ") || undefined;

        const buttonLabel = dt?.toFormat("dd-LL-yyyy") ?? "Choisir une date";

        const selectedDate = dt?.startOf("day").toJSDate();
        const defaultMonth =
          selectedDate ??
          fromDate ?? // si min est défini, on ouvre sur lui
          new Date();

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
                        "w-64 justify-between font-normal",
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
                      defaultMonth={defaultMonth}
                      captionLayout="dropdown"
                      timeZone={zone}
                      disabled={disabledMatchers}
                      onSelect={(d: Date | undefined) => {
                        if (!d) return;
                        // d est un Date à minuit dans le fuseau local
                        // Date civile choisie interprétée dans le fuseau clinique
                        setDateOnly(d);
                        setOpen(false);
                      }}
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
