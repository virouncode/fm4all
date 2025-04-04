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
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

type DataObj = {
  id: string;
  color?: string;
};

type SelectWithLabelProps<S> = {
  //S for Schema
  fieldTitle: string;
  nameInSchema: keyof S & string;
  data: DataObj[];
  className?: string;
  containerClassName?: string;
  handleSelect?: (value: string, name: string) => void;
  disabled?: boolean;
  translationPrefix?: string;
};

export function SelectWithLabel<S>({
  fieldTitle,
  nameInSchema,
  data,
  className,
  containerClassName,
  handleSelect,
  disabled = false,
  translationPrefix,
}: SelectWithLabelProps<S>) {
  const { control, formState } = useFormContext();
  const error = formState.errors[nameInSchema];
  const hasError = Boolean(error);
  const t = useTranslations(translationPrefix);

  return (
    <FormField
      control={control} //object that contains methods to register component into React Hook Form.
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className={containerClassName}>
          <FormLabel className="text-base" htmlFor={nameInSchema}>
            {fieldTitle}
          </FormLabel>
          <Select
            // defaultValue={field.value.toString()}
            onValueChange={(e) => {
              field.onChange(e);
              if (handleSelect) handleSelect(e, nameInSchema);
            }}
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
                disabled={disabled}
              >
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {data?.map((item) => (
                <SelectItem
                  key={`${nameInSchema}_${item.id}`}
                  value={item.id.toString() ?? ""}
                  style={{ color: item.color ?? "" }}
                >
                  {t ? t(item.id) : ""}
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
