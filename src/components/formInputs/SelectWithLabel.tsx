"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

type DataObj = {
  id: string;
  description: string;
  color?: string;
};

type SelectWithLabelProps<S> = {
  //S for Schema
  fieldTitle: string;
  nameInSchema: keyof S & string;
  data: DataObj[];
  className?: string;
};

export function SelectWithLabel<S>({
  fieldTitle,
  nameInSchema,
  data,
  className,
}: SelectWithLabelProps<S>) {
  const { control, formState } = useFormContext();
  const error = formState.errors[nameInSchema];
  const hasError = Boolean(error);

  //The select component is built from RADIX UI, and it is better uncontrolled.
  //So we need a defaultValue and the onValueChange props (read the RADIX UI docs))

  return (
    <FormField
      control={control} //object that contains methods to register component into React Hook Form.
      name={nameInSchema}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base" htmlFor={nameInSchema}>
            {fieldTitle}
          </FormLabel>
          <Select
            // defaultValue={field.value.toString()}
            onValueChange={field.onChange}
            value={field.value.toString()}
          >
            <FormControl>
              <SelectTrigger
                id={nameInSchema}
                className={`w-full max-w-xs ${className}`}
                style={{
                  color:
                    data?.find((item) => item.id === field.value)?.color ?? "",
                }}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {data?.map((item) => (
                <SelectItem
                  key={`${nameInSchema}_${item.id}`}
                  value={item.id.toString()}
                  style={{ color: item.color ?? "" }}
                >
                  {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError ? <FormMessage /> : <div className="h-[19px] opacity-0" />}
        </FormItem>
      )}
    />
  );
}
