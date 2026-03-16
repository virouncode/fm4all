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
};

export function OccurrenceEditScopeDialog({
  open,
  onOpenChange,
  type,
  onConfirm,
}: Props) {
  const verb = type === "drag" ? "déplacer" : "redimensionner";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {type === "drag" ? "Déplacer l'événement" : "Modifier la durée"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Souhaitez-vous {verb} uniquement cet événement ou tous les suivants ?
        </p>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onConfirm("occurrence")}
          >
            Cet événement seulement
          </Button>
          <Button
            className="w-full"
            onClick={() => onConfirm("suivantes")}
          >
            Cet événement et tous les suivants
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
