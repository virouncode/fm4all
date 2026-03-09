"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";

export type ComboboxOption = {
  value: string;
  label: string;
};

type RhfComboboxInputProps<S extends FieldValues> = {
  name: Path<S>;
  options: ComboboxOption[];
  label?: string;
  description?: React.ReactNode;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  requiredMark?: boolean;
  withError?: boolean;
};

export function RhfComboboxInput<S extends FieldValues>({
  name,
  options,
  label,
  description,
  placeholder,
  className,
  inputClassName,
  requiredMark,
  withError = true,
}: RhfComboboxInputProps<S>) {
  const { control } = useFormContext<S>();
  const id = String(name).replace(/\./g, "_");
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const inputValue = String(field.value ?? "");
        const hasError = !!fieldState.error;
        const describedBy = cn(descriptionId, hasError ? errorId : undefined);

        const filtered = options.filter(
          (o) =>
            o.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            o.value.toLowerCase().includes(inputValue.toLowerCase()),
        );

        const showDropdown = open && filtered.length > 0;

        return (
          <FormItem className={cn("flex flex-col gap-2", className)}>
            {label && (
              <FormLabel htmlFor={id} className="text-sm">
                {label}
                {requiredMark && <span aria-hidden="true">*</span>}
              </FormLabel>
            )}

            <Popover open={showDropdown} onOpenChange={setOpen}>
              <PopoverAnchor asChild>
                <FormControl>
                  <Input
                    id={id}
                    value={inputValue}
                    placeholder={placeholder}
                    className={inputClassName}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy || undefined}
                    aria-errormessage={hasError ? errorId : undefined}
                    aria-required={requiredMark || undefined}
                    ref={field.ref}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setOpen(true);
                    }}
                    onBlur={() => {
                      field.onBlur();
                      // Délai pour laisser le clic sur une option se déclencher
                      setTimeout(() => setOpen(false), 150);
                    }}
                    onFocus={() => setOpen(true)}
                  />
                </FormControl>
              </PopoverAnchor>

              <PopoverContent
                className="z-[200] p-1"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                sideOffset={4}
              >
                <div className="max-h-48 overflow-y-auto">
                  {filtered.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className="hover:bg-accent w-full rounded px-2 py-1.5 text-left text-sm"
                      onMouseDown={(e) => {
                        // Prevent blur before click
                        e.preventDefault();
                        field.onChange(o.label);
                        setOpen(false);
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {description && (
              <FormDescription id={descriptionId}>
                {description}
              </FormDescription>
            )}

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
