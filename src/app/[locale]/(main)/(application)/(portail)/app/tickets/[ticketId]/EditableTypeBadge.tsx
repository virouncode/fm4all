"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketTypeType } from "@/zod-schemas/enums";
import { FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateTicketBasicFieldsAction } from "@/server/actions/ticketsActions";
import { getTicketTypeLabel } from "../helpers";

type EditableTypeBadgeProps = {
  ticketId: string;
  entrepriseId: string;
  currentType: TicketTypeType;
  onUpdate: () => void;
};

const TYPE_OPTIONS: { value: TicketTypeType; label: string }[] = [
  { value: "incident", label: "Incident" },
  { value: "demande", label: "Demande" },
  { value: "autre", label: "Autre" },
];

export function EditableTypeBadge({
  ticketId,
  entrepriseId,
  currentType,
  onUpdate,
}: EditableTypeBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (newType: TicketTypeType) => {
    if (newType === currentType) return;

    setIsUpdating(true);

    try {
      const result = await updateTicketBasicFieldsAction({
        ticketId,
        entrepriseId,
        type: newType,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.ticket) {
        toast.success("Type mis à jour");
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update type:", error);
      toast.error("Erreur lors de la mise à jour du type");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentType}
      onValueChange={handleChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="inline-flex items-center rounded-md border border-border bg-transparent !px-2 !py-0.5 !h-auto gap-1 text-xs font-medium w-fit whitespace-nowrap hover:bg-accent/50 transition-colors [&>svg]:pointer-events-none">
        <span>{getTicketTypeLabel(currentType)}</span>
      </SelectTrigger>
      <SelectContent>
        {TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
