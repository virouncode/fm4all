"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "drag" | "resize";
  onConfirm: (scope: "occurrence" | "suivantes") => void;
  onCancel: () => void;
};

export function OccurrenceEditScopeDialog({
  open,
  onOpenChange,
  type,
  onConfirm,
  onCancel,
}: Props) {
  const verb = type === "drag" ? "déplacer" : "redimensionner";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-xs">
        <DialogHeader>
          <DialogTitle>
            {type === "drag" ? "Déplacer l'événement" : "Modifier la durée"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Souhaitez-vous {verb} uniquement cet événement ou tous les suivants ?
        </p>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button variant="outline" onClick={() => onConfirm("occurrence")}>
            Cet événement seulement
          </Button>
          <Button onClick={() => onConfirm("suivantes")}>
            Cet événement et tous les suivants
          </Button>
          <Button onClick={onCancel} variant="outline">
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
