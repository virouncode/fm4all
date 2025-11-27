import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";

type BaseProps = React.ComponentPropsWithoutRef<typeof Checkbox>;

type RhfCheckboxProps<S extends FieldValues> = {
  label?: string;
  name: Path<S>;
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  checkboxClassName?: string;
  requiredMark?: boolean;
  id?: string;
  ref?: React.Ref<HTMLButtonElement>; // shadcn Checkbox rend un <button>
  onCheckedChange?: (checked: boolean | "indeterminate") => void; // side-effects
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  labelSide?: "left" | "right";
  withError?: boolean;
} & Omit<BaseProps, "checked" | "defaultChecked" | "onCheckedChange">;

/** Fusion de ref */
function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.RefObject<T | null>).current = value;
}

export function RhfCheckbox<S extends FieldValues>({
  label,
  name,
  description,
  orientation = "vertical",
  className,
  checkboxClassName,
  requiredMark,
  ref: parentRef,
  id: idProp,
  onCheckedChange,
  onBlur,
  labelSide = "right",
  withError = true,
  ...props
}: RhfCheckboxProps<S>) {
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
        const describedBy =
          [descriptionId, hasError ? errorId : null]
            .filter(Boolean)
            .join(" ") || undefined;

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
            {label && labelSide === "left" && (
              <FormLabel htmlFor={id} className="text-sm">
                {label}
                {requiredMark && (
                  <span aria-hidden="true" className="ml-0.5">
                    *
                  </span>
                )}
              </FormLabel>
            )}

            {/*======================== CHECKBOX =======================*/}
            <FormControl>
              <Checkbox
                id={id}
                className={checkboxClassName}
                aria-describedby={describedBy}
                aria-invalid={hasError || undefined}
                aria-errormessage={hasError ? errorId : undefined}
                aria-required={requiredMark || undefined}
                checked={!!field.value}
                onCheckedChange={(checked) => {
                  const next = checked === "indeterminate" ? false : !!checked;
                  field.onChange(next);
                  onCheckedChange?.(checked);
                }}
                onBlur={(e) => {
                  field.onBlur();
                  onBlur?.(e);
                }}
                ref={(node) => {
                  field.ref(node);
                  assignRef(parentRef, node);
                }}
                {...props}
              />
            </FormControl>

            {/*======================== LABEL =======================*/}
            {label && labelSide === "right" && (
              <FormLabel htmlFor={id} className="text-sm">
                {label}
                {requiredMark && (
                  <span aria-hidden="true" className="ml-0.5">
                    *
                  </span>
                )}
              </FormLabel>
            )}

            {/*======================== DESCRIPTION =======================*/}
            {description ? (
              <FormDescription id={descriptionId}>
                {description}
              </FormDescription>
            ) : null}

            {/*======================== ERREUR =======================*/}
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
