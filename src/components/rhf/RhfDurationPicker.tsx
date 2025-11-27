import { cn } from "@/lib/utils";
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
} from "../form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

// 00..24 (24h autorisé -> minutes forcées à 00)
const HOURS = Array.from({ length: 25 }, (_, i) => String(i).padStart(2, "0"));
// 00..55 par pas de 5
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

type NumberFieldPath<S extends FieldValues> = {
  [K in Path<S>]: PathValue<S, K> extends number | undefined | null ? K : never;
}[Path<S>];

type RhfDurationPickerProps<S extends FieldValues> = {
  /** Chemin RHF dont la valeur est un number (minutes totales) */
  name: NumberFieldPath<S>;
  label?: string;
  description?: string;
  orientation?: "horizontal" | "vertical";
  requiredMark?: boolean;
  className?: string;
  selectClassName?: string;
  id?: string;
  disabled?: boolean;
  withError?: boolean;
  /** Callback optionnelle, reçoit l'objet affiché (heures/minutes) */
  onChange?: (next: { hours: string; min: string }) => void;
};

export function RhfDurationPicker<S extends FieldValues>({
  name,
  label,
  description,
  orientation = "vertical",
  requiredMark,
  className,
  selectClassName,
  id: idProp,
  disabled,
  onChange,
  withError = true,
}: RhfDurationPickerProps<S>) {
  const { control } = useFormContext<S>();
  const id = idProp ?? String(name).replace(/\./g, "_");
  const labelId = label ? `${id}-label` : undefined;
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Normalisation: minutes totales -> heures/min affichées
        const total = typeof field.value === "number" ? field.value : 0;
        const hNum = Math.max(0, Math.min(24, Math.floor(total / 60)));
        let mNum = total % 60;
        if (hNum === 24) mNum = 0; // 24:00 => minutes forcées à 00

        const duration = {
          hours: String(hNum).padStart(2, "0"),
          min: String(mNum).padStart(2, "0"),
        };

        const hasError = !!fieldState.error;
        const describedBy =
          [descriptionId, hasError ? errorId : undefined]
            .filter(Boolean)
            .join(" ") || undefined;

        const is24h = duration.hours === "24";

        const handleChange = (part: "hours" | "min", val: string) => {
          let nextH = parseInt(duration.hours, 10);
          let nextM = parseInt(duration.min, 10);

          if (part === "hours") {
            nextH = parseInt(val, 10);
            if (nextH === 24) nextM = 0; // minutes à 00 si 24h
          } else {
            if (nextH === 24) return; // minutes inactives quand 24h
            nextM = parseInt(val, 10);
          }

          // Recompose en minutes totales
          const nextTotal = nextH * 60 + nextM;
          field.onChange(nextTotal);
          field.onBlur();

          onChange?.({
            hours: String(nextH).padStart(2, "0"),
            min: String(nextM).padStart(2, "0"),
          });
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
            <FormControl>
              <div className="flex items-center gap-2">
                {/* Hours */}
                <Select
                  value={duration.hours}
                  onValueChange={(v) => handleChange("hours", v)}
                  disabled={disabled}
                >
                  <SelectTrigger
                    aria-labelledby={labelId}
                    aria-describedby={describedBy}
                    aria-invalid={hasError || undefined}
                    aria-errormessage={hasError ? errorId : undefined}
                    className={cn("w-24 justify-between", selectClassName)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <SelectValue placeholder="00" />
                      <span className="ml-2 text-xs text-muted-foreground">
                        h
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Minutes */}
                <Select
                  value={duration.min}
                  onValueChange={(v) => handleChange("min", v)}
                  disabled={disabled || is24h}
                >
                  <SelectTrigger
                    aria-labelledby={labelId}
                    aria-describedby={describedBy}
                    aria-invalid={hasError || undefined}
                    aria-errormessage={hasError ? errorId : undefined}
                    className={cn("w-24 justify-between", selectClassName)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <SelectValue placeholder="00" />
                      <span className="ml-2 text-xs text-muted-foreground">
                        min
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
