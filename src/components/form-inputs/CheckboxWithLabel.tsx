"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

type CheckboxWithLabelProps<S> = {
  //S for Schema
  fieldTitle: string;
  nameInSchema: keyof S & string;
  message: string;
  disabled?: boolean;
};

export function CheckboxWithLabel<S>({
  fieldTitle,
  nameInSchema,
  message,
  disabled = false,
}: CheckboxWithLabelProps<S>) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className="w-full flex items-center gap-2">
          <FormLabel className="text-base w-1/3 mt-2" htmlFor={nameInSchema}>
            {fieldTitle}
          </FormLabel>
          <div className="flex items-center gap-2">
            <FormControl>
              <Checkbox
                id={nameInSchema}
                {...field}
                checked={field.value} //here we have to use field.value because field doesn't provide a checked property
                onCheckedChange={field.onChange} //here we have to use field.onChange because field doesn't provide an onCheckedChange property
                disabled={disabled}
              />
            </FormControl>
            {message}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
