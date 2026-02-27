"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useRouter } from "@/i18n/navigation";
import {
  updateOccurrenceStatutAction,
  updateOccurrenceTacheStatutAction,
} from "@/server/actions/clientServiceOccurrencesActions";
import type {
  OccurrenceDetail,
  OccurrenceTacheDetail,
} from "@/server/queries/clientServiceExecutions.query";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  ListTodo,
  Loader2,
  MapPin,
  Play,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "../../../helpers";

interface OccurrenceDetailClientProps {
  occurrence: OccurrenceDetail;
  prestation: PrestationListItem;
  taches: OccurrenceTacheDetail[];
  canManage: boolean;
}

// ==================== STATUT BADGES ====================

const OCCURRENCE_STATUT: Record<
  OccurrenceDetail["statut"],
  { label: string; className: string }
> = {
  planifiee: { label: "Planifiée", className: "bg-blue-100 text-blue-700" },
  en_cours: { label: "En cours", className: "bg-yellow-100 text-yellow-700" },
  terminee: { label: "Terminée", className: "bg-green-100 text-green-700" },
  non_honoree: {
    label: "Non honorée",
    className: "bg-red-100 text-red-700",
  },
  annulee: { label: "Annulée", className: "bg-gray-100 text-gray-500" },
};

const TACHE_STATUT: Record<
  OccurrenceTacheDetail["statut"],
  { label: string; className: string }
> = {
  a_faire: { label: "À faire", className: "bg-gray-100 text-gray-600" },
  en_cours: { label: "En cours", className: "bg-yellow-100 text-yellow-700" },
  terminee: { label: "Terminée", className: "bg-green-100 text-green-700" },
  non_honoree: {
    label: "Non honorée",
    className: "bg-red-100 text-red-700",
  },
  non_applicable: {
    label: "N/A",
    className: "bg-slate-100 text-slate-500",
  },
  annulee: { label: "Annulée", className: "bg-gray-100 text-gray-400" },
};

// ==================== MAIN COMPONENT ====================

export function OccurrenceDetailClient({
  occurrence,
  prestation,
  taches: initialTaches,
  canManage,
}: OccurrenceDetailClientProps) {
  const router = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isUpdatingStatut, setIsUpdatingStatut] = useState(false);
  const [taches, setTaches] = useState<OccurrenceTacheDetail[]>(initialTaches);

  const occurrenceBadge = OCCURRENCE_STATUT[occurrence.statut];

  const handleTransition = async (
    statut: "en_cours" | "terminee" | "non_honoree" | "annulee",
  ) => {
    setIsUpdatingStatut(true);
    const result = await updateOccurrenceStatutAction({
      occurrenceId: occurrence.id,
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      statut,
    });
    setIsUpdatingStatut(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data) {
      toast.success(result.data.message);
      router.refresh();
    }
  };

  const handleTacheTransition = async (
    tacheId: string,
    statut:
      | "en_cours"
      | "terminee"
      | "non_honoree"
      | "non_applicable"
      | "annulee",
  ) => {
    const result = await updateOccurrenceTacheStatutAction({
      tacheId,
      occurrenceId: occurrence.id,
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      statut,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    if (result?.data?.tache) {
      setTaches((prev) =>
        prev.map((t) =>
          t.id === tacheId ? { ...t, statut: result.data!.tache.statut } : t,
        ),
      );
    }
  };

  const allTasksDone =
    taches.length === 0 ||
    taches.every(
      (t) => t.statut === "terminee" || t.statut === "non_applicable",
    );

  return (
    <div className="container mx-auto flex h-full max-w-4xl flex-col overflow-hidden p-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex-shrink-0 space-y-3">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Intervention — {prestation.serviceNom}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {occurrence.siteNom ?? prestation.siteNom}
              </span>
              {occurrence.prestataireNom && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {occurrence.prestataireNom}
                </span>
              )}
              <span className="text-muted-foreground/50 font-mono text-xs">
                #{occurrence.id}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex-shrink-0 gap-2"
          >
            <Link
              href={{
                pathname: "/app/prestations/[prestationId]",
                params: { prestationId: prestation.id },
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        {/* Statut badge + actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={occurrenceBadge.className}>
            {occurrenceBadge.label}
          </Badge>

          {canManage && (
            <>
              {occurrence.statut === "planifiee" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTransition("en_cours")}
                    disabled={isUpdatingStatut || !occurrence.executionId}
                    title={
                      !occurrence.executionId
                        ? "Attribuez un prestataire avant de démarrer"
                        : undefined
                    }
                  >
                    <Play className="h-4 w-4" />
                    Démarrer
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={isUpdatingStatut}
                  >
                    Annuler
                  </Button>
                </>
              )}

              {occurrence.statut === "en_cours" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTransition("terminee")}
                    disabled={isUpdatingStatut || !allTasksDone}
                    title={
                      !allTasksDone
                        ? "Toutes les tâches doivent être terminées ou N/A"
                        : undefined
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Terminer
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleTransition("non_honoree")}
                    disabled={isUpdatingStatut}
                  >
                    Non honorée
                  </Button>
                </>
              )}
            </>
          )}

          {isUpdatingStatut && (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          )}
        </div>
      </div>

      <Separator className="my-5 flex-shrink-0" />

      {/* ==================== CONTENT ==================== */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-6">
        {/* Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Calendar className="text-primary h-4 w-4" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Début prévu</span>
              <span className="font-medium">
                {occurrence.dateDebutPrevue
                  ? formatDateTime(occurrence.dateDebutPrevue)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fin prévue</span>
              <span className="font-medium">
                {occurrence.dateFinPrevue
                  ? formatDateTime(occurrence.dateFinPrevue)
                  : "—"}
              </span>
            </div>
            {occurrence.dateDebutReelle && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Début réel</span>
                <span className="font-medium">
                  {formatDateTime(occurrence.dateDebutReelle)}
                </span>
              </div>
            )}
            {occurrence.dateFinReelle && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fin réelle</span>
                <span className="font-medium">
                  {formatDateTime(occurrence.dateFinReelle)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Créée le</span>
              <span className="font-medium">
                {formatDate(occurrence.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tâches */}
        {taches.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <ListTodo className="text-primary h-4 w-4" />
                Tâches
                <span className="text-muted-foreground text-xs font-normal">
                  (
                  {
                    taches.filter(
                      (t) =>
                        t.statut === "terminee" ||
                        t.statut === "non_applicable",
                    ).length
                  }
                  /{taches.length} traitées)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {taches.map((tache) => (
                <TacheRow
                  key={tache.id}
                  tache={tache}
                  canManage={canManage}
                  occurrenceStatut={occurrence.statut}
                  onTransition={(statut) =>
                    handleTacheTransition(tache.id, statut)
                  }
                />
              ))}
            </CardContent>
          </Card>
        )}

        {taches.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <ClipboardList className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                Aucune tâche associée à cette intervention.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {occurrence.notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <User className="text-primary h-4 w-4" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {occurrence.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ==================== CANCEL DIALOG ==================== */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette intervention ?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;intervention passera au statut <strong>Annulée</strong>.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatut}>
              Conserver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCancelDialogOpen(false);
                void handleTransition("annulee");
              }}
              disabled={isUpdatingStatut}
              variant="destructive"
            >
              Confirmer l&apos;annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== TACHE ROW ====================

function TacheRow({
  tache,
  canManage,
  occurrenceStatut,
  onTransition,
}: {
  tache: OccurrenceTacheDetail;
  canManage: boolean;
  occurrenceStatut: OccurrenceDetail["statut"];
  onTransition: (
    statut:
      | "en_cours"
      | "terminee"
      | "non_honoree"
      | "non_applicable"
      | "annulee",
  ) => Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const badge = TACHE_STATUT[tache.statut];

  const handleTransition = async (
    statut:
      | "en_cours"
      | "terminee"
      | "non_honoree"
      | "non_applicable"
      | "annulee",
  ) => {
    setIsUpdating(true);
    await onTransition(statut);
    setIsUpdating(false);
  };

  // Les tâches ne sont interactives que si l'occurrence est en cours
  const canInteract =
    canManage &&
    (occurrenceStatut === "en_cours" || occurrenceStatut === "planifiee");

  return (
    <div className="rounded-lg border p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-5 flex-shrink-0 text-center text-xs">
              {tache.ordre}.
            </span>
            <span
              className={`font-medium ${tache.statut === "terminee" ? "line-through opacity-60" : ""}`}
            >
              {tache.titre}
            </span>
          </div>
          {tache.description && (
            <p className="text-muted-foreground ml-7 text-xs">
              {tache.description}
            </p>
          )}
          {tache.doneAt && (
            <p className="text-muted-foreground ml-7 flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {formatDateTime(tache.doneAt)}
            </p>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>

          {isUpdating && (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          )}

          {/* Boutons de transition selon statut courant */}
          {canInteract && !isUpdating && (
            <>
              {tache.statut === "a_faire" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleTransition("en_cours")}
                  >
                    Démarrer
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground h-6 px-2 text-xs"
                    onClick={() => handleTransition("non_applicable")}
                  >
                    N/A
                  </Button>
                </>
              )}
              {tache.statut === "en_cours" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleTransition("terminee")}
                  >
                    Terminer
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground h-6 px-2 text-xs"
                    onClick={() => handleTransition("non_applicable")}
                  >
                    N/A
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
