"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTicketAssigneEntrepriseAction } from "@/server/actions/ticketsActions";
import { useState } from "react";
import { toast } from "sonner";

type EditableAssigneEntrepriseProps = {
  ticketId: string;
  entrepriseId: string;
  currentAssigneEntrepriseId: string | null;
  availablePrestataires: Array<{ id: string; nom: string }>;
  onUpdate: () => void;
};

export function EditableAssigneEntreprise({
  ticketId,
  entrepriseId,
  currentAssigneEntrepriseId,
  availablePrestataires,
  onUpdate,
}: EditableAssigneEntrepriseProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (value: string) => {
    // Convertir valeur spéciale → "" pour normalizeForSubmit
    const normalizedValue = value === "__none__" ? "" : value;

    if (normalizedValue === (currentAssigneEntrepriseId || "")) return;

    setIsUpdating(true);

    try {
      const result = await updateTicketAssigneEntrepriseAction({
        ticketId,
        entrepriseId,
        assigneEntrepriseId: normalizedValue, // "" sera converti en null côté serveur
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.ticket) {
        toast.success("Prestataire mis à jour");
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update assigneEntrepriseId:", error);
      toast.error("Erreur lors de la mise à jour du prestataire");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentAssigneEntrepriseId || "__none__"}
      onValueChange={handleChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choisir un prestataire" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">
          <span className="italic text-muted-foreground">Sélectionner un prestataire</span>
        </SelectItem>
        {availablePrestataires.map((prestataire) => (
          <SelectItem key={prestataire.id} value={prestataire.id}>
            {prestataire.nom}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
