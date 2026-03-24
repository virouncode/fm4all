import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import React from "react";
import {
  useFormContext,
  type FieldValues,
  type Path,
  type PathValue,
} from "react-hook-form";

type BaseProps = React.ComponentPropsWithoutRef<typeof RadioGroup>;
type StringFieldPath<S extends FieldValues> = {
  [K in Path<S>]: PathValue<S, K> extends string | undefined | null ? K : never;
}[Path<S>];

type RhfRadioGroupProps<S extends FieldValues> = {
  label?: string;
  name: StringFieldPath<S>;
  description?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
  radioClassName?: string;
  requiredMark?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  onValueChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  children?: React.ReactNode; // <RadioItem>…</RadioItem>
  id?: string;
  withError?: boolean;
} & Omit<
  BaseProps,
  "name" | "defaultValue" | "value" | "onChange" | "onBlur" | "ref"
>;

export function RhfRadioGroup<S extends FieldValues>({
  label,
  name,
  description,
  orientation = "vertical",
  className,
  radioClassName,
  requiredMark,
  id: idProp,
  onValueChange,
  onBlur,
  children,
  ref: parentRef,
  withError = true,
  ...props
}: RhfRadioGroupProps<S>) {
  const { control } = useFormContext<S>();
  const id = idProp ?? String(name).replace(/\./g, "_"); //Si pas d'id on la crée à partir de name
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <FormField
      control={control}
      name={name}
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
            {/*======================== LABEL =======================*/}
            {label && (
              <FormLabel id={`${id}-label`} className="text-sm">
                {label}
                {requiredMark && <span aria-hidden="true">*</span>}
              </FormLabel>
            )}
            {/*======================== RADIO GROUP =======================*/}
            <FormControl>
              <RadioGroup
                id={id}
                {...props}
                aria-invalid={hasError || undefined}
                aria-describedby={describedBy || undefined}
                aria-errormessage={hasError ? errorId : undefined}
                aria-required={requiredMark || undefined}
                aria-labelledby={label ? `${id}-label` : undefined}
                ref={parentRef}
                value={field.value ?? undefined}
                onValueChange={(value) => {
                  field.onChange(value);
                  onValueChange?.(value);
                }}
                onBlur={(e) => {
                  field.onBlur();
                  onBlur?.(e);
                }}
                className={radioClassName}
              >
                {children}
              </RadioGroup>
            </FormControl>
            {/*======================== DESCRIPTION =======================*/}
            {description ? (
              <FormDescription id={descriptionId}>
                {description}
              </FormDescription>
            ) : null}
            {/*======================== ERREUR DE VALIDATION =======================*/}
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
