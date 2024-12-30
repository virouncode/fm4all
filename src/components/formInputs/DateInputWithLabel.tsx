import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { DateTime } from "luxon";
import { useFormContext } from "react-hook-form";

type DateInputWithLabelProps<S> = {
  fieldTitle: string;
  nameInSchema: keyof S & string;
};

export function DateInputWithLabel<S>({
  fieldTitle,
  nameInSchema,
}: DateInputWithLabelProps<S>) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm" htmlFor={nameInSchema}>
            {fieldTitle}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full max-w-xs pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "yyyy-MM-dd")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      field.onChange("");
                    }}
                  >
                    <X size="icon" className="h-4 w-4 opacity-50" />
                  </span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(e) => {
                  field.onChange(DateTime.fromJSDate(e as Date).toISODate());
                }}
                disabled={(date: Date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                className="bg-background"
                captionLayout="dropdown-buttons"
                fromDate={new Date("1900-01-01")}
                toDate={new Date()}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
