"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { TicketPrioriteType } from "@/zod-schemas/enums";
import { useState } from "react";
import { toast } from "sonner";
import { updateTicketBasicFieldsAction } from "@/server/actions/ticketsActions";
import { getTicketPrioriteBadge } from "../helpers";
import { cn } from "@/lib/utils";

type EditablePrioriteBadgeProps = {
  ticketId: string;
  entrepriseId: string;
  currentPriorite: TicketPrioriteType;
  onUpdate: () => void;
};

const PRIORITE_OPTIONS: { value: TicketPrioriteType; label: string }[] = [
  { value: "critique", label: "Critique" },
  { value: "haute", label: "Haute" },
  { value: "normale", label: "Normale" },
  { value: "basse", label: "Basse" },
];

export function EditablePrioriteBadge({
  ticketId,
  entrepriseId,
  currentPriorite,
  onUpdate,
}: EditablePrioriteBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const prioriteBadge = getTicketPrioriteBadge(currentPriorite);

  const handleChange = async (newPriorite: TicketPrioriteType) => {
    if (newPriorite === currentPriorite) return;

    setIsUpdating(true);

    try {
      const result = await updateTicketBasicFieldsAction({
        ticketId,
        entrepriseId,
        priorite: newPriorite,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.ticket) {
        toast.success("Priorité mise à jour");
        onUpdate();
      }
    } catch {
      toast.error("Erreur lors de la mise à jour de la priorité");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentPriorite}
      onValueChange={handleChange}
      disabled={isUpdating}
    >
      <SelectTrigger
        className={cn(
          "inline-flex items-center rounded-md border-0 !px-2 !py-0.5 !h-auto gap-1 text-xs font-medium w-fit whitespace-nowrap hover:opacity-80 transition-opacity [&>svg]:pointer-events-none",
          prioriteBadge.className
        )}
      >
        <span>{prioriteBadge.label}</span>
      </SelectTrigger>
      <SelectContent>
        {PRIORITE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
