"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

// ==================== TYPES ====================

type OptionType = { id: string; label: string };

type FilterMultiSelectProps = {
  label: string;
  options: OptionType[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

// ==================== COMPONENT ====================

export function FilterMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
}: FilterMultiSelectProps) {
  const count = selectedIds.length;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-sm"
          title={count > 0 ? `${label} — ${count} sélectionné${count > 1 ? "s" : ""}` : `Filtrer par ${label.toLowerCase()}`}
        >
          {label}
          {count > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {count}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        {options.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            Aucune option
          </p>
        ) : (
          <div className="flex max-h-60 flex-col gap-1 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={selectedIds.includes(opt.id)}
                  onCheckedChange={() => toggle(opt.id)}
                />
                <span className="truncate">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
