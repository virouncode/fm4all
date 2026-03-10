"use client";

import { Input } from "@/components/ui/input";
import { updateDevisDemandeAction } from "@/server/actions/devisDemandesActions";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type EditableTitreDemandeProps = {
  demandeId: string;
  entrepriseId: string;
  currentTitre: string;
  onUpdate: () => void;
};

export function EditableTitreDemande({
  demandeId,
  entrepriseId,
  currentTitre,
  onUpdate,
}: EditableTitreDemandeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titre, setTitre] = useState(currentTitre);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setTitre(currentTitre);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitre(currentTitre);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!titre.trim()) {
      toast.error("Le titre ne peut pas être vide");
      return;
    }

    if (titre === currentTitre) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateDevisDemandeAction({
        id: demandeId,
        entrepriseId,
        titre,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.demande) {
        toast.success("Titre mis à jour");
        setIsEditing(false);
        onUpdate();
      }
    } catch {
      toast.error("Erreur lors de la mise à jour du titre");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        onBlur={() => void handleSave()}
        onKeyDown={handleKeyDown}
        disabled={isUpdating}
        className="border-primary h-auto border-2 px-2 py-1 text-3xl font-bold tracking-tight"
      />
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className="hover:bg-accent/5 group -mx-2 -my-1 w-full rounded px-2 py-1 text-left transition-colors"
    >
      <h1 className="flex items-center gap-2 break-words text-3xl font-bold tracking-tight">
        {currentTitre}
        <Pencil className="text-muted-foreground h-5 w-5 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
      </h1>
    </button>
  );
}
