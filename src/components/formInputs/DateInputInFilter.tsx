import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { DateTime } from "luxon";

type DateInputInFilterProps<T> = {
  fieldName: keyof T;
  label?: string;
  filters: T;
  handleDateSelect: (fieldName: keyof T, date: string) => void;
  handleClearDate: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    fieldName: keyof T
  ) => void;
};

export function DateInputInFilter<T>({
  fieldName,
  label,
  filters,
  handleDateSelect,
  handleClearDate,
}: DateInputInFilterProps<T>) {
  return (
    <>
      {label && <label className="text-sm">{label}</label>}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full max-w-xs pl-3 text-left font-normal",
                !filters[fieldName] && "text-muted-foreground"
              )}
            >
              {filters[fieldName] ? (
                format(new Date(filters[fieldName] as string), "yyyy-MM-dd")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              <span onClick={(e) => handleClearDate(e, fieldName)}>
                <X size="icon" className="h-4 w-4 opacity-50" />
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50 relative" align="start">
            <Calendar
              mode="single"
              selected={
                filters[fieldName]
                  ? new Date(filters[fieldName] as string)
                  : undefined
              }
              onSelect={(e) => {
                handleDateSelect(
                  fieldName,
                  DateTime.fromJSDate(e as Date).toISODate()!
                );
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
      </div>
    </>
  );
}
