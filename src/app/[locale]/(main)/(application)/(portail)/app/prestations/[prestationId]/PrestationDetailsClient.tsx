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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useIntersection from "@/hooks/use-intersection";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  deleteExecutionAction,
  toggleExecutionActifAction,
} from "@/server/actions/clientServiceExecutionsActions";
import {
  getOccurrencesPageAction,
  updateOccurrenceStatutAction,
} from "@/server/actions/clientServiceOccurrencesActions";
import {
  deletePrestationAction,
  updatePrestationStatutAction,
} from "@/server/actions/clientServicesActions";
import {
  type ExecutionWithPrix,
  type OccurrenceListItem,
} from "@/server/queries/clientServiceExecutions.query";
import {
  type ClientServiceStatutType,
  type PrestationListItem,
} from "@/zod-schemas/clientServices.schema";
import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowLeft,
  ArrowUpAZ,
  Building,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  MapPin,
  Pencil,
  Play,
  Power,
  RotateCcw,
  Settings,
  Trash2,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PrestationFormDialog } from "../PrestationFormDialog";
import {
  formatDate,
  formatDateTime,
  formatDuree,
  getFrequenceLabel,
  getModeCommercialBadge,
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
  totalOccurrences: number;
  totalNonAssigned: number;
  availableSites: Array<{ id: string; nom: string }>;
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

const STATUT_TRANSITIONS: Record<
  ClientServiceStatutType,
  readonly ClientServiceStatutType[]
> = {
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
  totalOccurrences,
  totalNonAssigned,
  availableSites,
}: PrestationDetailsClientProps) {
  const router = useRouter();
  const [executions, setExecutions] =
    useState<ExecutionWithPrix[]>(initialExecutions);
  const [interventionsCount, setInterventionsCount] =
    useState(totalOccurrences);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const frequenceLabel = getFrequenceLabel(
    prestation.frequence,
    prestation.frequenceParPeriode,
    prestation.intervalleJours,
  );

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    router.refresh();
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const result = await deletePrestationAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
      setIsDeleting(false);
    } else if (result?.data) {
      toast.success("Prestation supprimée.");
      router.push("/app/prestations");
    }
  };

  return (
    <div className="container mx-auto flex h-full max-w-5xl flex-col overflow-hidden p-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex-shrink-0 space-y-4">
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

      <Separator className="my-6 flex-shrink-0" />

      {/* ==================== TABS ==================== */}
      <Tabs defaultValue="parametres" className="flex min-h-0 flex-1 flex-col">
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
            {interventionsCount > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-1.5 text-xs">
                {interventionsCount}
              </span>
            )}
            {totalNonAssigned > 0 && (
              <span className="rounded-full bg-orange-100 px-1.5 text-xs text-orange-700">
                {totalNonAssigned} à attribuer
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ============ TAB: PARAMÈTRES ============ */}
        <TabsContent
          value="parametres"
          className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto pb-6"
        >
          {/* Badges statut + mode */}
          <div className="flex flex-wrap items-center gap-2">
            {canManage ? (
              <EditablePrestationStatutBadge
                prestation={prestation}
                executions={executions}
                onUpdate={() => router.refresh()}
              />
            ) : (
              <Badge
                className={
                  getPrestationStatutBadge(prestation.statut).className
                }
              >
                {getPrestationStatutBadge(prestation.statut).label}
              </Badge>
            )}
            <Badge
              className={
                getModePlanningBadge(prestation.modePlanning).className
              }
            >
              {getModePlanningBadge(prestation.modePlanning).label}
            </Badge>
            <Badge
              className={
                getModeCommercialBadge(prestation.modeCommercial).className
              }
            >
              {getModeCommercialBadge(prestation.modeCommercial).label}
            </Badge>
          </div>

          {/* Checklist prêt à exécuter (uniquement pour mode planifié) */}
          {prestation.modePlanning === "planifie" && (
            <ReadinessCard prestation={prestation} executions={executions} />
          )}

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
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {prestation.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Zone dangereuse — brouillon uniquement */}
          {canManage && prestation.statut === "brouillon" && (
            <Card className="border-destructive/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-destructive text-base font-medium">
                  Zone dangereuse
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                  Supprime définitivement cette prestation et toutes ses
                  données. Action irréversible.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Supprimer
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============ TAB: EXÉCUTION & TARIFS ============ */}
        <TabsContent
          value="execution"
          className="mt-6 min-h-0 flex-1 overflow-y-auto pb-6"
        >
          <ExecutionTab
            executions={executions}
            canManage={canManage}
            isPlateforme={isPlateforme}
            prestation={prestation}
            onExecutionsChange={setExecutions}
          />
        </TabsContent>

        {/* ============ TAB: INTERVENTIONS ============ */}
        <TabsContent
          value="interventions"
          className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <InterventionsTab
            initialOccurrences={occurrences}
            totalOccurrences={totalOccurrences}
            prestation={prestation}
            canManage={canManage}
            onUpdate={() => router.refresh()}
            onCountChange={setInterventionsCount}
            availableSites={availableSites}
          />
        </TabsContent>
      </Tabs>

      {/* ==================== DIALOGS ==================== */}
      <PrestationFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        prestation={prestation}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la prestation ?</AlertDialogTitle>
            <AlertDialogDescription>
              La prestation <strong>{prestation.serviceNom}</strong> —{" "}
              {prestation.siteNom} sera définitivement supprimée. Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} variant="outline">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== EDITABLE STATUT BADGE ====================

function EditablePrestationStatutBadge({
  prestation,
  executions,
  onUpdate,
}: {
  prestation: PrestationListItem;
  executions: ExecutionWithPrix[];
  onUpdate: () => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);
  const badge = getPrestationStatutBadge(prestation.statut);
  const transitions = STATUT_TRANSITIONS[prestation.statut] ?? [];

  const hasActiveExecution = executions.some(
    (e) => e.actif && e.prix.some((p) => p.actif),
  );

  const doTransition = async (newStatut: ClientServiceStatutType) => {
    setIsUpdating(true);
    const result = await updatePrestationStatutAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      statut: newStatut,
    });
    setIsUpdating(false);
    setConfirmActivateOpen(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data) {
      toast.success(result.data.message);
      onUpdate();
    }
  };

  const handleChange = async (newStatut: string) => {
    if (newStatut === prestation.statut) return;
    // Intercept brouillon → actif : demander confirmation
    if (prestation.statut === "brouillon" && newStatut === "actif") {
      setConfirmActivateOpen(true);
      return;
    }
    await doTransition(newStatut as ClientServiceStatutType);
  };

  // Statut terminal : badge statique
  if (transitions.length === 0) {
    return <Badge className={badge.className}>{badge.label}</Badge>;
  }

  const availableStatuts: ClientServiceStatutType[] = [
    prestation.statut,
    ...transitions,
  ];

  return (
    <>
      {isUpdating ? (
        <Badge className={cn(badge.className, "gap-1.5")}>
          <Loader2 className="h-3 w-3 animate-spin" />
          {badge.label}
        </Badge>
      ) : (
        <Select value={prestation.statut} onValueChange={handleChange}>
          <SelectTrigger
            className={cn(
              "inline-flex !h-auto w-fit items-center gap-1 rounded-md border-0 !px-2 !py-0.5 text-xs font-medium whitespace-nowrap transition-opacity hover:opacity-80 [&>svg]:pointer-events-none",
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
      )}

      {/* Confirm dialog : brouillon → actif */}
      <AlertDialog
        open={confirmActivateOpen}
        onOpenChange={setConfirmActivateOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activer la prestation ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                {prestation.modePlanning === "planifie" && (
                  <p>
                    Les interventions seront générées automatiquement pour les{" "}
                    <strong>90 prochains jours</strong> selon la fréquence
                    configurée.
                  </p>
                )}

                {prestation.modePlanning === "planifie" &&
                  !hasActiveExecution && (
                    <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2">
                      <p className="font-medium text-orange-800">
                        Aucun prestataire actif configuré
                      </p>
                      <p className="mt-0.5 text-orange-700">
                        Les interventions seront créées avec le statut{" "}
                        <strong>À attribuer</strong>. Vous pourrez ajouter un
                        prestataire dans l&apos;onglet &quot;Exécution &amp;
                        Tarifs&quot; pour les assigner automatiquement.
                      </p>
                    </div>
                  )}

                {prestation.modePlanning === "planifie" &&
                  hasActiveExecution && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">
                      <p className="font-medium text-green-800">
                        Prestataire actif configuré
                      </p>
                      <p className="mt-0.5 text-green-700">
                        Les interventions seront assignées automatiquement au
                        prestataire prioritaire.
                      </p>
                    </div>
                  )}

                <p className="text-muted-foreground text-xs">
                  Une prestation activée ne peut pas revenir en brouillon. Pour
                  suspendre, utilisez &quot;En pause&quot;.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Annuler</AlertDialogCancel>
            <Button onClick={() => doTransition("actif")} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Activation en cours...
                </>
              ) : (
                "Activer"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
  isPlateforme,
  prestation,
  onExecutionsChange,
}: {
  executions: ExecutionWithPrix[];
  canManage: boolean;
  isPlateforme: boolean;
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
            Ajoutez un prestataire pour permettre l&apos;exécution des
            interventions planifiées.
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
          modeCommercial={prestation.modeCommercial}
          isPlateforme={isPlateforme}
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
              <span>Jusqu&apos;au {formatDate(execution.dateFinValidite)}</span>
            )}
          </div>
        </CardHeader>

        {execution.prix.length > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
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

const OCCURRENCE_STATUT_LABELS: Record<
  string,
  { label: string; className: string }
> = {
  planifiee: { label: "Planifiée", className: "bg-blue-100 text-blue-700" },
  en_cours: { label: "En cours", className: "bg-amber-100 text-amber-700" },
  terminee: { label: "Terminée", className: "bg-green-100 text-green-700" },
  non_honoree: { label: "Non honorée", className: "bg-red-100 text-red-700" },
  annulee: { label: "Annulée", className: "bg-gray-100 text-gray-600" },
};

type OccurrenceStatutFilter =
  | "planifiee"
  | "en_cours"
  | "terminee"
  | "non_honoree"
  | "annulee"
  | "";

type OccurrenceFiltersState = {
  statut: OccurrenceStatutFilter;
  nonAssignedOnly: boolean;
  siteId: string;
};

const DEFAULT_FILTERS: OccurrenceFiltersState = {
  statut: "",
  nonAssignedOnly: false,
  siteId: "",
};

const PAGE_SIZE = 50;

function InterventionsTab({
  initialOccurrences,
  totalOccurrences,
  prestation,
  canManage,
  onUpdate,
  onCountChange,
  availableSites,
}: {
  initialOccurrences: OccurrenceListItem[];
  totalOccurrences: number;
  prestation: PrestationListItem;
  canManage: boolean;
  onUpdate: () => void;
  onCountChange: (count: number) => void;
  availableSites: Array<{ id: string; nom: string }>;
}) {
  const [occurrences, setOccurrences] =
    useState<OccurrenceListItem[]>(initialOccurrences);
  const [displayedTotal, setDisplayedTotal] = useState(totalOccurrences);
  const [filters, setFilters] =
    useState<OccurrenceFiltersState>(DEFAULT_FILTERS);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialOccurrences.length === PAGE_SIZE && totalOccurrences > PAGE_SIZE,
  );
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  const activeFiltersCount = [
    filters.statut !== "",
    filters.nonAssignedOnly,
    filters.siteId !== "",
  ].filter(Boolean).length;

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    const result = await getOccurrencesPageAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      offset: occurrences.length,
      limit: PAGE_SIZE,
      statut: filters.statut || undefined,
      nonAssignedOnly: filters.nonAssignedOnly || undefined,
      siteId: filters.siteId || undefined,
      sortDir,
    });
    if (result?.data) {
      const newItems = result.data.occurrences;
      setOccurrences((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length === PAGE_SIZE);
    }
    setIsLoadingMore(false);
  }, [
    prestation.id,
    prestation.entrepriseId,
    occurrences.length,
    filters.statut,
    filters.nonAssignedOnly,
    filters.siteId,
    sortDir,
  ]);

  const { rootRef, targetRef } = useIntersection<HTMLDivElement>({
    isLoading: isLoadingMore,
    hasMore,
    onLoadMore: loadMore,
    rootMargin: "200px",
    disabled: isFiltering,
  });

  const canGenerate =
    prestation.statut === "actif" && prestation.modePlanning === "planifie";

  const applyFilters = async (
    newFilters: OccurrenceFiltersState,
    newSortDir: "asc" | "desc",
  ) => {
    setIsFiltering(true);
    const result = await getOccurrencesPageAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      offset: 0,
      limit: PAGE_SIZE,
      statut: newFilters.statut || undefined,
      nonAssignedOnly: newFilters.nonAssignedOnly || undefined,
      siteId: newFilters.siteId || undefined,
      sortDir: newSortDir,
    });
    if (result?.data) {
      setOccurrences(result.data.occurrences);
      setHasMore(result.data.occurrences.length === PAGE_SIZE);
      if (result.data.filteredTotal !== undefined) {
        setDisplayedTotal(result.data.filteredTotal);
        onCountChange(result.data.filteredTotal);
      }
    }
    setIsFiltering(false);
  };

  const handleFiltersApply = (newFilters: OccurrenceFiltersState) => {
    setFilters(newFilters);
    void applyFilters(newFilters, sortDir);
  };

  const handleSortApply = (newSortDir: "asc" | "desc") => {
    setSortDir(newSortDir);
    void applyFilters(filters, newSortDir);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* En-tête : info fenêtre + contrôles */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {isFiltering ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Chargement...
            </span>
          ) : (
            <>
              Fenêtre glissante de <strong>90 jours</strong> —{" "}
              {displayedTotal} intervention{displayedTotal > 1 ? "s" : ""}
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={() => setFiltersDialogOpen(true)}
          >
            <Filter className="h-3 w-3" />
            Filtrer
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={() => setSortDialogOpen(true)}
          >
            <ArrowDownUp className="h-3 w-3" />
            Trier
          </Button>
        </div>
      </div>

      {/* Container scrollable — prend tout l'espace restant */}
      <div
        ref={rootRef}
        className="min-h-0 flex-1 overflow-y-auto rounded-md border"
      >
        {occurrences.length === 0 && !isFiltering ? (
          <div className="py-16 text-center">
            <Wrench className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-lg font-medium">
              Aucune intervention
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {activeFiltersCount > 0
                ? "Aucune intervention ne correspond aux filtres sélectionnés."
                : canGenerate
                  ? "Aucune intervention prévue dans les 90 prochains jours. Vérifiez les dates du contrat et le périmètre de sites."
                  : "La prestation doit être active avec un mode planifié pour générer des interventions."}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {occurrences.map((occ) => (
              <OccurrenceRow
                key={occ.id}
                occ={occ}
                prestation={prestation}
                canManage={canManage}
                onUpdate={onUpdate}
              />
            ))}
            {/* Sentinel d'infinite scroll */}
            <div ref={targetRef} className="h-1" />
            {isLoadingMore && (
              <div className="flex justify-center py-3">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      <OccurrencesFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={filters}
        onApply={handleFiltersApply}
        availableSites={availableSites}
      />
      <OccurrencesSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        currentSortDir={sortDir}
        onApply={handleSortApply}
      />
    </div>
  );
}

function OccurrenceRow({
  occ,
  prestation,
  canManage,
  onUpdate,
}: {
  occ: OccurrenceListItem;
  prestation: PrestationListItem;
  canManage: boolean;
  onUpdate: () => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const badge = OCCURRENCE_STATUT_LABELS[occ.statut] ?? {
    label: occ.statut,
    className: "bg-gray-100 text-gray-600",
  };

  const handleTransition = async (
    statut: "en_cours" | "terminee" | "non_honoree" | "annulee",
  ) => {
    setIsUpdating(true);
    const result = await updateOccurrenceStatutAction({
      occurrenceId: occ.id,
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      statut,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data) {
      toast.success(result.data.message);
      onUpdate();
    }
    setIsUpdating(false);
  };

  return (
    <>
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      {/* Infos gauche */}
      <div className="flex items-start gap-3">
        <Calendar className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
        <div className="space-y-0.5">
          <span className="font-medium">
            {occ.dateDebutPrevue
              ? formatDateTime(occ.dateDebutPrevue)
              : "Date non définie"}
          </span>
          {occ.siteNom && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {occ.siteNom}
            </div>
          )}
        </div>
      </div>

      {/* Badges + actions droite */}
      <div className="flex items-center gap-2">
        {/* Badge "À attribuer" */}
        {!occ.executionId && (
          <Badge className="bg-orange-100 text-xs text-orange-700">
            À attribuer
          </Badge>
        )}

        {/* Badge statut */}
        <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>

        {/* Boutons d'action (uniquement si canManage) */}
        {canManage && occ.statut === "planifiee" && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => handleTransition("en_cours")}
              disabled={isUpdating || !occ.executionId}
              title={
                !occ.executionId
                  ? "Attribuez un prestataire avant de démarrer"
                  : "Démarrer l'intervention"
              }
            >
              <Play className="h-3 w-3" />
              Démarrer
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              onClick={() => setCancelDialogOpen(true)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
          </>
        )}

        {canManage && occ.statut === "en_cours" && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => handleTransition("terminee")}
              disabled={isUpdating}
            >
              Terminer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive h-7 text-xs"
              onClick={() => handleTransition("non_honoree")}
              disabled={isUpdating}
            >
              Non honorée
            </Button>
          </>
        )}
      </div>
    </div>

    <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler cette intervention ?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm">
              <p>
                L&apos;intervention du{" "}
                <strong>
                  {occ.dateDebutPrevue
                    ? formatDateTime(occ.dateDebutPrevue)
                    : "date non définie"}
                </strong>{" "}
                passera au statut <strong>Annulée</strong>.
              </p>
              <p className="text-muted-foreground">
                Cette action est irréversible. L&apos;intervention restera
                visible dans l&apos;historique mais ne sera plus exécutée.
                Elle ne sera pas remplacée par une nouvelle occurrence.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>
            Conserver
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setCancelDialogOpen(false);
              void handleTransition("annulee");
            }}
            disabled={isUpdating}
            variant="destructive"
          >
            {isUpdating ? "Annulation..." : "Confirmer l'annulation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

// ==================== OCCURRENCES FILTERS DIALOG ====================

function OccurrencesFiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  onApply,
  availableSites,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: OccurrenceFiltersState;
  onApply: (filters: OccurrenceFiltersState) => void;
  availableSites: Array<{ id: string; nom: string }>;
}) {
  const activeFiltersCount = [
    currentFilters.statut !== "",
    currentFilters.nonAssignedOnly,
    currentFilters.siteId !== "",
  ].filter(Boolean).length;

  const handleChange = (partial: Partial<OccurrenceFiltersState>) => {
    onApply({ ...currentFilters, ...partial });
  };

  const handleReset = () => onApply(DEFAULT_FILTERS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="text-primary h-5 w-5" />
            Filtrer les interventions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Statut */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <Select
              value={currentFilters.statut || "all"}
              onValueChange={(v) =>
                handleChange({
                  statut: v === "all" ? "" : (v as OccurrenceStatutFilter),
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(OCCURRENCE_STATUT_LABELS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Site (uniquement si plusieurs sites) */}
          {availableSites.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Site</label>
              <Select
                value={currentFilters.siteId || "all"}
                onValueChange={(v) =>
                  handleChange({ siteId: v === "all" ? "" : v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les sites</SelectItem>
                  {availableSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* À attribuer */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="nonAssignedSwitch"
              className="cursor-pointer text-sm font-medium"
            >
              À attribuer uniquement
            </label>
            <Switch
              id="nonAssignedSwitch"
              checked={currentFilters.nonAssignedOnly}
              onCheckedChange={(checked) =>
                handleChange({ nonAssignedOnly: checked })
              }
            />
          </div>

          {/* Réinitialiser */}
          <div className="flex justify-end border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={activeFiltersCount === 0}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Réinitialiser
              {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== OCCURRENCES SORT DIALOG ====================

function OccurrencesSortDialog({
  open,
  onOpenChange,
  currentSortDir,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSortDir: "asc" | "desc";
  onApply: (sortDir: "asc" | "desc") => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownUp className="text-primary h-5 w-5" />
            Trier les interventions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trier par</label>
            <Select value="dateDebutPrevue" onValueChange={() => undefined}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateDebutPrevue">
                  Date de début prévue
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ordre</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={currentSortDir === "asc" ? "default" : "outline"}
                className="flex-1"
                onClick={() => onApply("asc")}
              >
                <ArrowUpAZ className="mr-2 h-4 w-4" />
                Croissant
              </Button>
              <Button
                type="button"
                variant={currentSortDir === "desc" ? "default" : "outline"}
                className="flex-1"
                onClick={() => onApply("desc")}
              >
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                Décroissant
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== READINESS CARD ====================

function ReadinessCard({
  prestation,
  executions,
}: {
  prestation: PrestationListItem;
  executions: ExecutionWithPrix[];
}) {
  const isReadyToSchedule = prestation.statut === "actif";
  const isReadyToExecute =
    isReadyToSchedule &&
    executions.some((e) => e.actif && e.prix.some((p) => p.actif));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          État de préparation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <ReadinessRow
          ok={isReadyToSchedule}
          label="Prêt à planifier"
          hint={
            !isReadyToSchedule
              ? "Activez la prestation pour générer les interventions"
              : undefined
          }
        />
        <ReadinessRow
          ok={isReadyToExecute}
          label="Prêt à exécuter"
          hint={
            !isReadyToExecute
              ? isReadyToSchedule
                ? "Ajoutez un prestataire actif avec un tarif actif (onglet Exécution & Tarifs)"
                : "Activez la prestation et ajoutez un prestataire actif avec un tarif actif"
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
}

function ReadinessRow({
  ok,
  label,
  hint,
}: {
  ok: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
      ) : (
        <XCircle className="text-muted-foreground/50 mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      <div>
        <span className={ok ? "text-foreground" : "text-muted-foreground"}>
          {label}
        </span>
        {!ok && hint && (
          <p className="text-muted-foreground/70 mt-0.5 text-xs">{hint}</p>
        )}
      </div>
    </div>
  );
}
