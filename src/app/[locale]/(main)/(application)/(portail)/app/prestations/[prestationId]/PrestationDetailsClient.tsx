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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  deleteExecutionAction,
  toggleExecutionActifAction,
} from "@/server/actions/clientServiceExecutionsActions";
import { getOccurrencesPageAction } from "@/server/actions/clientServiceOccurrencesActions";
import {
  deletePrestationAction,
  updatePrestationStatutAction,
} from "@/server/actions/clientServicesActions";
import {
  type ExecutionChecklistItem,
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
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  CalendarX,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  HandPlatter,
  Info,
  ListChecks,
  Loader2,
  type LucideIcon,
  MapPin,
  Pencil,
  PencilLine,
  Plus,
  Power,
  Repeat,
  RotateCcw,
  Settings,
  Tag,
  Timer,
  Trash2,
  TriangleAlert,
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
import { ExecutionEditDialog } from "./ExecutionEditDialog";
import { ExecutionFormDialog } from "./ExecutionFormDialog";
import { OccurrenceOnDemandDialog } from "./OccurrenceOnDemandDialog";
import { TacheListeManagerDialog } from "./TacheListeManagerDialog";
import { TacheListePickerDialog } from "./TacheListePickerDialog";

type PrestationDetailsClientProps = {
  prestation: PrestationListItem;
  canManage: boolean;
  isPlateforme: boolean;
  canChangeModePilotage: boolean;
  clientHasActiveAdmin: boolean;
  executions: ExecutionWithPrix[];
  occurrences: OccurrenceListItem[];
  totalOccurrences: number;
  totalNonAssigned: number;
  availableSites: Array<{ id: string; nom: string }>;
  defaultTab?: string;
};

const JOUR_LABELS: Record<number, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
  7: "Dimanche",
};

export function PrestationDetailsClient({
  prestation,
  canManage,
  isPlateforme,
  canChangeModePilotage,
  clientHasActiveAdmin,
  executions: initialExecutions,
  occurrences,
  totalOccurrences,
  totalNonAssigned,
  availableSites,
  defaultTab = "parametres",
}: PrestationDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [executions, setExecutions] =
    useState<ExecutionWithPrix[]>(initialExecutions);
  const [interventionsCount, setInterventionsCount] =
    useState(totalOccurrences);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatut, setIsUpdatingStatut] = useState(false);
  const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);

  const hasActiveExecution = executions.some(
    (e) => e.actif && e.prix.some((p) => p.actif),
  );

  const doStatutTransition = async (newStatut: ClientServiceStatutType) => {
    setIsUpdatingStatut(true);
    const result = await updatePrestationStatutAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      statut: newStatut,
    });
    setIsUpdatingStatut(false);
    setConfirmActivateOpen(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data) {
      toast.success(result.data.message);
      router.refresh();
    }
  };

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
                  <Building className="h-4 w-4" />
                  {prestation.entrepriseNom}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
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

      {/* ==================== STATUT ==================== */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={getPrestationStatutBadge(prestation.statut).className}
            >
              {getPrestationStatutBadge(prestation.statut).label}
            </Badge>
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

          {/* CTA selon statut */}
          {canManage && prestation.statut === "brouillon" && (
            <Button
              onClick={() => setConfirmActivateOpen(true)}
              disabled={isUpdatingStatut || !hasActiveExecution}
              className="gap-2"
              size="sm"
            >
              {isUpdatingStatut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              Activer la prestation
            </Button>
          )}
          {canManage && prestation.statut === "actif" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => doStatutTransition("en_pause")}
                disabled={isUpdatingStatut}
              >
                {isUpdatingStatut ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Mettre en pause"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => doStatutTransition("termine")}
                disabled={isUpdatingStatut}
              >
                Terminer
              </Button>
            </div>
          )}
          {canManage && prestation.statut === "en_pause" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => doStatutTransition("actif")}
                disabled={isUpdatingStatut}
              >
                {isUpdatingStatut ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Reprendre"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => doStatutTransition("termine")}
                disabled={isUpdatingStatut}
              >
                Terminer
              </Button>
            </div>
          )}
        </div>

        {/* Disclaimer contextuel — encart amber */}
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            {prestation.statut === "brouillon" &&
              (canManage
                ? hasActiveExecution
                  ? "Aucune intervention ne sera planifiée tant que la prestation est en brouillon. Vous pouvez l'activer dès maintenant."
                  : executions.length === 0
                    ? "Aucune intervention ne sera planifiée tant que la prestation est en brouillon. Définissez d'abord une exécution dans l'onglet « Exécution & Tarifs », puis activez la prestation."
                    : "Aucune intervention ne sera planifiée tant que la prestation est en brouillon. Activez d'abord une exécution dans l'onglet « Exécution & Tarifs », puis activez la prestation."
                : "Aucune intervention ne sera planifiée tant que la prestation est en brouillon. Contactez un administrateur pour l'activer.")}
            {prestation.statut === "actif" &&
              "Cette prestation est active. Les interventions sont planifiées selon la fréquence configurée."}
            {prestation.statut === "en_pause" &&
              "Cette prestation est en pause. Aucune nouvelle intervention ne sera générée jusqu'à la reprise."}
            {prestation.statut === "termine" &&
              "Cette prestation est terminée. Aucune nouvelle intervention ne peut être générée."}
          </p>
        </div>
      </div>

      {/* AlertDialog confirmation activation */}
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
                  suspendre, utilisez &quot;Mettre en pause&quot;.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatut}>
              Annuler
            </AlertDialogCancel>
            <Button
              onClick={() => doStatutTransition("actif")}
              disabled={isUpdatingStatut}
            >
              {isUpdatingStatut ? (
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

      {/* ==================== TABS ==================== */}
      <Tabs
        value={activeTab}
        onValueChange={(tab) => {
          setActiveTab(tab);
          router.replace({
            pathname: "/app/prestations/[prestationId]",
            params: { prestationId: prestation.id },
            query: { tab },
          });
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
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
            <Calendar className="h-4 w-4" />
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
          {/* Disclaimer paramètres */}
          <Collapsible defaultOpen>
            <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
              <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
              <div className="text-muted-foreground w-full space-y-2 text-xs">
                <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between">
                  <p className="text-foreground font-medium">
                    Impact des modifications sur les données
                  </p>
                  <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-foreground font-medium text-[11px] uppercase tracking-wide">
                        Activer la prestation
                      </p>
                      <p>
                        <strong>Mode Planifié</strong> — Déclenche la
                        génération des interventions via une{" "}
                        <strong>fenêtre glissante</strong> : le système crée
                        automatiquement les interventions à venir jusqu&apos;à
                        un horizon configurable (ex. 8 semaines), puis continue
                        à en générer de nouvelles au fil du temps. Les
                        interventions sont attribuées à l&apos;exécution active
                        du moment. Sans exécution active, aucune intervention
                        n&apos;est générée.
                      </p>
                      <p>
                        <strong>Mode À la demande</strong> — Aucune
                        intervention n&apos;est générée automatiquement. Les
                        interventions sont créées manuellement au cas par cas.
                        Dans les deux modes, une{" "}
                        <strong>exécution active est obligatoire</strong> pour
                        créer une intervention : sans prestataire couvrant la
                        date visée, la création est bloquée.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-foreground font-medium text-[11px] uppercase tracking-wide">
                        Modifier la configuration (fréquence, dates,
                        planification)
                      </p>
                      <p>
                        Les interventions{" "}
                        <strong>à venir non encore démarrées</strong> sont
                        supprimées et régénérées automatiquement avec les
                        nouveaux paramètres. Tout ce qui est déjà réalisé, en
                        cours ou annulé est <strong>conservé intact</strong>.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-foreground font-medium text-[11px] uppercase tracking-wide">
                        Mettre en pause
                      </p>
                      <p>
                        Les interventions{" "}
                        <strong>à venir non encore démarrées</strong> sont{" "}
                        <strong>supprimées définitivement</strong> — pas
                        annulées, vraiment effacées. À la reprise, de nouvelles
                        interventions sont régénérées. L&apos;historique passé
                        est conservé.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-foreground font-medium text-[11px] uppercase tracking-wide">
                        Terminer la prestation
                      </p>
                      <p>
                        Les interventions{" "}
                        <strong>à venir non encore démarrées</strong> passent en{" "}
                        <strong>annulée</strong> — elles restent visibles dans
                        l&apos;historique. Tout le passé est conservé
                        intégralement.
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </div>
          </Collapsible>

          {/* Planification + Période — carte unifiée */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <HandPlatter className="text-primary h-4 w-4" />
                  Prestation
                </CardTitle>
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <InfoRow
                icon={Tag}
                label="Service"
                value={prestation.serviceNom}
              />
              <InfoRow icon={Repeat} label="Fréquence" value={frequenceLabel} />
              <InfoRow
                icon={CalendarCheck}
                label="Date de début"
                value={formatDate(prestation.dateDebut)}
              />
              {prestation.joursPreference &&
                prestation.joursPreference.length > 0 && (
                  <InfoRow
                    icon={CalendarDays}
                    label="Jours préférés"
                    value={prestation.joursPreference
                      .map((j) => JOUR_LABELS[j] ?? `Jour ${j}`)
                      .join(", ")}
                  />
                )}
              <InfoRow
                icon={CalendarX}
                label="Date de fin"
                value={
                  prestation.dateFin
                    ? formatDate(prestation.dateFin)
                    : "∞ Sans échéance"
                }
              />
              {prestation.heureDebutPreference && (
                <InfoRow
                  icon={Clock}
                  label="Heure de début"
                  value={prestation.heureDebutPreference}
                />
              )}
              <InfoRow
                icon={CalendarPlus}
                label="Créée le"
                value={formatDate(prestation.createdAt)}
              />
              {prestation.dureeEstimeeMinutes && (
                <InfoRow
                  icon={Timer}
                  label="Durée estimée"
                  value={formatDuree(prestation.dureeEstimeeMinutes)}
                />
              )}
              <InfoRow
                icon={PencilLine}
                label="Modifiée le"
                value={formatDate(prestation.updatedAt)}
              />
            </CardContent>
          </Card>

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
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Supprime définitivement la prestation et{" "}
                    <strong>toutes ses données sans exception</strong> :
                    configuration, planification, prestataires configurés,
                    tarifs, et toutes les interventions générées (même
                    passées).
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Cette action est réservée aux prestations créées par
                    erreur. Si des interventions ont déjà été réalisées et
                    comptabilisées, supprimer la prestation efface
                    définitivement cet historique financier. Irréversible.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
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
            canChangeModePilotage={canChangeModePilotage}
            clientHasActiveAdmin={clientHasActiveAdmin}
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
            onCountChange={setInterventionsCount}
            availableSites={availableSites}
            canManage={canManage}
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

// ==================== SUB-COMPONENTS ====================

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground flex shrink-0 items-center gap-1.5">
        {Icon && <Icon className="text-primary h-3.5 w-3.5 shrink-0" />}
        {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

// ==================== TAB: EXÉCUTION & TARIFS ====================

function ExecutionTab({
  executions,
  canManage,
  isPlateforme,
  canChangeModePilotage,
  clientHasActiveAdmin,
  prestation,
  onExecutionsChange,
}: {
  executions: ExecutionWithPrix[];
  canManage: boolean;
  isPlateforme: boolean;
  canChangeModePilotage: boolean;
  clientHasActiveAdmin: boolean;
  prestation: PrestationListItem;
  onExecutionsChange: (executions: ExecutionWithPrix[]) => void;
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // En mode intermédiaire, seule la plateforme configure les prestataires
  const canAddExecution =
    canManage && (isPlateforme || prestation.modeCommercial === "direct");
  const showIntermediaireInfo =
    canManage &&
    !isPlateforme &&
    prestation.modeCommercial === "intermediaire_fm4all";

  return (
    <div className="space-y-4">
      {showIntermediaireInfo && (
        <div className="bg-muted/50 flex items-start gap-3 rounded-lg border p-4">
          <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Configuration gérée par FM4ALL</p>
            <p className="text-muted-foreground mt-1">
              En mode intermédiaire, l&apos;équipe FM4ALL sélectionne et
              configure les prestataires pour cette prestation. Contactez FM4ALL
              si vous souhaitez modifier l&apos;exécution.
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer exécutions */}
      <Collapsible defaultOpen>
        <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
          <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-muted-foreground w-full space-y-2 text-xs">
            <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between">
              <p className="text-foreground font-medium">
                Comment fonctionne le système d&apos;exécution ?
              </p>
              <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="space-y-2">
                <p>
                  Une <strong>exécution</strong> représente le contrat
                  opérationnel entre la prestation et un prestataire : elle
                  porte les <strong>tarifs appliqués</strong>, la{" "}
                  <strong>fenêtre de validité</strong> (date de début / date de
                  fin optionnelle), la <strong>priorité</strong> et le{" "}
                  <strong>mode de pilotage</strong>. C&apos;est l&apos;exécution
                  qui détermine quel prestataire réalise les interventions et à
                  quel prix. Une même prestation peut avoir plusieurs exécutions
                  (pour gérer les transitions de prestataire ou des tarifs
                  différenciés par période).
                </p>

                <div className="space-y-1">
                  <p className="text-foreground font-medium text-[11px] uppercase tracking-wide">
                    Sélection automatique de l&apos;exécution
                  </p>
                  <p>
                    Chaque intervention est automatiquement associée à
                    l&apos;exécution <strong>active</strong> dont la{" "}
                    <strong>priorité est la plus haute</strong> et dont la
                    fenêtre de validité (
                    <em>date de début → date de fin</em>) couvre la date de
                    l&apos;intervention. En cas d&apos;égalité de priorité,
                    l&apos;exécution dont la{" "}
                    <strong>date de début est la plus récente</strong>{" "}
                    l&apos;emporte.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-foreground font-medium text-[11px] uppercase tracking-wide">
                    Modifier une exécution (tarifs, dates, priorité)
                  </p>
                  <p>
                    Les anciens tarifs sont <strong>archivés</strong> (conservés,
                    marqués inactifs). Les interventions à venir non encore
                    démarrées sont{" "}
                    <strong>supprimées et régénérées</strong> avec les nouveaux
                    paramètres. Les interventions passées et leurs données
                    financières clôturées sont <strong>conservées</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-foreground font-medium text-[11px] uppercase tracking-wide">
                    Changer d&apos;exécution en cours de prestation
                  </p>
                  <p>
                    Créez une nouvelle exécution avec une{" "}
                    <strong>date de début au jour de la transition</strong>,
                    puis désactivez l&apos;ancienne. Le moteur bascule
                    automatiquement : les interventions avant la date de
                    transition restent liées à l&apos;ancien prestataire, celles
                    après au nouveau. L&apos;historique est intact.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-foreground font-medium text-[11px] uppercase tracking-wide">
                    Désactiver une exécution
                  </p>
                  <p>
                    Arrête la génération de nouvelles interventions pour ce
                    prestataire. Les interventions à venir non encore démarrées{" "}
                    <strong>restent assignées à ce prestataire</strong>{" "}
                    jusqu&apos;à leur échéance. L&apos;historique passé est
                    conservé intégralement.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-foreground font-medium text-[11px] uppercase tracking-wide">
                    ⚠ Supprimer une exécution (corbeille)
                  </p>
                  <p>
                    Supprime définitivement l&apos;exécution, ses tarifs,{" "}
                    <strong>et toutes les données financières clôturées</strong>{" "}
                    (montants facturés, récapitulatifs) liées à ce prestataire.
                    Les interventions existantes perdent leur référence
                    prestataire.{" "}
                    <strong>
                      À n&apos;utiliser que pour les exécutions créées par
                      erreur, sans aucune intervention réalisée associée.
                    </strong>
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </div>
      </Collapsible>

      {canAddExecution && (
        <div className="flex justify-end">
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Zap className="h-4 w-4" />
            Ajouter une exécution
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
            {canAddExecution
              ? "Ajoutez un prestataire pour permettre l'exécution des interventions planifiées."
              : "FM4ALL configurera le prestataire pour cette prestation."}
          </p>
        </div>
      ) : (
        executions.map((execution) => (
          <ExecutionCard
            key={execution.id}
            execution={execution}
            canManage={canManage}
            isPlateforme={isPlateforme}
            canChangeModePilotage={canChangeModePilotage}
            clientHasActiveAdmin={clientHasActiveAdmin}
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
          canChangeModePilotage={canChangeModePilotage}
          clientHasActiveAdmin={clientHasActiveAdmin}
          clientNom={prestation.entrepriseNom}
          serviceNom={prestation.serviceNom}
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
  isPlateforme,
  canChangeModePilotage,
  clientHasActiveAdmin,
  prestation,
  onExecutionsChange,
}: {
  execution: ExecutionWithPrix;
  canManage: boolean;
  isPlateforme: boolean;
  canChangeModePilotage: boolean;
  clientHasActiveAdmin: boolean;
  prestation: PrestationListItem;
  onExecutionsChange: (executions: ExecutionWithPrix[]) => void;
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [checklistPickerOpen, setChecklistPickerOpen] = useState(false);
  const [checklistManagerOpen, setChecklistManagerOpen] = useState(false);
  const [localChecklistName, setLocalChecklistName] = useState<string | null>(
    execution.tacheListeTemplateName,
  );
  const [localChecklistItems, setLocalChecklistItems] = useState<
    ExecutionChecklistItem[]
  >(execution.tacheListeItems);
  const [checklistExpanded, setChecklistExpanded] = useState(false);

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
      // isActive = état avant le toggle. Si on vient de désactiver (isActive était true)
      if (isActive && result.data.futurePlanifieeCount > 0) {
        toast.info(
          `${result.data.futurePlanifieeCount} occurrence(s) planifiée(s) restent assignées à ${execution.prestataireNom ?? "ce prestataire"} jusqu'à leur échéance.`,
        );
      }
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
                    onClick={() => setEditOpen(true)}
                    aria-label="Modifier l'exécution"
                    title="Modifier dates, priorité et tarifs"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-7 w-7 ${isActive ? "text-green-600 hover:text-green-700" : "text-muted-foreground"}`}
                    onClick={handleToggle}
                    disabled={isToggling}
                    title={
                      isActive
                        ? "Désactiver cette exécution"
                        : "Activer cette exécution"
                    }
                    aria-label={isActive ? "Désactiver" : "Activer"}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive h-7 w-7"
                    onClick={() => setDeleteOpen(true)}
                    aria-label="Supprimer ce prestataire"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />À partir du{" "}
              {formatDate(execution.dateDebutValidite)}
            </span>
            {execution.dateFinValidite && (
              <span>Jusqu&apos;au {formatDate(execution.dateFinValidite)}</span>
            )}
            <Badge
              className={
                execution.modePilotage === "client"
                  ? "bg-blue-100 text-xs text-blue-700 hover:bg-blue-100"
                  : execution.modePilotage === "prestataire"
                    ? "bg-green-100 text-xs text-green-700 hover:bg-green-100"
                    : "bg-purple-100 text-xs text-purple-700 hover:bg-purple-100"
              }
            >
              <Settings className="h-3 w-3" />
              {execution.modePilotage === "client"
                ? "Géré par le client"
                : execution.modePilotage === "prestataire"
                  ? "Géré par le prestataire"
                  : "Géré en commun"}
            </Badge>
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

        {/* Section Checklist */}
        <CardContent className="border-t pt-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2 text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <ListChecks className="text-primary h-4 w-4 flex-shrink-0" />
                Checklist
              </span>
              {localChecklistName ? (
                <div className="overflow-hidden rounded-lg border">
                  {/* Header — clic sur le chevron pour déplier */}
                  <div className="flex items-center gap-2 p-3">
                    {localChecklistItems.length > 0 ? (
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        onClick={() => setChecklistExpanded((v) => !v)}
                        aria-label={
                          checklistExpanded ? "Réduire" : "Développer"
                        }
                      >
                        {checklistExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <span className="h-4 w-4 flex-shrink-0" />
                    )}
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate font-medium">
                        {localChecklistName}
                      </span>
                      <Badge
                        variant="outline"
                        className="flex-shrink-0 text-xs"
                      >
                        {localChecklistItems.length} tâche
                        {localChecklistItems.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                  {/* Items dépliés */}
                  {checklistExpanded && localChecklistItems.length > 0 && (
                    <div className="bg-muted/30 divide-y border-t">
                      {localChecklistItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 px-3 py-2 text-xs"
                        >
                          <span className="text-muted-foreground w-5 flex-shrink-0 text-center">
                            {idx + 1}.
                          </span>
                          <span className="min-w-0 flex-1 font-medium">
                            {item.titre}
                          </span>
                          {item.dureeEstimeeMinutes && (
                            <span className="text-muted-foreground flex flex-shrink-0 items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.dureeEstimeeMinutes}min
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground pl-5 italic">
                  Aucune checklist
                </span>
              )}
            </div>
            {canManage && (
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setChecklistPickerOpen(true)}
                >
                  <Pencil className="h-3 w-3" />
                  Modifier
                </Button>
                {execution.prestataireEntrepriseId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setChecklistManagerOpen(true)}
                  >
                    Gérer
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {canManage && (
        <>
          <TacheListePickerDialog
            open={checklistPickerOpen}
            onOpenChange={setChecklistPickerOpen}
            executionId={execution.id}
            prestationId={prestation.id}
            serviceId={prestation.serviceId}
            serviceNom={prestation.serviceNom}
            entrepriseId={prestation.entrepriseId}
            currentPackId={execution.tacheListeTemplateId}
            onSuccess={(pack) => {
              setLocalChecklistName(pack?.nom ?? null);
              setLocalChecklistItems(pack?.items ?? []);
              setChecklistPickerOpen(false);
            }}
          />
          {execution.prestataireEntrepriseId && (
            <TacheListeManagerDialog
              open={checklistManagerOpen}
              onOpenChange={setChecklistManagerOpen}
              serviceId={prestation.serviceId}
              serviceNom={prestation.serviceNom}
              proprietaireEntrepriseId={execution.prestataireEntrepriseId}
            />
          )}
        </>
      )}

      {canManage && (
        <ExecutionEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          execution={execution}
          prestationId={prestation.id}
          entrepriseId={prestation.entrepriseId}
          modeCommercial={prestation.modeCommercial}
          isPlateforme={isPlateforme}
          canChangeModePilotage={canChangeModePilotage}
          clientHasActiveAdmin={clientHasActiveAdmin}
          clientNom={prestation.entrepriseNom}
          serviceNom={prestation.serviceNom}
          onSuccess={(updated) => {
            onExecutionsChange(updated);
            setEditOpen(false);
          }}
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette exécution ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  L&apos;exécution{" "}
                  <strong>{execution.prestataireNom ?? "inconnu"}</strong>, ses
                  tarifs et{" "}
                  <strong>toutes les données financières clôturées</strong>{" "}
                  associées seront supprimés définitivement.
                </p>
                <p>
                  Les interventions existantes perdront leur référence
                  prestataire. Cette action est{" "}
                  <strong>irréversible</strong> — à n&apos;utiliser que si
                  aucune intervention réalisée n&apos;est associée à cette
                  exécution.
                </p>
              </div>
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

type OccurrenceStatutFilterType =
  | "planifiee"
  | "en_cours"
  | "terminee"
  | "non_honoree"
  | "annulee"
  | "";

type OccurrenceFiltersStateType = {
  statut: OccurrenceStatutFilterType;
  nonAssignedOnly: boolean;
  siteId: string;
};

const DEFAULT_FILTERS: OccurrenceFiltersStateType = {
  statut: "",
  nonAssignedOnly: false,
  siteId: "",
};

const PAGE_SIZE = 50;

function InterventionsTab({
  initialOccurrences,
  totalOccurrences,
  prestation,
  onCountChange,
  availableSites,
  canManage,
}: {
  initialOccurrences: OccurrenceListItem[];
  totalOccurrences: number;
  prestation: PrestationListItem;
  onCountChange: (count: number) => void;
  availableSites: Array<{ id: string; nom: string }>;
  canManage: boolean;
}) {
  const [occurrences, setOccurrences] =
    useState<OccurrenceListItem[]>(initialOccurrences);
  const [displayedTotal, setDisplayedTotal] = useState(totalOccurrences);
  const [filters, setFilters] =
    useState<OccurrenceFiltersStateType>(DEFAULT_FILTERS);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialOccurrences.length === PAGE_SIZE && totalOccurrences > PAGE_SIZE,
  );
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [onDemandDialogOpen, setOnDemandDialogOpen] = useState(false);

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
    newFilters: OccurrenceFiltersStateType,
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

  const handleFiltersApply = (newFilters: OccurrenceFiltersStateType) => {
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
              Fenêtre glissante de <strong>90 jours</strong> — {displayedTotal}{" "}
              intervention{displayedTotal > 1 ? "s" : ""}
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          {canManage && prestation.statut === "actif" && (
            <Button
              size="sm"
              variant="default"
              className="h-7 gap-1 text-xs"
              onClick={() => setOnDemandDialogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Ajouter une intervention
              {prestation.modePlanning === "planifie" && (
                <span className="ml-1 opacity-70">(exceptionnel)</span>
              )}
            </Button>
          )}

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
            <Calendar className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
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
              <OccurrenceRow key={occ.id} occ={occ} prestation={prestation} />
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
      <OccurrenceOnDemandDialog
        open={onDemandDialogOpen}
        onOpenChange={setOnDemandDialogOpen}
        prestation={prestation}
        onSuccess={(newOccurrence) => {
          setOccurrences((prev) => [newOccurrence, ...prev]);
          setDisplayedTotal((prev) => prev + 1);
          onCountChange(displayedTotal + 1);
        }}
      />
    </div>
  );
}

function OccurrenceRow({
  occ,
  prestation,
}: {
  occ: OccurrenceListItem;
  prestation: PrestationListItem;
}) {
  const badge = OCCURRENCE_STATUT_LABELS[occ.statut] ?? {
    label: occ.statut,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <Link
      href={{
        pathname: "/app/prestations/[prestationId]/occurrences/[occurrenceId]",
        params: { prestationId: prestation.id, occurrenceId: occ.id },
      }}
      className="hover:border-primary/30 flex items-center justify-between px-4 py-3 text-sm transition-all hover:shadow-sm"
    >
      {/* Infos gauche */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Calendar className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
        <div className="min-w-0 space-y-0.5">
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

      {/* Badges droite */}
      <div className="flex items-center gap-2">
        {!occ.executionId && (
          <Badge className="bg-orange-100 text-xs text-orange-700">
            À attribuer
          </Badge>
        )}
        <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
      </div>
    </Link>
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
  currentFilters: OccurrenceFiltersStateType;
  onApply: (filters: OccurrenceFiltersStateType) => void;
  availableSites: Array<{ id: string; nom: string }>;
}) {
  const activeFiltersCount = [
    currentFilters.statut !== "",
    currentFilters.nonAssignedOnly,
    currentFilters.siteId !== "",
  ].filter(Boolean).length;

  const handleChange = (partial: Partial<OccurrenceFiltersStateType>) => {
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
                  statut: v === "all" ? "" : (v as OccurrenceStatutFilterType),
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
              <RotateCcw className="h-4 w-4" />
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
                <ArrowUpAZ className="h-4 w-4" />
                Croissant
              </Button>
              <Button
                type="button"
                variant={currentSortDir === "desc" ? "default" : "outline"}
                className="flex-1"
                onClick={() => onApply("desc")}
              >
                <ArrowDownAZ className="h-4 w-4" />
                Décroissant
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
