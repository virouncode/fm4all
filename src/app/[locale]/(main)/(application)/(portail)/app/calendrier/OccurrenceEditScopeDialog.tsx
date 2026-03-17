"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarCheck, Move, Timer } from "lucide-react";

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
  const Icon = type === "drag" ? Move : Timer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-xs gap-0 overflow-hidden p-0">
        {/* En-tête */}
        <div className="bg-primary/8 border-b px-5 pt-5 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base leading-snug">
              <CalendarCheck className="text-primary h-4 w-4 shrink-0" />
              {type === "drag"
                ? "Déplacer l'intervention"
                : "Modifier la durée"}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Corps */}
        <div className="px-5 py-4">
          <p className="text-muted-foreground text-sm">
            Souhaitez-vous {verb} uniquement cette intervention ou toutes les
            suivantes ?
          </p>
        </div>

        {/* Footer — colonne */}
        <div className="bg-muted/30 flex flex-col gap-2 border-t px-5 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfirm("occurrence")}
          >
            Cette intervention seulement
          </Button>
          <Button size="sm" onClick={() => onConfirm("suivantes")}>
            Cette intervention et toutes les suivantes
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
