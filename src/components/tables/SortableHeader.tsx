import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const SortableHeader = ({
  column,
  label,
}: {
  column: any;
  label: string;
  className?: string;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="px-0"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};
