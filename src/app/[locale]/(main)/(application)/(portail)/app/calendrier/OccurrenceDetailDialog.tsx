"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";
import type { CalendarEventItemType } from "@/server/actions/calendrierActions";
import {
  getOccurrenceTachesAction,
  getTacheItemsByTemplateAction,
} from "@/server/actions/clientServiceOccurrencesActions";
import {
  Building2,
  CalendarCheck,
  Clock,
  ExternalLink,
  ListChecks,
  MapPin,
  Repeat2,
} from "lucide-react";
import { useEffect, useState } from "react";

// ==================== TYPES ====================

type DetailPropsType = CalendarEventItemType["extendedProps"] & {
  start: string;
  end?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventProps: DetailPropsType | null;
};

type TacheItemType = {
  id: string;
  titre: string;
  statut: string;
  ordre: number;
};

// ==================== HELPERS ====================

function formatDateRange(start: string, end?: string): string {
  const startDate = new Date(start);
  const dateStr = startDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTime = startDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (!end) return `${dateStr} à ${startTime}`;
  const endTime = new Date(end).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateStr} · ${startTime} – ${endTime}`;
}

const STATUT_CONFIG: Record<string, { label: string; className: string }> = {
  planifiee: {
    label: "Planifiée",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  en_cours: {
    label: "En cours",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  terminee: {
    label: "Terminée",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  non_honoree: {
    label: "Non honorée",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  annulee: {
    label: "Annulée",
    className: "bg-gray-100 text-gray-500 border-gray-200 line-through",
  },
  non_applicable: {
    label: "Non applicable",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

const TACHE_STATUT_CONFIG: Record<string, { label: string; dotClass: string }> =
  {
    a_faire: { label: "À faire", dotClass: "bg-slate-400" },
    en_cours: { label: "En cours", dotClass: "bg-blue-500" },
    terminee: { label: "Terminée", dotClass: "bg-green-500" },
    non_honoree: { label: "Non honorée", dotClass: "bg-red-500" },
    annulee: { label: "Annulée", dotClass: "bg-gray-400" },
    non_applicable: { label: "N/A", dotClass: "bg-gray-300" },
  };

// ==================== COMPONENT ====================

export function OccurrenceDetailDialog({
  open,
  onOpenChange,
  eventProps,
}: Props) {
  const [taches, setTaches] = useState<TacheItemType[]>([]);
  const [loadingTaches, setLoadingTaches] = useState(false);
  const [tachesError, setTachesError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !eventProps) {
      setTaches([]);
      setTachesError(null);
      return;
    }
    const { type, occurrenceId, prestationId, clientEntrepriseId, tacheListeTemplateId } = eventProps;

    const mapTaches = (items: { id: string; titre: string; statut: string; ordre: number }[]) =>
      items.map((t) => ({ id: t.id, titre: t.titre, statut: t.statut, ordre: t.ordre }));

    setLoadingTaches(true);
    setTachesError(null);

    // Occurrence virtuelle : fetcher les items du template directement
    if (type === "virtual") {
      if (!tacheListeTemplateId) {
        setLoadingTaches(false);
        return;
      }
      getTacheItemsByTemplateAction({ tacheListeTemplateId })
        .then((result) => {
          if (result?.serverError) { setTachesError(String(result.serverError)); return; }
          setTaches(mapTaches(result?.data?.taches ?? []));
        })
        .catch(() => setTachesError("Erreur de chargement."))
        .finally(() => setLoadingTaches(false));
      return;
    }

    // Occurrence matérialisée : tâches réelles ou fallback template
    if (!occurrenceId || !prestationId) { setLoadingTaches(false); return; }
    if (!clientEntrepriseId) {
      setTachesError("Rechargez la page pour voir les tâches.");
      setLoadingTaches(false);
      return;
    }

    getOccurrenceTachesAction({ occurrenceId, prestationId, entrepriseId: clientEntrepriseId })
      .then((result) => {
        if (result?.serverError) { setTachesError(String(result.serverError)); return; }
        if (result?.validationErrors) { setTachesError("Données invalides."); return; }
        setTaches(mapTaches(result?.data?.taches ?? []));
      })
      .catch(() => setTachesError("Erreur de chargement."))
      .finally(() => setLoadingTaches(false));
  }, [open, eventProps]);

  if (!eventProps) return null;

  const {
    type,
    occurrenceId,
    prestationId,
    statut,
    regleId,
    serviceNom,
    siteNom,
    siteAdresse,
    prestataireNom,
    start,
    end,
  } = eventProps;

  const statutConfig = statut ? STATUT_CONFIG[statut] : null;
  const canNavigate =
    type === "materialized" && !!occurrenceId && !!prestationId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
        {/* En-tête coloré */}
        <div className="bg-primary/8 border-b px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3 pr-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base leading-snug">
                <CalendarCheck className="text-primary h-4 w-4 shrink-0" />
                {serviceNom}
              </DialogTitle>
              {regleId && (
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Repeat2 className="h-3 w-3" />
                  Intervention récurrente
                </p>
              )}
            </DialogHeader>
            {statutConfig && (
              <Badge
                variant="outline"
                className={`mt-0.5 shrink-0 text-xs ${statutConfig.className}`}
              >
                {statutConfig.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Corps */}
        <div className="space-y-0 divide-y px-5 py-1">
          {/* Date / créneau */}
          <div className="flex items-center gap-3 py-3">
            <Clock className="text-primary h-4 w-4 shrink-0" />
            <span className="text-sm capitalize">{formatDateRange(start, end)}</span>
          </div>

          {/* Site */}
          {siteNom && (
            <div className="flex items-start gap-3 py-3">
              <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{siteNom}</p>
                {siteAdresse && (
                  <p className="text-muted-foreground text-xs">{siteAdresse}</p>
                )}
              </div>
            </div>
          )}

          {/* Prestataire */}
          {prestataireNom && (
            <div className="flex items-center gap-3 py-3">
              <Building2 className="text-primary h-4 w-4 shrink-0" />
              <span className="text-sm">{prestataireNom}</span>
            </div>
          )}

          {/* Tâches */}
          {(type === "materialized" || type === "virtual") && (
            <div className="flex items-start gap-3 py-3">
              <ListChecks className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1 space-y-1.5">
                {loadingTaches ? (
                  <span className="text-muted-foreground text-xs">Chargement…</span>
                ) : tachesError ? (
                  <span className="text-xs text-amber-600">{tachesError}</span>
                ) : taches.length === 0 ? (
                  <span className="text-muted-foreground text-xs italic">Aucune tâche</span>
                ) : (
                  taches.map((t) => {
                    const tConfig = TACHE_STATUT_CONFIG[t.statut];
                    return (
                      <div key={t.id} className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${tConfig?.dotClass ?? "bg-slate-400"}`} />
                        <span className="truncate text-sm">{t.titre}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/30 flex justify-end gap-2 border-t px-5 py-3">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {canNavigate && (
            <Button size="sm" asChild onClick={() => onOpenChange(false)}>
              <Link
                href={{
                  pathname: "/app/prestations/[prestationId]/occurrences/[occurrenceId]",
                  params: {
                    prestationId: prestationId!,
                    occurrenceId: occurrenceId!,
                  },
                }}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Modifier
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
