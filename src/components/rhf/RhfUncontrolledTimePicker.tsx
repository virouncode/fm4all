import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import * as React from "react";
import {
  useFormContext,
  type FieldError,
  type FieldErrors,
  type FieldValues,
  type Path,
  type PathValue,
} from "react-hook-form";
import { NativeSelect, NativeSelectOption } from "../native-select";

const hours12 = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
); // 01..12
const hours24 = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
); // 00..23
const minutes = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
); // 00..55
const periods = ["AM", "PM"] as const;

export type TimePickerValue = {
  hours: string;
  min: string;
  ampm?: "AM" | "PM";
};

type TimeFieldPath<S extends FieldValues> = {
  [K in Path<S>]: PathValue<S, K> extends TimePickerValue ? K : never;
}[Path<S>];

type RhfUncontrolledTimePickerProps<S extends FieldValues> = {
  label?: string;
  name: TimeFieldPath<S>;
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  requiredMark?: boolean;
  className?: string;
  selectClassName?: string;
  id?: string;
  disabled?: boolean;
  timeFormat?: "ampm" | "24";
  onChange?: (next: TimePickerValue) => void;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  withError?: boolean;
};

function getErrorAtPath<S extends FieldValues>(
  errors: FieldErrors<S>,
  path: string
): FieldError | undefined {
  let cur: unknown = errors;
  for (const key of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur as FieldError | undefined;
}

export function RhfUncontrolledTimePicker<S extends FieldValues>({
  label,
  name,
  description,
  orientation = "vertical",
  requiredMark,
  className,
  selectClassName,
  id: idProp,
  disabled,
  timeFormat = "ampm",
  onChange,
  onBlur,
  withError = true,
}: RhfUncontrolledTimePickerProps<S>) {
  const { register, formState, getValues, trigger } = useFormContext<S>();
  const idBase = idProp ?? String(name).replace(/\./g, "_");
  const labelId = `${idBase}-label`;
  const errorId = `${idBase}-error`;
  const descriptionId = description ? `${idBase}-description` : undefined;

  // Sous-chemins (obj imbriqué): name.hours / name.min / name.ampm
  const nameHours = `${name}.hours` as Path<S>;
  const nameMin = `${name}.min` as Path<S>;
  const nameAmPm = `${name}.ampm` as Path<S>;

  // Ids des 3 selects
  const hoursId = `${idBase}-hours`;
  const minutesId = `${idBase}-minutes`;
  const ampmId = `${idBase}-ampm`;

  // Erreur si l'une des 3 sous-clés (ou le parent) a une erreur
  const parentError = getErrorAtPath(formState.errors, String(name));
  const hErr = getErrorAtPath(formState.errors, String(nameHours));
  const mErr = getErrorAtPath(formState.errors, String(nameMin));
  const pErr =
    timeFormat === "ampm"
      ? getErrorAtPath(formState.errors, String(nameAmPm))
      : undefined;
  const hasError = !!(parentError || hErr || mErr || pErr);

  const describedBy =
    [descriptionId, hasError ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  //initial (uncontrolled) from defaultValues
  const current: TimePickerValue = {
    hours: getValues(nameHours) ?? (timeFormat === "24" ? "00" : "12"),
    min: getValues(nameMin) ?? "00",
    ampm: timeFormat === "ampm" ? (getValues(nameAmPm) ?? "AM") : undefined,
  };

  // Registers
  const regHours = register(nameHours);
  const regMin = register(nameMin);
  const regAmPm = timeFormat === "ampm" ? register(nameAmPm) : null;

  const emitChange = () => {
    const next: TimePickerValue = {
      hours: getValues(nameHours) ?? "12",
      min: getValues(nameMin) ?? "00",
      ampm: timeFormat === "ampm" ? (getValues(nameAmPm) ?? "AM") : undefined,
    };
    onChange?.(next);
  };

  return (
    <FormItem
      className={cn(
        "gap-2",
        orientation === "horizontal"
          ? "flex flex-row items-center"
          : "flex flex-col",
        className
      )}
    >
      {/*================= LABEL ================= */}
      {label && (
        <FormLabel id={labelId} className="text-sm">
          {label}
          {requiredMark && (
            <span aria-hidden="true" className="ml-0.5">
              *
            </span>
          )}
        </FormLabel>
      )}
      {/*================= TIME PICKER ================= */}
      <FormControl>
        <div
          className="flex items-center gap-1"
          role="group"
          aria-labelledby={labelId}
          aria-disabled={disabled || undefined}
        >
          {/* Hours */}
          <NativeSelect
            id={hoursId}
            name={regHours.name}
            defaultValue={current.hours}
            disabled={disabled}
            className={cn("w-[67px]", selectClassName)}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            aria-errormessage={hasError ? errorId : undefined}
            ref={regHours.ref}
            onChange={(e) => {
              regHours.onChange(e);
              emitChange();
              trigger(name); //revalider le parent immédiatement
            }}
            onBlur={(e) => {
              regHours.onBlur(e);
              onBlur?.(e);
            }}
          >
            {(timeFormat === "24" ? hours24 : hours12).map((v) => (
              <NativeSelectOption key={v} value={v}>
                {v}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          {/* Minutes */}
          <NativeSelect
            id={minutesId}
            name={regMin.name}
            defaultValue={current.min}
            disabled={disabled}
            className={cn("w-[67px]", selectClassName)}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            aria-errormessage={hasError ? errorId : undefined}
            ref={regMin.ref}
            onChange={(e) => {
              regMin.onChange(e);
              emitChange();
              trigger(name);
            }}
            onBlur={(e) => {
              regMin.onBlur(e);
              onBlur?.(e);
            }}
          >
            {minutes.map((v) => (
              <NativeSelectOption key={v} value={v}>
                {v}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          {/*=================== AM/PM ===================*/}
          {timeFormat === "ampm" && regAmPm && (
            <NativeSelect
              id={ampmId}
              name={regAmPm.name}
              defaultValue={current.ampm ?? "AM"}
              disabled={disabled}
              className={cn("w-[67px]", selectClassName)}
              aria-labelledby={label ? labelId : undefined}
              aria-describedby={describedBy}
              aria-invalid={hasError || undefined}
              aria-errormessage={hasError ? errorId : undefined}
              ref={regAmPm.ref}
              onChange={(e) => {
                regAmPm.onChange(e);
                emitChange();
                trigger(name);
              }}
              onBlur={(e) => {
                regAmPm.onBlur(e);
                onBlur?.(e);
              }}
            >
              {periods.map((v) => (
                <NativeSelectOption key={v} value={v}>
                  {v}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
        </div>
      </FormControl>

      {/*================== DESCRIPTION ==================*/}
      {description ? (
        <FormDescription id={descriptionId}>{description}</FormDescription>
      ) : null}

      {/*================== ERROR ==================*/}
      {withError && (
        <div className="min-h-[19px]">
          <FormMessage id={errorId} />
        </div>
      )}
    </FormItem>
  );
}
