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

type FileInputWithLabelProps<S> = {
  //S for Schema
  fieldTitle: string;
  nameInSchema: keyof S & string; //to prevent typos errors in the name of the field
  className?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
} & InputHTMLAttributes<HTMLInputElement>;

export function FileInputWithLabel<S>({
  fieldTitle,
  nameInSchema,
  className,
  inputRef,
  ...props
}: FileInputWithLabelProps<S>) {
  const form = useFormContext();

  //the render function is a sepcial function from Reac Hook Form
  //This is a render prop. A function that returns a React element and provides the ability to attach events and value into the component. This simplifies integrating with external controlled components with non-standard prop names. Provides onChange, onBlur, name, ref and value to the child component (field key), and also a fieldState object which contains specific input state.
  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm" htmlFor={nameInSchema}>
            {fieldTitle}
          </FormLabel>
          <FormControl>
            <Input
              id={nameInSchema}
              className={`w-full max-w-xs disabled:text-blue-500 dark:disabled:text-yellow-300 disbaled:opacity-75 ${className}`}
              type="file"
              onChange={(e) => {
                field.onChange(e);
              }}
              name={field.name}
              onBlur={field.onBlur}
              ref={inputRef}
              {...props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
