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
import { enUS, fr } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { DateTime } from "luxon";
import { useLocale } from "next-intl";
import { useFormContext } from "react-hook-form";

type DateInputWithLabelProps<S> = {
  fieldTitle: string;
  nameInSchema: keyof S & string;
  handleChangeDate?: (date: string | null) => void;
};

export function DateInputWithLabel<S>({
  fieldTitle,
  nameInSchema,
  handleChangeDate,
}: DateInputWithLabelProps<S>) {
  const form = useFormContext();
  const locale = useLocale();
  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className="">
          <FormLabel className="text-base" htmlFor={nameInSchema}>
            {fieldTitle}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full max-w-xs pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                    "flex items-center w-full"
                  )}
                >
                  {field.value ? (
                    format(
                      field.value,
                      locale === "fr" ? "dd-MM-yyyy" : "yyyy-MM-dd"
                    )
                  ) : (
                    <span>
                      {locale === "fr" ? "Choisir une date" : "Pick a date"}
                    </span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      field.onChange("");
                      if (handleChangeDate) {
                        handleChangeDate("");
                      }
                    }}
                  >
                    <X size="icon" className="h-4 w-4 opacity-50" />
                  </span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-10" align="start">
              <Calendar
                mode="single"
                locale={locale === "fr" ? fr : enUS}
                selected={field.value}
                onSelect={(e) => {
                  field.onChange(DateTime.fromJSDate(e as Date).toISODate());
                  if (handleChangeDate) {
                    handleChangeDate(
                      DateTime.fromJSDate(e as Date).toISODate()
                    );
                  }
                }}
                disabled={(date: Date) => date < new Date()}
                initialFocus
                className="bg-background border-2 rounded-xl"
                fromDate={new Date()}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
