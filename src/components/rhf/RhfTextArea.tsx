"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";

type BaseProps = React.JSX.IntrinsicElements["textarea"];

type RhfTextAreaProps<S extends FieldValues> = {
  label?: string;
  name: Path<S>;
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  textareaClassName?: string;
  requiredMark?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  withError?: boolean;
} & Omit<
  BaseProps,
  "name" | "defaultValue" | "value" | "onChange" | "onBlur" | "ref"
>;

/** Fusionne la ref RHF et la ref parent (objet ou callback) */
function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.RefObject<T | null>).current = value;
}

export function RhfTextArea<S extends FieldValues>({
  label,
  name,
  description,
  orientation = "vertical",
  className,
  textareaClassName,
  requiredMark,
  id: idProp,
  onChange,
  onBlur,
  ref: parentRef,
  withError = true,
  ...props
}: RhfTextAreaProps<S>) {
  const { control } = useFormContext<S>();
  const id = idProp ?? String(name).replace(/\./g, "_");
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
              className,
            )}
          >
            {/*======================== LABEL =======================*/}
            {label && (
              <FormLabel htmlFor={id} className="text-sm">
                {label}
                {requiredMark && <span aria-hidden="true">*</span>}
              </FormLabel>
            )}

            {/*======================== TEXTAREA =======================*/}
            <FormControl>
              <Textarea
                id={id}
                {...field}
                {...props}
                className={cn(textareaClassName, "resize-none")}
                aria-invalid={hasError || undefined}
                aria-describedby={describedBy || undefined}
                aria-errormessage={hasError ? errorId : undefined}
                aria-required={requiredMark || undefined}
                ref={(node) => {
                  field.ref(node);
                  assignRef(parentRef, node);
                }}
                onChange={(e) => {
                  field.onChange(e);
                  onChange?.(e);
                }}
                onBlur={(e) => {
                  field.onBlur();
                  onBlur?.(e);
                }}
              />
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
