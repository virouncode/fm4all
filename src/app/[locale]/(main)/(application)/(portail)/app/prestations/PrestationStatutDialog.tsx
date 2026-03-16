"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Spinner } from "@/components/ui/spinner";
import { updatePrestationStatutAction } from "@/server/actions/clientServicesActions";
import {
  type ClientServiceStatutType,
  type PrestationListItem,
} from "@/zod-schemas/clientServices.schema";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getPrestationStatutBadge } from "./helpers";

// Transitions autorisées (doit correspondre au serveur)
const TRANSITIONS: Record<string, readonly string[]> = {
  brouillon: ["actif"],
  actif: ["en_pause", "termine"],
  en_pause: ["actif", "termine"],
  termine: [],
};

const STATUT_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  actif: "Actif",
  en_pause: "En pause",
  termine: "Terminé",
};

type PrestationStatutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestation: PrestationListItem;
  onSuccess: () => void;
}

export function PrestationStatutDialog({
  open,
  onOpenChange,
  prestation,
  onSuccess,
}: PrestationStatutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatut, setSelectedStatut] = useState<string | null>(null);

  const allowedTransitions = TRANSITIONS[prestation.statut] ?? [];
  const currentBadge = getPrestationStatutBadge(prestation.statut);

  const handleTransition = async () => {
    if (!selectedStatut) return;

    setIsSubmitting(true);
    const result = await updatePrestationStatutAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      statut: selectedStatut as "brouillon" | "actif" | "en_pause" | "termine",
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      setIsSubmitting(false);
      return;
    }

    if (result?.data) {
      toast.success(result.data.message);
      onSuccess();
      onOpenChange(false);
      setSelectedStatut(null);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setSelectedStatut(null);
      }}
    >
      <DialogStyledContent className="sm:max-w-md">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <RotateCcw className="text-primary size-5" />
                Changer le statut
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <DialogStyledBody>
          <div className="space-y-5 py-2">
            {/* Service concerné */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {prestation.serviceNom}
              </span>{" "}
              — {prestation.siteNom}
            </div>

            {/* Statut actuel */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Statut actuel :</span>
              <Badge className={`text-xs ${currentBadge.className}`}>
                {currentBadge.label}
              </Badge>
            </div>

            {/* Transitions disponibles */}
            {allowedTransitions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Aucune transition disponible. Ce statut est terminal.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Choisissez le nouveau statut :</p>
                <div className="flex flex-col gap-2">
                  {allowedTransitions.map((statut) => {
                    const badge = getPrestationStatutBadge(
                      statut as ClientServiceStatutType,
                    );
                    const isSelected = selectedStatut === statut;
                    return (
                      <button
                        key={statut}
                        type="button"
                        onClick={() => setSelectedStatut(statut)}
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                          isSelected
                            ? "border-primary bg-muted/50 ring-1 ring-primary"
                            : "border-border"
                        }`}
                      >
                        <div className="flex flex-1 items-center gap-3">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Badge className={`text-xs ${badge.className}`}>
                            {badge.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {STATUT_LABELS[statut]}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="text-xs text-primary font-medium">
                            Sélectionné
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogStyledBody>

        <DialogStyledFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          {allowedTransitions.length > 0 && (
            <Button
              type="button"
              onClick={handleTransition}
              disabled={!selectedStatut || isSubmitting}
            >
              {isSubmitting && <Spinner />}
              Confirmer
            </Button>
          )}
        </DialogStyledFooter>
      </DialogStyledContent>
    </Dialog>
  );
}
