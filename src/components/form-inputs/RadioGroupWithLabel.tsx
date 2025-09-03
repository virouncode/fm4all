import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormContext } from "react-hook-form";

type RadioGroupWithLabelProps<S> = {
  //S for Schema
  fieldTitle?: string;
  nameInSchema: keyof S & string; //to prevent typos errors in the name of the field
  className?: string;
  containerClassName?: string;
  data: { id: string; description: string }[];
  disabled?: boolean;
  handleChange?: (value: string) => void;
};

export function RadioGroupWithLabel<S>({
  fieldTitle,
  nameInSchema,
  className,
  containerClassName,
  data,
  disabled = false,
  handleChange,
}: RadioGroupWithLabelProps<S>) {
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
            <RadioGroup
              onValueChange={(value) => {
                field.onChange(value);
                if (handleChange) handleChange(value);
              }}
              defaultValue={field.value}
              className={`flex flex-col ${className}`}
              disabled={disabled}
            >
              {data.map(({ id, description }) => (
                <FormItem
                  className="flex items-center space-x-3 space-y-0"
                  key={id}
                >
                  <FormControl>
                    <RadioGroupItem value={id} />
                  </FormControl>
                  <FormLabel className="font-normal">{description}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {hasError ? <FormMessage /> : <div className="h-[19px] opacity-0" />}
        </FormItem>
      )}
    />
  );
}

export default RadioGroupWithLabel;
