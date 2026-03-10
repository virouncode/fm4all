"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { updateDevisDemandeStatutAction } from "@/server/actions/devisDemandesActions";
import type { DevisDemandeStatutType } from "@/zod-schemas/enums";
import { useState } from "react";
import { toast } from "sonner";
import { getDevisDemandeStatutBadge } from "../../helpers";

const STATUT_LABELS: Record<DevisDemandeStatutType, string> = {
  ouverte: "Ouverte",
  en_cours: "En cours",
  cloturee: "Clôturée",
  annulee: "Annulée",
  archivee: "Archivée",
};

type EditableStatutDemandeSelectProps = {
  demandeId: string;
  entrepriseId: string;
  currentStatut: DevisDemandeStatutType;
  availableStatuts: DevisDemandeStatutType[];
  onUpdate: () => void;
};

export function EditableStatutDemandeSelect({
  demandeId,
  entrepriseId,
  currentStatut,
  availableStatuts,
  onUpdate,
}: EditableStatutDemandeSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const statutBadge = getDevisDemandeStatutBadge(currentStatut);

  const handleChange = async (newStatut: string) => {
    if (newStatut === currentStatut) return;

    setIsUpdating(true);

    try {
      const result = await updateDevisDemandeStatutAction({
        id: demandeId,
        entrepriseId,
        statut: newStatut as DevisDemandeStatutType,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.demande) {
        toast.success("Statut mis à jour");
        onUpdate();
      }
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentStatut}
      onValueChange={(v) => void handleChange(v)}
      disabled={isUpdating}
    >
      <SelectTrigger
        className={cn(
          "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-md border-0 text-xs font-medium transition-opacity hover:opacity-80 [&>svg]:pointer-events-none !h-auto !px-2 !py-0.5",
          statutBadge.className,
        )}
      >
        <span>{statutBadge.label}</span>
      </SelectTrigger>
      <SelectContent>
        {availableStatuts.map((statut) => (
          <SelectItem key={statut} value={statut}>
            {STATUT_LABELS[statut]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
