import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as React from "react";
import {
  useFormContext,
  type FieldValues,
  type Path,
  type PathValue,
} from "react-hook-form";

type BaseProps = React.ComponentPropsWithoutRef<typeof Select>;

type NumberFieldPath<S extends FieldValues> = {
  [K in Path<S>]: PathValue<S, K> extends number | null | undefined ? K : never;
}[Path<S>];

type StringFieldPath<S extends FieldValues> = {
  [K in Path<S>]: PathValue<S, K> extends string | null | undefined ? K : never;
}[Path<S>];

type CommonProps = {
  label?: string;
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  selectClassName?: string;
  requiredMark?: boolean;
  id?: string;
  /** SelectTrigger rend un <button> */
  ref?: React.Ref<HTMLButtonElement>;
  /** NB: sera string si valueType="string", number si "number" */
  onChange?: (value: string | number) => void;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  placeholder?: string;
  withError?: boolean;
} & Omit<BaseProps, "value" | "defaultValue" | "onValueChange">;

/** Cas 1: string (par défaut) */
type StringProps<S extends FieldValues> = CommonProps & {
  valueType?: "string"; // défaut
  name: StringFieldPath<S>;
};

/** Cas 2: number */
type NumberProps<S extends FieldValues> = CommonProps & {
  valueType: "number";
  name: NumberFieldPath<S>;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.RefObject<T | null>).current = value;
}

/** Surcharges pour corréler name ↔ valueType au call-site */
export function RhfControlledSelect<S extends FieldValues>(
  props: StringProps<S>
): React.ReactElement;
export function RhfControlledSelect<S extends FieldValues>(
  props: NumberProps<S>
): React.ReactElement;

export function RhfControlledSelect<S extends FieldValues>({
  label,
  name,
  description,
  orientation = "vertical",
  className,
  selectClassName,
  requiredMark,
  onChange,
  onBlur,
  ref: parentRef,
  children,
  placeholder,
  id: idProp,
  valueType = "string",
  withError = true,
  ...props
}: StringProps<S> | NumberProps<S>) {
  const { control } = useFormContext<S>();
  const id = idProp ?? String(name).replace(/\./g, "_");
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;
  const labelId = label ? `${id}-label` : undefined;

  return (
    <FormField
      control={control}
      name={name as Path<S>}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const describedBy = cn(descriptionId, hasError ? errorId : undefined);

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
              <FormLabel className="text-sm" id={labelId}>
                {label}
                {requiredMark && <span aria-hidden="true">*</span>}
              </FormLabel>
            )}

            <Select
              {...props}
              /** Select attend une string; on normalise */
              value={field.value == null ? undefined : String(field.value)}
              onValueChange={(v) => {
                if (valueType === "number") {
                  const n = Number(v);
                  const next: number | undefined = Number.isNaN(n)
                    ? undefined
                    : n;
                  field.onChange(next);
                  onChange?.(n);
                } else {
                  field.onChange(v);
                  onChange?.(v);
                }
              }}
            >
              <FormControl>
                <SelectTrigger
                  id={id}
                  className={selectClassName}
                  aria-labelledby={labelId}
                  aria-invalid={hasError || undefined}
                  aria-describedby={describedBy || undefined}
                  aria-errormessage={hasError ? errorId : undefined}
                  aria-required={requiredMark || undefined}
                  ref={(node) => {
                    field.ref(node);
                    assignRef(parentRef, node);
                  }}
                  onBlur={(e) => {
                    field.onBlur();
                    onBlur?.(e);
                  }}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>{children}</SelectContent>
            </Select>

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
