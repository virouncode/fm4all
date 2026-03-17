"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { ArrowDownAZ, ArrowDownUp, ArrowUpAZ } from "lucide-react";

type TicketsSortDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchParams: Record<string, string | undefined>;
};

// Options de tri disponibles
const SORT_OPTIONS = [
  { value: "lastActivityAt", label: "Dernière activité" },
  { value: "createdAt", label: "Date de création" },
  { value: "priorite", label: "Priorité" },
  { value: "statut", label: "Statut" },
  { value: "titre", label: "Titre" },
  { value: "siteNom", label: "Site" },
  { value: "proprietaireEntrepriseNom", label: "Client" },
  { value: "demandeurEntrepriseNom", label: "Demandeur" },
  { value: "assigneEntrepriseNom", label: "Prestataire" },
] as const;

export function TicketsSortDialog({
  open,
  onOpenChange,
  searchParams,
}: TicketsSortDialogProps) {
  const router = useRouter();

  // Lire les valeurs actuelles depuis les props (déjà résolues côté serveur)
  const currentOrderBy = searchParams.orderBy ?? "lastActivityAt";
  const currentOrderDir = searchParams.orderDir ?? "desc";

  const handleSortChange = (orderBy: string) => {
    router.replace({
      pathname: "/app/tickets",
      query: { ...searchParams, orderBy },
    });
  };

  const handleDirectionChange = (orderDir: string) => {
    router.replace({
      pathname: "/app/tickets",
      query: { ...searchParams, orderDir },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="sm:max-w-md">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <ArrowDownUp className="text-primary size-5" />
                Trier les tickets
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <DialogStyledBody>
          <div className="space-y-6">
            {/* Trier par */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trier par</label>
              <Select value={currentOrderBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordre */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordre</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={currentOrderDir === "asc" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleDirectionChange("asc")}
                >
                  <ArrowUpAZ className="h-4 w-4" />
                  Croissant
                </Button>
                <Button
                  type="button"
                  variant={currentOrderDir === "desc" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleDirectionChange("desc")}
                >
                  <ArrowDownAZ className="h-4 w-4" />
                  Décroissant
                </Button>
              </div>
            </div>
          </div>
        </DialogStyledBody>
      </DialogStyledContent>
    </Dialog>
  );
}
