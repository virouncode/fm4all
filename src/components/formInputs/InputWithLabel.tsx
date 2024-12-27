"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

type InputWithLabelProps<S> = {
  //S for Schema
  fieldTitle: string;
  nameInSchema: keyof S & string; //to prevent typos errors in the name of the field
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function InputWithLabel<S>({
  fieldTitle,
  nameInSchema,
  className,
  ...props
}: InputWithLabelProps<S>) {
  const form = useFormContext();

  //the render function is a sepcial function from Reac Hook Form
  //This is a render prop. A function that returns a React element and provides the ability to attach events and value into the component. This simplifies integrating with external controlled components with non-standard prop names. Provides onChange, onBlur, name, ref and value to the child component (field key), and also a fieldState object which contains specific input state.
  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem>
          {fieldTitle && (
            <FormLabel htmlFor={nameInSchema} className="text-base">
              {fieldTitle}
            </FormLabel>
          )}
          <FormControl>
            <Input
              id={nameInSchema}
              className={`w-full max-w-xs disabled:text-blue-500 dark:disabled:text-yellow-300 disbaled:opacity-75 ${className}`}
              {...props}
              {...field} //Provides onChange, onBlur, name, ref and value to the child component
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
