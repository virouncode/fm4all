"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketStatutType } from "@/zod-schemas/enums";
import { useState } from "react";
import { toast } from "sonner";
import { updateTicketStatutAction } from "@/server/actions/ticketsActions";
import { getTicketStatutBadge } from "../helpers";
import { cn } from "@/lib/utils";

type EditableStatutBadgeProps = {
  ticketId: string;
  entrepriseId: string;
  currentStatut: TicketStatutType;
  availableStatuts: string[];
  onUpdate: () => void;
};

const STATUT_LABELS: Record<TicketStatutType, string> = {
  nouveau: "Nouveau",
  pris_en_charge: "Pris en charge",
  en_attente_prestataire: "En attente prestataire",
  en_attente_client: "En attente client",
  a_valider: "À valider",
  clos: "Clos",
  annule: "Annulé",
  rejete: "Rejeté",
};

export function EditableStatutBadge({
  ticketId,
  entrepriseId,
  currentStatut,
  availableStatuts,
  onUpdate,
}: EditableStatutBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const statutBadge = getTicketStatutBadge(currentStatut);

  const handleChange = async (newStatut: TicketStatutType) => {
    if (newStatut === currentStatut) return;

    setIsUpdating(true);

    try {
      const result = await updateTicketStatutAction({
        ticketId,
        entrepriseId,
        statut: newStatut,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.ticket) {
        toast.success("Statut mis à jour");
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update statut:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentStatut}
      onValueChange={handleChange}
      disabled={isUpdating}
    >
      <SelectTrigger
        className={cn(
          "inline-flex items-center rounded-md border-0 !px-2 !py-0.5 !h-auto gap-1 text-xs font-medium w-fit whitespace-nowrap hover:opacity-80 transition-opacity [&>svg]:pointer-events-none",
          statutBadge.className
        )}
      >
        <span>{statutBadge.label}</span>
      </SelectTrigger>
      <SelectContent>
        {availableStatuts.map((statut) => (
          <SelectItem key={statut} value={statut}>
            {STATUT_LABELS[statut as TicketStatutType]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
