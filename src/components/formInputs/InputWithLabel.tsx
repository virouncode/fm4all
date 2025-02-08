"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChangeEvent, InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

type InputWithLabelProps<S> = {
  //S for Schema
  fieldTitle?: string;
  nameInSchema: keyof S & string; //to prevent typos errors in the name of the field
  className?: string;
  containerClassName?: string;
  handleChange?: (e: ChangeEvent<HTMLInputElement>) => void;
} & InputHTMLAttributes<HTMLInputElement>;

export function InputWithLabel<S>({
  fieldTitle,
  nameInSchema,
  className,
  containerClassName,
  handleChange,
  ...props
}: InputWithLabelProps<S>) {
  const { control, formState } = useFormContext();
  const error = formState.errors[nameInSchema];
  const hasError = Boolean(error);

  return (
    <FormField
      control={control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className={containerClassName}>
          {fieldTitle && (
            <FormLabel htmlFor={nameInSchema} className="text-base">
              {fieldTitle}
            </FormLabel>
          )}
          <FormControl>
            <Input
              id={nameInSchema}
              className={`w-full max-w-xs disabled:text-blue-500 dark:disabled:text-yellow-300 disabled:opacity-75 ${className}`}
              {...props}
              {...field} // Provides onChange, onBlur, name, ref, and value to the child component
              onChange={(e) => {
                field.onChange(e);
                if (handleChange) handleChange(e);
              }}
            />
          </FormControl>
          {hasError ? <FormMessage /> : <div className="h-[19px] opacity-0" />}
        </FormItem>
      )}
    />
  );
}
