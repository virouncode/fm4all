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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  deleteExecutionAction,
  toggleExecutionActifAction,
} from "@/server/actions/clientServiceExecutionsActions";
import { updatePrestationStatutAction } from "@/server/actions/clientServicesActions";
import {
  type ExecutionWithPrix,
  type OccurrenceListItem,
} from "@/server/queries/clientServiceExecutions.query";
import {
  type ClientServiceStatutType,
  type PrestationListItem,
} from "@/zod-schemas/clientServices.schema";
import {
  ArrowLeft,
  Building,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Power,
  Settings,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PrestationFormDialog } from "../PrestationFormDialog";
import {
  formatDate,
  formatDuree,
  getFrequenceLabel,
  getModePlanningBadge,
  getPrestationStatutBadge,
} from "../helpers";
import { ExecutionFormDialog } from "./ExecutionFormDialog";

interface PrestationDetailsClientProps {
  prestation: PrestationListItem;
  canManage: boolean;
  isPlateforme: boolean;
  executions: ExecutionWithPrix[];
  occurrences: OccurrenceListItem[];
}

const JOUR_LABELS: Record<number, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
  7: "Dimanche",
};

const STATUT_TRANSITIONS: Record<ClientServiceStatutType, readonly ClientServiceStatutType[]> = {
  brouillon: ["actif"],
  actif: ["en_pause", "termine"],
  en_pause: ["actif", "termine"],
  termine: [],
};

const STATUT_LABELS: Record<ClientServiceStatutType, string> = {
  brouillon: "Brouillon",
  actif: "Actif",
  en_pause: "En pause",
  termine: "Terminé",
};

export function PrestationDetailsClient({
  prestation,
  canManage,
  isPlateforme,
  executions: initialExecutions,
  occurrences,
}: PrestationDetailsClientProps) {
  const router = useRouter();
  const [executions, setExecutions] =
    useState<ExecutionWithPrix[]>(initialExecutions);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const frequenceLabel = getFrequenceLabel(
    prestation.frequence,
    prestation.frequenceParPeriode,
    prestation.intervalleJours,
  );

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    router.refresh();
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-6">
      {/* ==================== HEADER ==================== */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-4">
          {/* Titre + metadata */}
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight break-words">
              {prestation.serviceNom}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              {isPlateforme && (
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  {prestation.entrepriseNom}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {prestation.siteNom}
              </span>
              <span className="text-muted-foreground/50 font-mono text-xs">
                #{prestation.id.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* Bouton retour */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex-shrink-0 gap-2"
          >
            <Link href="/app/prestations">
              <ArrowLeft className="h-4 w-4" />
              Retour aux prestations
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* ==================== TABS ==================== */}
      <Tabs defaultValue="parametres">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parametres" className="gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="execution" className="gap-2">
            <Zap className="h-4 w-4" />
            Exécution & Tarifs
            {executions.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-1.5 text-xs">
                {executions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="interventions" className="gap-2">
            <Wrench className="h-4 w-4" />
            Interventions
            {occurrences.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-1.5 text-xs">
                {occurrences.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ============ TAB: PARAMÈTRES ============ */}
        <TabsContent value="parametres" className="mt-6 space-y-4">
          {/* Badges statut + mode */}
          <div className="flex flex-wrap items-center gap-2">
            {canManage ? (
              <EditablePrestationStatutBadge
                prestation={prestation}
                onUpdate={() => router.refresh()}
              />
            ) : (
              <Badge className={getPrestationStatutBadge(prestation.statut).className}>
                {getPrestationStatutBadge(prestation.statut).label}
              </Badge>
            )}
            <Badge className={getModePlanningBadge(prestation.modePlanning).className}>
              {getModePlanningBadge(prestation.modePlanning).label}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Fréquence & Planning */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <CalendarDays className="text-primary h-4 w-4" />
                    Planification
                  </CardTitle>
                  {canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialogOpen(true)}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Fréquence" value={frequenceLabel} />
                {prestation.joursPreference &&
                  prestation.joursPreference.length > 0 && (
                    <InfoRow
                      label="Jours préférés"
                      value={prestation.joursPreference
                        .map((j) => JOUR_LABELS[j] ?? `Jour ${j}`)
                        .join(", ")}
                    />
                  )}
                {prestation.heureDebutPreference && (
                  <InfoRow
                    label="Heure de début"
                    value={prestation.heureDebutPreference}
                  />
                )}
                {prestation.dureeEstimeeMinutes && (
                  <InfoRow
                    label="Durée estimée"
                    value={formatDuree(prestation.dureeEstimeeMinutes)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Calendar className="text-primary h-4 w-4" />
                  Période
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow
                  label="Date de début"
                  value={formatDate(prestation.dateDebut)}
                />
                <InfoRow
                  label="Date de fin"
                  value={
                    prestation.dateFin
                      ? formatDate(prestation.dateFin)
                      : "∞ Sans échéance"
                  }
                />
                <InfoRow
                  label="Créée le"
                  value={formatDate(prestation.createdAt)}
                />
                <InfoRow
                  label="Modifiée le"
                  value={formatDate(prestation.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {prestation.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                  {prestation.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============ TAB: EXÉCUTION & TARIFS ============ */}
        <TabsContent value="execution" className="mt-6">
          <ExecutionTab
            executions={executions}
            canManage={canManage}
            prestation={prestation}
            onExecutionsChange={setExecutions}
          />
        </TabsContent>

        {/* ============ TAB: INTERVENTIONS ============ */}
        <TabsContent value="interventions" className="mt-6">
          <InterventionsTab occurrences={occurrences} prestation={prestation} />
        </TabsContent>
      </Tabs>

      {/* ==================== DIALOGS ==================== */}
      <PrestationFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        prestation={prestation}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

// ==================== EDITABLE STATUT BADGE ====================

function EditablePrestationStatutBadge({
  prestation,
  onUpdate,
}: {
  prestation: PrestationListItem;
  onUpdate: () => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const badge = getPrestationStatutBadge(prestation.statut);
  const transitions = STATUT_TRANSITIONS[prestation.statut] ?? [];

  const handleChange = async (newStatut: string) => {
    if (newStatut === prestation.statut) return;
    setIsUpdating(true);
    const result = await updatePrestationStatutAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      statut: newStatut as ClientServiceStatutType,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data) {
      toast.success(result.data.message);
      onUpdate();
    }
    setIsUpdating(false);
  };

  // Statut terminal : badge statique
  if (transitions.length === 0) {
    return (
      <Badge className={badge.className}>{badge.label}</Badge>
    );
  }

  const availableStatuts: ClientServiceStatutType[] = [
    prestation.statut,
    ...transitions,
  ];

  return (
    <Select
      value={prestation.statut}
      onValueChange={handleChange}
      disabled={isUpdating}
    >
      <SelectTrigger
        className={cn(
          "inline-flex items-center rounded-md border-0 !px-2 !py-0.5 !h-auto gap-1 text-xs font-medium w-fit whitespace-nowrap hover:opacity-80 transition-opacity [&>svg]:pointer-events-none",
          badge.className,
        )}
      >
        <span>{badge.label}</span>
      </SelectTrigger>
      <SelectContent>
        {availableStatuts.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUT_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ==================== SUB-COMPONENTS ====================

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

// ==================== TAB: EXÉCUTION & TARIFS ====================

function ExecutionTab({
  executions,
  canManage,
  prestation,
  onExecutionsChange,
}: {
  executions: ExecutionWithPrix[];
  canManage: boolean;
  prestation: PrestationListItem;
  onExecutionsChange: (executions: ExecutionWithPrix[]) => void;
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setAddDialogOpen(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Ajouter un prestataire
          </Button>
        </div>
      )}

      {executions.length === 0 ? (
        <div className="py-12 text-center">
          <Zap className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-lg font-medium">
            Aucun prestataire assigné
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Ajoutez un prestataire et configurez les tarifs pour activer cette
            prestation.
          </p>
        </div>
      ) : (
        executions.map((execution) => (
          <ExecutionCard
            key={execution.id}
            execution={execution}
            canManage={canManage}
            prestation={prestation}
            onExecutionsChange={onExecutionsChange}
          />
        ))
      )}

      {canManage && (
        <ExecutionFormDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          prestationId={prestation.id}
          entrepriseId={prestation.entrepriseId}
          siteId={prestation.siteId}
          serviceId={prestation.serviceId}
          onSuccess={(updated) => {
            onExecutionsChange(updated);
            setAddDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ExecutionCard({
  execution,
  canManage,
  prestation,
  onExecutionsChange,
}: {
  execution: ExecutionWithPrix;
  canManage: boolean;
  prestation: PrestationListItem;
  onExecutionsChange: (executions: ExecutionWithPrix[]) => void;
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isActive = execution.actif;

  const typePrixLabels: Record<string, string> = {
    abonnement: "Abonnement",
    par_occurrence: "Par occurrence",
    installation: "Installation",
    frais_livraison: "Frais de livraison",
  };
  const periodeLabels: Record<string, string> = {
    semaine: "/ semaine",
    mois: "/ mois",
    annee: "/ an",
  };

  const handleToggle = async () => {
    setIsToggling(true);
    const result = await toggleExecutionActifAction({
      executionId: execution.id,
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      actif: !isActive,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data) {
      toast.success(result.data.message);
      onExecutionsChange(result.data.executions);
    }
    setIsToggling(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteExecutionAction({
      executionId: execution.id,
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data) {
      toast.success(result.data.message);
      onExecutionsChange(result.data.executions);
    }
    setIsDeleting(false);
    setDeleteOpen(false);
  };

  return (
    <>
      <Card className={isActive ? "" : "opacity-60"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Building className="text-primary h-4 w-4" />
              {execution.prestataireNom ?? "Prestataire inconnu"}
            </CardTitle>
            <div className="flex items-center gap-2">
              {!isActive && (
                <Badge className="bg-gray-100 text-xs text-gray-600">
                  Inactif
                </Badge>
              )}
              <Badge className="bg-blue-100 text-xs text-blue-700">
                Priorité {execution.priorite}
              </Badge>
              {canManage && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleToggle}
                    disabled={isToggling}
                    aria-label={isActive ? "Désactiver" : "Activer"}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive h-7 w-7"
                    onClick={() => setDeleteOpen(true)}
                    aria-label="Supprimer ce prestataire"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="text-muted-foreground flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Depuis le {formatDate(execution.dateDebutValidite)}
            </span>
            {execution.dateFinValidite && (
              <span>
                Jusqu&apos;au {formatDate(execution.dateFinValidite)}
              </span>
            )}
          </div>
        </CardHeader>

        {execution.prix.length > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Tarifs
              </p>
              {execution.prix.map((prix) => (
                <div
                  key={prix.id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    prix.actif ? "" : "opacity-50"
                  }`}
                >
                  <span>
                    {typePrixLabels[prix.typePrix] ?? prix.typePrix}
                    {prix.periodeFacturation &&
                      ` ${periodeLabels[prix.periodeFacturation] ?? ""}`}
                  </span>
                  <span className="font-semibold">
                    {(prix.montantHt / 100).toFixed(2)} € HT
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce prestataire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le prestataire{" "}
              <strong>{execution.prestataireNom ?? "inconnu"}</strong> et tous
              ses tarifs seront retirés de cette prestation. Les interventions
              déjà planifiées ne seront pas affectées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Retirer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ==================== TAB: INTERVENTIONS ====================

function InterventionsTab({
  occurrences,
  prestation,
}: {
  occurrences: OccurrenceListItem[];
  prestation: PrestationListItem;
}) {
  const statutLabels: Record<string, { label: string; className: string }> = {
    planifiee: { label: "Planifiée", className: "bg-blue-100 text-blue-700" },
    en_cours: { label: "En cours", className: "bg-amber-100 text-amber-700" },
    terminee: { label: "Terminée", className: "bg-green-100 text-green-700" },
    non_honoree: { label: "Non honorée", className: "bg-red-100 text-red-700" },
    annulee: { label: "Annulée", className: "bg-gray-100 text-gray-600" },
  };

  const canGenerate =
    prestation.statut === "actif" && prestation.modePlanning === "planifie";

  if (occurrences.length === 0) {
    return (
      <div className="py-16 text-center">
        <Wrench className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
        <p className="text-muted-foreground text-lg font-medium">
          Aucune intervention planifiée
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          {canGenerate
            ? "La prestation est active. Ajoutez un prestataire actif avec des tarifs pour générer les interventions."
            : "La prestation doit être active avec un mode planifié, un prestataire et des tarifs pour générer des interventions."}
        </p>
        {canGenerate && (
          <Button className="mt-4" disabled>
            <Wrench className="mr-2 h-4 w-4" />
            Générer les interventions (bientôt disponible)
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {occurrences.length} intervention
          {occurrences.length > 1 ? "s" : ""}
        </p>
        {canGenerate && (
          <Button variant="outline" size="sm" disabled>
            <Wrench className="mr-2 h-4 w-4" />
            Générer (bientôt disponible)
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {occurrences.map((occ) => {
          const badge = statutLabels[occ.statut] ?? {
            label: occ.statut,
            className: "bg-gray-100 text-gray-600",
          };
          return (
            <div
              key={occ.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                <div>
                  <span className="font-medium">
                    {occ.dateDebutPrevue
                      ? formatDate(occ.dateDebutPrevue)
                      : "Date non définie"}
                  </span>
                  {occ.dateFinPrevue && (
                    <span className="text-muted-foreground ml-2">
                      → {formatDate(occ.dateFinPrevue)}
                    </span>
                  )}
                </div>
              </div>
              <Badge className={`text-xs ${badge.className}`}>
                {badge.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
