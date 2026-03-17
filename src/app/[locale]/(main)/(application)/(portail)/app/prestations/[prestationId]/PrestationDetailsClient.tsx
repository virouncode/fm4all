"use client";

import {
  AlertDialog,
  AlertDialogContent,
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
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { modeAncragePeriodeCT } from "@/constants/codeTables";
import useIntersection from "@/hooks/use-intersection";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  deleteExecutionAction,
  toggleExecutionActifAction,
} from "@/server/actions/clientServiceExecutionsActions";
import { getOccurrencesPageAction } from "@/server/actions/clientServiceOccurrencesActions";
import {
  deleteRegleRecurrenceAction,
  getQuotaPlanificationAction,
  getReglesRecurrenceByPrestationAction,
} from "@/server/actions/clientServiceReglesRecurrenceActions";
import {
  deletePrestationAction,
  updatePrestationStatutAction,
} from "@/server/actions/clientServicesActions";
import {
  type ExecutionChecklistItem,
  type ExecutionWithPrix,
  type OccurrenceListItem,
} from "@/server/queries/clientServiceExecutions.query";
import type {
  QuotaConfigType,
  QuotaInfoType,
  RegleRecurrenceAvecTemplateType,
} from "@/server/queries/clientServices.query";
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
  CalendarPlus,
  CalendarX,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Filter,
  HandPlatter,
  Info,
  ListChecks,
  Loader2,
  type LucideIcon,
  MapPin,
  Pause,
  Pencil,
  PencilLine,
  Plus,
  Power,
  Repeat,
  RotateCcw,
  Settings,
  Square,
  Tag,
  Trash2,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PrestationFormDialog } from "../PrestationFormDialog";
import {
  formatDate,
  formatDateTime,
  getFamillePlanificationBadge,
  getFamillePlanificationLabel,
  getModeCommercialBadge,
  getPrestationStatutBadge,
} from "../helpers";
import { ExecutionEditDialog } from "./ExecutionEditDialog";
import { ExecutionFormDialog } from "./ExecutionFormDialog";
import { OccurrenceOnDemandDialog } from "./OccurrenceOnDemandDialog";
import { QuotaPlanificationFormDialog } from "./QuotaPlanificationFormDialog";
import { RegleRecurrenceFormDialog } from "./RegleRecurrenceFormDialog";
import { RegleTacheListePickerDialog } from "./RegleTacheListePickerDialog";
import { TacheListeManagerDialog } from "./TacheListeManagerDialog";
import { TacheListePickerDialog } from "./TacheListePickerDialog";

type PrestationDetailsClientProps = {
  prestation: PrestationListItem;
  canManage: boolean;
  /** Opérations fortes : supprimer + terminer — admin uniquement (client/prestataire) + plateforme */
  canAdmin: boolean;
  isPlateforme: boolean;
  canChangeModePilotage: boolean;
  clientHasActiveAdmin: boolean;
  executions: ExecutionWithPrix[];
  occurrences: OccurrenceListItem[];
  totalOccurrences: number;
  availableSites: Array<{ id: string; nom: string }>;
  /** Quota de la période courante — null si pas de config quota ou si mode ≠ quota_manuel */
  quotaInfo: QuotaInfoType | null;
  /** Règles de récurrence pré-chargées côté serveur (recurrence_auto uniquement) */
  initialRegles: RegleRecurrenceAvecTemplateType[];
  /** Config quota pré-chargée côté serveur (quota_manuel uniquement) */
  initialQuotaConfig: QuotaConfigType | null;
  defaultTab?: string;
};

export function PrestationDetailsClient({
  prestation,
  canManage,
  canAdmin,
  isPlateforme,
  canChangeModePilotage,
  clientHasActiveAdmin,
  executions: initialExecutions,
  occurrences,
  totalOccurrences,
  availableSites,
  quotaInfo,
  initialRegles,
  initialQuotaConfig,
  defaultTab = "parametres",
}: PrestationDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [executions, setExecutions] =
    useState<ExecutionWithPrix[]>(initialExecutions);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatut, setIsUpdatingStatut] = useState(false);
  const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);
  const [confirmPauseOpen, setConfirmPauseOpen] = useState(false);
  const [confirmTerminerOpen, setConfirmTerminerOpen] = useState(false);

  const today = new Date();
  // Pour canActivate : aligné avec le check serveur (actif suffit, pas besoin de dates valides aujourd'hui)
  const hasAnyActiveExecution = executions.some((e) => e.actif);
  // Pour le bandeau Interventions : exécution valide AUJOURD'HUI (bornes de dates respectées)
  const hasActiveExecution = executions.some(
    (e) =>
      e.actif &&
      e.dateDebutValidite <= today &&
      (e.dateFinValidite === null || e.dateFinValidite >= today),
  );
  const [hasActiveRegle, setHasActiveRegle] = useState(
    initialRegles.some((r) => r.actif),
  );
  const needsRegle = prestation.famillePlanification === "recurrence_auto";
  const canActivate = hasAnyActiveExecution && (!needsRegle || hasActiveRegle);

  const doStatutTransition = async (newStatut: ClientServiceStatutType) => {
    setIsUpdatingStatut(true);
    const result = await updatePrestationStatutAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      statut: newStatut,
    });
    setIsUpdatingStatut(false);
    setConfirmActivateOpen(false);
    setConfirmPauseOpen(false);
    setConfirmTerminerOpen(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data) {
      toast.success(result.data.message);
      router.refresh();
    }
  };

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
                getFamillePlanificationBadge(prestation.famillePlanification)
                  .className
              }
            >
              {
                getFamillePlanificationBadge(prestation.famillePlanification)
                  .label
              }
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
          {canManage && prestation.statut === "actif" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmPauseOpen(true)}
                disabled={isUpdatingStatut}
              >
                <Pause className="h-3 w-3" />
                Mettre en pause
              </Button>
              {canAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmTerminerOpen(true)}
                  disabled={isUpdatingStatut}
                >
                  <Square className="h-3 w-3" />
                  Terminer
                </Button>
              )}
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
              {canAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmTerminerOpen(true)}
                  disabled={isUpdatingStatut}
                >
                  <Square className="h-3 w-3" />
                  Terminer
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Breadcrumb workflow */}
        {(() => {
          const step3Done =
            prestation.famillePlanification === "recurrence_auto"
              ? hasActiveRegle
              : prestation.famillePlanification === "quota_manuel"
                ? initialQuotaConfig !== null
                : true;
          const step4Done = prestation.statut !== "brouillon";
          const step4Enabled =
            canManage &&
            prestation.statut === "brouillon" &&
            canActivate &&
            !isUpdatingStatut;
          const step5Enabled = prestation.statut === "actif";

          const steps = [
            {
              n: 1,
              label: "Prestation",
              done: true,
              enabled: true,
              onClick: () => setActiveTab("parametres"),
            },
            {
              n: 2,
              label: "Créer une exécution",
              done: hasAnyActiveExecution,
              enabled: true,
              onClick: () => setActiveTab("execution"),
            },
            {
              n: 3,
              label: "Configurer la planification",
              done: step3Done,
              enabled: true,
              onClick: () => setActiveTab("planification"),
            },
            {
              n: 4,
              label: "Activer la prestation",
              done: step4Done,
              enabled: step4Enabled,
              onClick: () => setConfirmActivateOpen(true),
            },
            {
              n: 5,
              label: "Gérer les interventions",
              done: step5Enabled,
              enabled: step5Enabled,
              onClick: () => setActiveTab("interventions"),
            },
          ] as const;

          // Message d'aide quand la prestation est en brouillon et que l'activation est bloquée
          const activationBlockReason =
            canManage && prestation.statut === "brouillon" && !canActivate
              ? !hasAnyActiveExecution
                ? "Ajoutez un prestataire dans l'onglet « Exécution » pour débloquer l'activation."
                : needsRegle && !hasActiveRegle
                  ? "Ajoutez une règle de planification dans l'onglet « Planification » pour débloquer l'activation."
                  : null
              : null;

          return (
            <div className="mt-3 space-y-2">
              <div className="bg-muted/30 flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5 rounded-md border px-3 py-2">
                {steps.map((step, i) => (
                  <span key={step.n} className="flex items-center gap-x-1">
                    {i > 0 && (
                      <ChevronRight className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    {step.enabled && !step.done ? (
                      <button
                        onClick={step.onClick}
                        className="hover:bg-muted hover:text-foreground text-muted-foreground rounded px-1.5 py-0.5 text-sm transition-colors"
                      >
                        <span className="mr-0.5 text-xs opacity-60">
                          {step.n}.
                        </span>
                        {step.label}
                      </button>
                    ) : step.done ? (
                      <button
                        onClick={step.enabled ? step.onClick : undefined}
                        className={cn(
                          "text-foreground rounded px-1.5 py-0.5 text-sm font-semibold",
                          step.enabled &&
                            "hover:bg-muted cursor-pointer transition-colors",
                          !step.enabled && "cursor-default",
                        )}
                      >
                        <span className="mr-0.5 text-xs font-normal opacity-60">
                          {step.n}.
                        </span>
                        {step.label}
                      </button>
                    ) : (
                      <span className="text-muted-foreground/40 px-1.5 py-0.5 text-sm">
                        <span className="mr-0.5 text-xs">{step.n}.</span>
                        {step.label}
                      </span>
                    )}
                  </span>
                ))}
              </div>
              {activationBlockReason && (
                <p className="text-muted-foreground/70 px-1 text-xs">
                  {activationBlockReason}
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Dialog confirmation activation */}
      <Dialog open={confirmActivateOpen} onOpenChange={setConfirmActivateOpen}>
        <DialogStyledContent className="max-w-md">
          <DialogStyledHeader>
            <DialogHeader>
              <DialogTitle>Activer la prestation ?</DialogTitle>
            </DialogHeader>
          </DialogStyledHeader>
          <DialogStyledBody className="space-y-3 text-sm">
            {prestation.famillePlanification === "recurrence_auto" && (
              <p>
                Les interventions seront générées automatiquement selon la règle
                de récurrence configurée.
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Une prestation activée ne peut pas revenir en brouillon. Pour
              suspendre, utilisez &quot;Mettre en pause&quot;.
            </p>
          </DialogStyledBody>
          <DialogStyledFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmActivateOpen(false)}
              disabled={isUpdatingStatut}
            >
              Annuler
            </Button>
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
          </DialogStyledFooter>
        </DialogStyledContent>
      </Dialog>

      {/* Dialog confirmation mise en pause */}
      <Dialog open={confirmPauseOpen} onOpenChange={setConfirmPauseOpen}>
        <DialogStyledContent className="max-w-md">
          <DialogStyledHeader>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pause className="size-6" />
                Mettre la prestation en pause ?
              </DialogTitle>
            </DialogHeader>
          </DialogStyledHeader>
          <DialogStyledBody className="space-y-2 text-sm">
            <p>
              Les interventions <strong>à venir non encore démarrées</strong>{" "}
              seront <strong>supprimées définitivement</strong> — pas annulées,
              vraiment effacées.
            </p>
            <p className="text-muted-foreground text-xs">
              À la reprise, de nouvelles interventions seront régénérées.
              L&apos;historique passé est conservé.
            </p>
          </DialogStyledBody>
          <DialogStyledFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmPauseOpen(false)}
              disabled={isUpdatingStatut}
            >
              Annuler
            </Button>
            <Button
              onClick={() => doStatutTransition("en_pause")}
              disabled={isUpdatingStatut}
            >
              {isUpdatingStatut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mise en pause...
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Mettre en pause
                </>
              )}
            </Button>
          </DialogStyledFooter>
        </DialogStyledContent>
      </Dialog>

      {/* Dialog confirmation terminer */}
      <Dialog open={confirmTerminerOpen} onOpenChange={setConfirmTerminerOpen}>
        <DialogStyledContent className="max-w-md">
          <DialogStyledHeader>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Square className="size-6" />
                Terminer la prestation ?
              </DialogTitle>
            </DialogHeader>
          </DialogStyledHeader>
          <DialogStyledBody className="space-y-2 text-sm">
            <p>
              Les interventions <strong>à venir non encore démarrées</strong>{" "}
              passeront en <strong>annulée</strong> — elles resteront visibles
              dans l&apos;historique.
            </p>
            <p className="text-muted-foreground text-xs">
              Cette action est irréversible. Tout le passé est conservé
              intégralement.
            </p>
          </DialogStyledBody>
          <DialogStyledFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmTerminerOpen(false)}
              disabled={isUpdatingStatut}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => doStatutTransition("termine")}
              disabled={isUpdatingStatut}
            >
              {isUpdatingStatut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Clôture en cours...
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  Terminer la prestation
                </>
              )}
            </Button>
          </DialogStyledFooter>
        </DialogStyledContent>
      </Dialog>

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="parametres"
            className="gap-1.5 text-xs sm:text-sm"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prestation</span>
          </TabsTrigger>
          <TabsTrigger value="execution" className="gap-1.5 text-xs sm:text-sm">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exécution</span>
            {executions.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-1.5 text-xs">
                {executions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="planification"
            className="gap-1.5 text-xs sm:text-sm"
          >
            <Repeat className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Planification</span>
          </TabsTrigger>
          <TabsTrigger
            value="interventions"
            className="gap-1.5 text-xs sm:text-sm"
            disabled={prestation.statut !== "actif"}
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Interventions</span>
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
                      <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                        Activer la prestation
                      </p>
                      <p>
                        <strong>Récurrence automatique</strong> —
                        L&apos;activation est bloquée sans prestataire actif.
                        Une fois activée, les interventions apparaissent dans le
                        calendrier au fur et à mesure de l&apos;approche des
                        dates. Au-delà de la semaine à venir, le calendrier
                        affiche une projection basée sur le planning configuré.
                      </p>
                      <p>
                        <strong>Quota manuel</strong> — Un nombre fixe
                        d&apos;occurrences par période (trimestre, semestre,
                        année) est alloué. Les occurrences sont créées
                        manuellement dans l&apos;enveloppe disponible.
                      </p>
                      <p>
                        <strong>Ponctuel</strong> — Aucune occurrence
                        automatique. Chaque occurrence est créée manuellement à
                        la demande.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                        Modifier la configuration (mode, dates, règles)
                      </p>
                      <p>
                        <strong>Récurrence automatique active</strong> — Les
                        interventions à venir non encore démarrées sont
                        recalculées avec les nouveaux paramètres. Tout ce qui
                        est déjà réalisé, en cours ou annulé est{" "}
                        <strong>conservé intact</strong>.
                      </p>
                      <p>
                        <strong>Quota ou ponctuel</strong> — Aucun recalcul
                        automatique.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
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
                      <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
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
              <InfoRow
                icon={Repeat}
                label="Planification"
                value={getFamillePlanificationLabel(
                  prestation.famillePlanification,
                )}
              />
              <InfoRow
                icon={CalendarCheck}
                label="Date de début"
                value={formatDate(prestation.dateDebut)}
              />
              <InfoRow
                icon={CalendarX}
                label="Date de fin"
                value={
                  prestation.dateFin
                    ? formatDate(prestation.dateFin)
                    : "∞ Sans échéance"
                }
              />
              <InfoRow
                icon={CalendarPlus}
                label="Créée le"
                value={formatDate(prestation.createdAt)}
              />
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

          {/* Zone dangereuse — brouillon uniquement, admin uniquement */}
          {canAdmin && prestation.statut === "brouillon" && (
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
                    tarifs, et toutes les interventions générées (même passées).
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Cette action est réservée aux prestations créées par erreur.
                    Si des interventions ont déjà été réalisées et
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

        {/* ============ TAB: PLANIFICATION ============ */}
        <TabsContent
          value="planification"
          className="mt-6 min-h-0 flex-1 overflow-y-auto pb-6"
        >
          <PlanificationTab
            prestation={prestation}
            canManage={canManage}
            initialRegles={initialRegles}
            initialQuotaConfig={initialQuotaConfig}
            onReglesChanged={(hasActive) => setHasActiveRegle(hasActive)}
          />
        </TabsContent>

        {/* ============ TAB: EXÉCUTION & TARIFS ============ */}
        <TabsContent
          value="execution"
          className="mt-6 min-h-0 flex-1 overflow-y-auto pb-6"
        >
          <ExecutionTab
            executions={executions}
            canManage={canManage}
            canAdmin={canAdmin}
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
            availableSites={availableSites}
            canManage={canManage}
            quotaInfo={quotaInfo}
            hasActiveExecution={hasActiveExecution}
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
        <AlertDialogContent className="max-w-md gap-0 overflow-hidden p-0">
          <div className="bg-primary/8 border-b px-5 pt-5 pr-12 pb-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la prestation ?</AlertDialogTitle>
            </AlertDialogHeader>
          </div>
          <div className="px-5 py-4 text-sm">
            La prestation <strong>{prestation.serviceNom}</strong> —{" "}
            {prestation.siteNom} sera définitivement supprimée. Cette action est
            irréversible.
          </div>
          <AlertDialogFooter className="bg-muted/30 border-t px-5 py-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
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

// ==================== TAB: PLANIFICATION ====================

function PlanificationTab({
  prestation,
  canManage,
  initialRegles,
  initialQuotaConfig,
  onReglesChanged,
}: {
  prestation: PrestationListItem;
  canManage: boolean;
  initialRegles: RegleRecurrenceAvecTemplateType[];
  initialQuotaConfig: QuotaConfigType | null;
  onReglesChanged?: (hasActive: boolean) => void;
}) {
  const famille = prestation.famillePlanification;

  const [regles, setRegles] =
    useState<RegleRecurrenceAvecTemplateType[]>(initialRegles);

  const updateRegles = useCallback(
    (newRegles: RegleRecurrenceAvecTemplateType[]) => {
      setRegles(newRegles);
      onReglesChanged?.(newRegles.some((r) => r.actif));
    },
    [onReglesChanged],
  );
  const [quota, setQuota] = useState<QuotaConfigType | null>(
    initialQuotaConfig,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRegle, setEditingRegle] =
    useState<RegleRecurrenceAvecTemplateType | null>(null);
  const [checklistRegleOpen, setChecklistRegleOpen] = useState(false);
  const [checklistRegle, setChecklistRegle] =
    useState<RegleRecurrenceAvecTemplateType | null>(null);
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    if (famille === "recurrence_auto") {
      const result = await getReglesRecurrenceByPrestationAction({
        clientServiceId: prestation.id,
        entrepriseId: prestation.entrepriseId,
      });
      if (result?.data?.regles) {
        updateRegles(result.data.regles);
      }
    } else if (famille === "quota_manuel") {
      const result = await getQuotaPlanificationAction({
        clientServiceId: prestation.id,
        entrepriseId: prestation.entrepriseId,
      });
      if (result?.data !== undefined) {
        setQuota(result.data.quota);
      }
    }
    setIsLoading(false);
  }, [famille, prestation.id, prestation.entrepriseId, updateRegles]);

  const handleDeleteRegle = async (id: string) => {
    setDeletingId(id);
    const result = await deleteRegleRecurrenceAction({
      id,
      clientServiceId: prestation.id,
      entrepriseId: prestation.entrepriseId,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else {
      updateRegles(regles.filter((r) => r.id !== id));
      toast.success("Règle supprimée.");
    }
    setDeletingId(null);
  };

  const PERIODE_LABELS: Record<string, string> = {
    trimestre: "trimestre",
    semestre: "semestre",
    annee: "an",
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  const planificationInfoBlock = (
    <Collapsible defaultOpen>
      <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
        <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
        <div className="text-muted-foreground w-full space-y-2 text-xs">
          <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between">
            <p className="text-foreground font-medium">
              Comment fonctionne le système de planification ?
            </p>
            <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                  Récurrence automatique
                </p>
                <p>
                  Les interventions se répètent selon un planning défini par des{" "}
                  <strong>règles de récurrence</strong> (ex : chaque lundi, le
                  1er du mois, toutes les 2 semaines…). Le système génère
                  automatiquement les prochaines interventions en avance et les
                  attribue au prestataire configuré dans l&apos;onglet{" "}
                  <strong>Exécution</strong>. Pour que ça fonctionne : au moins
                  une règle active + une exécution active.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                  Quota manuel
                </p>
                <p>
                  Un nombre fixe d&apos;interventions est alloué par période (ex
                  : 4 par an, 2 par trimestre). Il n&apos;y a{" "}
                  <strong>pas de génération automatique</strong> : vous
                  planifiez chaque intervention manuellement depuis
                  l&apos;onglet <strong>Interventions</strong>, dans la limite
                  du quota défini. Configurez le quota dans cet onglet, puis
                  créez les interventions une par une selon vos besoins.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                  Ponctuel
                </p>
                <p>
                  Aucune planification automatique, aucun quota. Chaque
                  intervention est créée <strong>à la demande</strong> depuis
                  l&apos;onglet <strong>Interventions</strong>. Utile pour des
                  prestations exceptionnelles ou sans calendrier fixe.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );

  // ===== PONCTUEL =====
  if (famille === "ponctuel") {
    return <div className="space-y-4">{planificationInfoBlock}</div>;
  }

  // ===== QUOTA MANUEL =====
  if (famille === "quota_manuel") {
    return (
      <div className="space-y-4">
        {planificationInfoBlock}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Quota de planification</h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Nombre d&apos;interventions à planifier manuellement par période.
            </p>
          </div>
          {canManage && (
            <Button
              size="sm"
              variant={quota ? "outline" : "default"}
              onClick={() => setQuotaDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              {quota ? "Modifier" : "Configurer"}
            </Button>
          )}
        </div>

        {quota ? (
          <Card>
            <CardContent className="grid gap-x-12 gap-y-3 pt-6 text-sm sm:grid-cols-2">
              <InfoRow
                icon={Repeat}
                label="Occurrences par période"
                value={`${quota.nbOccurrencesParPeriode} / ${PERIODE_LABELS[quota.periodeQuota] ?? quota.periodeQuota}`}
              />
              <InfoRow
                icon={CalendarCheck}
                label="Mode d'ancrage"
                value={
                  modeAncragePeriodeCT.find(
                    (m) => m.code === quota.modeAncragePeriode,
                  )?.name ?? quota.modeAncragePeriode
                }
              />
              {quota.notes && (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-xs whitespace-pre-wrap">
                    {quota.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="bg-muted/40 text-muted-foreground rounded-lg border p-4 text-sm">
            Aucun quota configuré. Cliquez sur &quot;Configurer&quot; pour
            définir le nombre d&apos;interventions à planifier.
          </div>
        )}

        <QuotaPlanificationFormDialog
          open={quotaDialogOpen}
          onOpenChange={setQuotaDialogOpen}
          prestation={prestation}
          quota={quota}
          onSuccess={load}
        />
      </div>
    );
  }

  // ===== RÉCURRENCE AUTO =====
  return (
    <div className="space-y-4">
      {planificationInfoBlock}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Règles de récurrence</h3>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Chaque règle définit un planning de répétition (ex : chaque lundi,
            le 1er du mois…).
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajouter une règle
          </Button>
        )}
      </div>

      {regles.length === 0 ? (
        <div className="bg-muted/40 text-muted-foreground rounded-lg border p-4 text-sm">
          Aucune règle configurée. Ajoutez une règle pour que les interventions
          soient générées automatiquement.
        </div>
      ) : (
        <div className="space-y-3">
          {regles.map((regle) => (
            <RegleCard
              key={regle.id}
              regle={regle}
              canManage={canManage}
              isDeleting={deletingId === regle.id}
              onEdit={() => {
                setEditingRegle(regle);
                setEditDialogOpen(true);
              }}
              onDelete={() => handleDeleteRegle(regle.id)}
              onChecklist={() => {
                setChecklistRegle(regle);
                setChecklistRegleOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <RegleRecurrenceFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        prestation={prestation}
        onSuccess={(newRegle) =>
          updateRegles([
            ...regles,
            { ...newRegle, tacheListeTemplateName: null, tacheListeItems: [] },
          ])
        }
      />
      <RegleRecurrenceFormDialog
        open={editDialogOpen}
        onOpenChange={(v) => {
          setEditDialogOpen(v);
          if (!v) setEditingRegle(null);
        }}
        prestation={prestation}
        regle={editingRegle ?? undefined}
        onSuccess={(updated) =>
          updateRegles(
            regles.map((r) =>
              r.id === updated.id
                ? {
                    ...updated,
                    tacheListeTemplateName: r.tacheListeTemplateName,
                    tacheListeItems: r.tacheListeItems,
                  }
                : r,
            ),
          )
        }
      />
      {checklistRegle && (
        <RegleTacheListePickerDialog
          open={checklistRegleOpen}
          onOpenChange={(v) => {
            setChecklistRegleOpen(v);
            if (!v) setChecklistRegle(null);
          }}
          regleId={checklistRegle.id}
          prestationId={prestation.id}
          serviceId={prestation.serviceId}
          serviceNom={prestation.serviceNom}
          entrepriseId={prestation.entrepriseId}
          currentPackId={checklistRegle.tacheListeTemplateId}
          onSuccess={(pack) => {
            updateRegles(
              regles.map((r) =>
                r.id === checklistRegle.id
                  ? {
                      ...r,
                      tacheListeTemplateId: pack?.id ?? null,
                      tacheListeTemplateName: pack?.nom ?? null,
                      tacheListeItems:
                        pack?.items.map((i) => ({
                          id: i.id,
                          ordre: i.ordre,
                          titre: i.titre,
                          dureeEstimeeMinutes: i.dureeEstimeeMinutes,
                        })) ?? [],
                    }
                  : r,
              ),
            );
          }}
        />
      )}
    </div>
  );
}

function RegleCard({
  regle,
  canManage,
  isDeleting,
  onEdit,
  onDelete,
  onChecklist,
}: {
  regle: RegleRecurrenceAvecTemplateType;
  canManage: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChecklist: () => void;
}) {
  const [checklistExpanded, setChecklistExpanded] = useState(false);

  const rule = regle.regleRrule;
  const parts = Object.fromEntries(
    rule.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k!, v ?? ""];
    }),
  );

  const FREQ_LABELS: Record<string, string> = {
    DAILY: "Quotidien",
    WEEKLY: "Hebdomadaire",
    MONTHLY: "Mensuel",
  };
  const DAY_LABELS: Record<string, string> = {
    MO: "Lun",
    TU: "Mar",
    WE: "Mer",
    TH: "Jeu",
    FR: "Ven",
    SA: "Sam",
    SU: "Dim",
  };

  const freq = FREQ_LABELS[parts["FREQ"] ?? ""] ?? parts["FREQ"] ?? "";
  const interval = parts["INTERVAL"] ? `× ${parts["INTERVAL"]}` : "";
  const byDay = parts["BYDAY"]
    ? parts["BYDAY"]
        .split(",")
        .map((d) => DAY_LABELS[d] ?? d)
        .join(", ")
    : null;
  const byMonthDay = parts["BYMONTHDAY"] ? `le ${parts["BYMONTHDAY"]}` : null;

  const dtstartJs = regle.dtstartLocal as Date;
  const pad = (n: number) => String(n).padStart(2, "0");
  const heureStr = `${pad(dtstartJs.getHours())}:${pad(dtstartJs.getMinutes())}`;

  return (
    <Card className={!regle.actif ? "opacity-60" : undefined}>
      <CardContent className="flex items-start justify-between gap-4 pt-4 pb-4">
        <div className="min-w-0 flex-1 space-y-2 text-sm">
          {regle.libelle && <p className="font-medium">{regle.libelle}</p>}
          <p className="text-muted-foreground">
            {freq}
            {interval && ` ${interval}`}
            {byDay && ` — ${byDay}`}
            {byMonthDay && ` — ${byMonthDay}`}
            {" · "}à {heureStr} ({regle.fuseauHoraire})
          </p>
          {regle.dureePrevueMinutes != null && (
            <p className="text-muted-foreground text-xs">
              <Clock className="mr-1 inline h-3 w-3" />
              {regle.dureePrevueMinutes} min
            </p>
          )}
          {/* Checklist accordion */}
          {regle.tacheListeTemplateId && (
            <div className="pt-1">
              <p className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                <ListChecks className="text-primary h-3.5 w-3.5 flex-shrink-0" />
                Checklist
              </p>
              {regle.tacheListeTemplateName ? (
                <div className="overflow-hidden rounded-lg border">
                  <div className="flex items-center gap-2 p-2.5">
                    {regle.tacheListeItems.length > 0 ? (
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        onClick={() => setChecklistExpanded((v) => !v)}
                        aria-label={
                          checklistExpanded ? "Réduire" : "Développer"
                        }
                      >
                        {checklistExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ) : (
                      <span className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate text-xs font-medium">
                        {regle.tacheListeTemplateName}
                      </span>
                      <Badge
                        variant="outline"
                        className="flex-shrink-0 text-xs"
                      >
                        {regle.tacheListeItems.length} tâche
                        {regle.tacheListeItems.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                  {checklistExpanded && regle.tacheListeItems.length > 0 && (
                    <div className="bg-muted/30 divide-y border-t">
                      {regle.tacheListeItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 px-2.5 py-1.5 text-xs"
                        >
                          <span className="text-muted-foreground w-4 flex-shrink-0 text-center">
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
                <span className="text-muted-foreground text-xs italic">
                  Checklist spécifique
                </span>
              )}
            </div>
          )}
          {!regle.actif && (
            <span className="text-muted-foreground text-xs italic">
              (inactive)
            </span>
          )}
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onChecklist}
              title="Checklist de la règle"
            >
              <ClipboardList className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== TAB: EXÉCUTION & TARIFS ====================

function ExecutionTab({
  executions,
  canManage,
  canAdmin,
  isPlateforme,
  canChangeModePilotage,
  clientHasActiveAdmin,
  prestation,
  onExecutionsChange,
}: {
  executions: ExecutionWithPrix[];
  canManage: boolean;
  canAdmin: boolean;
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
                  <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                    Sélection automatique de l&apos;exécution
                  </p>
                  <p>
                    Chaque intervention est automatiquement associée à
                    l&apos;exécution <strong>active</strong> dont la{" "}
                    <strong>priorité est la plus haute</strong> et dont la
                    fenêtre de validité (<em>date de début → date de fin</em>)
                    couvre la date de l&apos;intervention. En cas d&apos;égalité
                    de priorité, l&apos;exécution dont la{" "}
                    <strong>date de début est la plus récente</strong>{" "}
                    l&apos;emporte.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                    Modifier une exécution (tarifs, dates, priorité)
                  </p>
                  <p>
                    Les anciens tarifs sont <strong>archivés</strong>{" "}
                    (conservés, marqués inactifs). Les interventions à venir non
                    encore démarrées sont{" "}
                    <strong>supprimées et régénérées</strong> avec les nouveaux
                    paramètres. Les interventions passées et leurs données
                    financières clôturées sont <strong>conservées</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
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
                  <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
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
                  <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
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
            canAdmin={canAdmin}
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
          prestationDateDebut={
            prestation.dateDebut
              ? prestation.dateDebut.toISOString().slice(0, 10)
              : null
          }
          prestationDateFin={
            prestation.dateFin
              ? prestation.dateFin.toISOString().slice(0, 10)
              : null
          }
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
  canAdmin,
  isPlateforme,
  canChangeModePilotage,
  clientHasActiveAdmin,
  prestation,
  onExecutionsChange,
}: {
  execution: ExecutionWithPrix;
  canManage: boolean;
  canAdmin: boolean;
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
              )}
              {canAdmin && (
                <>
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
                    Gérer les checklists
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
              canManage={canManage}
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
          serviceId={prestation.serviceId}
          modeCommercial={prestation.modeCommercial}
          isPlateforme={isPlateforme}
          canChangeModePilotage={canChangeModePilotage}
          clientHasActiveAdmin={clientHasActiveAdmin}
          clientNom={prestation.entrepriseNom}
          serviceNom={prestation.serviceNom}
          prestationDateDebut={
            prestation.dateDebut
              ? prestation.dateDebut.toISOString().slice(0, 10)
              : null
          }
          prestationDateFin={
            prestation.dateFin
              ? prestation.dateFin.toISOString().slice(0, 10)
              : null
          }
          onSuccess={(updated) => {
            onExecutionsChange(updated);
            setEditOpen(false);
          }}
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-md gap-0 overflow-hidden p-0">
          <div className="bg-primary/8 border-b px-5 pt-5 pr-12 pb-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette exécution ?</AlertDialogTitle>
            </AlertDialogHeader>
          </div>
          <div className="space-y-2 px-5 py-4 text-sm">
            <p>
              L&apos;exécution{" "}
              <strong>{execution.prestataireNom ?? "inconnu"}</strong>, ses
              tarifs et{" "}
              <strong>toutes les données financières clôturées</strong>{" "}
              associées seront supprimés définitivement.
            </p>
            <p>
              Les interventions existantes perdront leur référence prestataire.
              Cette action est <strong>irréversible</strong> — à n&apos;utiliser
              que si aucune intervention réalisée n&apos;est associée à cette
              exécution.
            </p>
          </div>
          <AlertDialogFooter className="bg-muted/30 border-t px-5 py-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Retirer"}
            </Button>
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
  siteId: string;
};

const DEFAULT_FILTERS: OccurrenceFiltersStateType = {
  statut: "",
  siteId: "",
};

const PAGE_SIZE = 50;

function InterventionsTab({
  initialOccurrences,
  totalOccurrences,
  prestation,
  availableSites,
  canManage,
  quotaInfo,
  hasActiveExecution,
}: {
  initialOccurrences: OccurrenceListItem[];
  totalOccurrences: number;
  prestation: PrestationListItem;
  availableSites: Array<{ id: string; nom: string }>;
  canManage: boolean;
  quotaInfo: QuotaInfoType | null;
  hasActiveExecution: boolean;
}) {
  const [occurrences, setOccurrences] =
    useState<OccurrenceListItem[]>(initialOccurrences);
  const [displayedTotal, setDisplayedTotal] = useState(totalOccurrences);
  // Suivi local du quota utilisé (mis à jour après chaque ajout pour éviter un refresh)
  const [quotaUsed, setQuotaUsed] = useState(quotaInfo?.usedInPeriod ?? 0);
  const isQuotaMode = prestation.famillePlanification === "quota_manuel";
  const isQuotaFull =
    isQuotaMode &&
    quotaInfo !== null &&
    quotaUsed >= quotaInfo.nbOccurrencesParPeriode;
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
    prestation.statut === "actif" &&
    prestation.famillePlanification === "recurrence_auto";

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
      siteId: newFilters.siteId || undefined,
      sortDir: newSortDir,
    });
    if (result?.data) {
      setOccurrences(result.data.occurrences);
      setHasMore(result.data.occurrences.length === PAGE_SIZE);
      if (result.data.filteredTotal !== undefined) {
        setDisplayedTotal(result.data.filteredTotal);
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

  const interventionsInfoBlock = (
    <Collapsible defaultOpen>
      <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
        <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
        <div className="text-muted-foreground w-full space-y-2 text-xs">
          <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between">
            <p className="text-foreground font-medium">
              Comment fonctionnent les interventions ?
            </p>
            <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                  Qu&apos;est-ce qu&apos;une intervention ?
                </p>
                <p>
                  Une intervention est une <strong>occurrence planifiée</strong>{" "}
                  du service sur une date donnée. Elle est assignée à un
                  prestataire et peut contenir des <strong>tâches</strong>{" "}
                  issues d&apos;une checklist (nettoyage, vérifications,
                  relevés…).
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                  Cycle de vie
                </p>
                <p>
                  <strong>Planifiée</strong> → <strong>En cours</strong>{" "}
                  (démarrée par l&apos;intervenant) → <strong>Terminée</strong>{" "}
                  (tâches complétées) ou <strong>Non honorée</strong>{" "}
                  (intervention non réalisée) ou <strong>Annulée</strong>. Les
                  interventions terminées alimentent l&apos;historique et les
                  analytics.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {interventionsInfoBlock}

      {/* Disclaimer récurrence auto */}
      {!isQuotaMode && prestation.statut === "actif" && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Cette liste affiche uniquement les interventions réellement créées.
            Le{" "}
            <Link
              href="/app/calendrier"
              className="font-medium underline underline-offset-2"
            >
              calendrier
            </Link>{" "}
            peut afficher aussi des occurrences prévisionnelles issues de la
            planification.
          </p>
        </div>
      )}

      {/* Bandeau quota (quota_manuel actif uniquement) */}
      {isQuotaMode && prestation.statut === "actif" && (
        <div
          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
            !hasActiveExecution
              ? "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200"
              : !quotaInfo
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                : isQuotaFull
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                  : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          }`}
        >
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            {!hasActiveExecution &&
              "Aucune exécution valide — les interventions ne peuvent pas être créées. Ajoutez un prestataire dans l'onglet « Exécution »."}
            {hasActiveExecution &&
              !quotaInfo &&
              "Quota non configuré — configurez-le dans l'onglet « Planification » pour suivre et limiter vos interventions."}
            {hasActiveExecution &&
              quotaInfo &&
              isQuotaFull &&
              `Toutes les interventions sont planifiées pour la période en cours (${quotaUsed}/${quotaInfo.nbOccurrencesParPeriode}).`}
            {hasActiveExecution &&
              quotaInfo &&
              !isQuotaFull &&
              `${quotaUsed}/${quotaInfo.nbOccurrencesParPeriode} intervention${quotaInfo.nbOccurrencesParPeriode > 1 ? "s" : ""} planifiée${quotaInfo.nbOccurrencesParPeriode > 1 ? "s" : ""} sur la période en cours — il en reste ${quotaInfo.nbOccurrencesParPeriode - quotaUsed} à planifier.`}
          </p>
        </div>
      )}

      {/* En-tête : compteur + contrôles */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {isFiltering ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Chargement...
            </span>
          ) : (
            <>
              {displayedTotal} intervention{displayedTotal > 1 ? "s" : ""}
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
              disabled={isQuotaFull || !hasActiveExecution}
            >
              <Plus className="h-3 w-3" />
              Ajouter une intervention
              {prestation.famillePlanification === "recurrence_auto" && (
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
                  ? prestation.famillePlanification === "quota_manuel"
                    ? "Aucune intervention planifiée. Utilisez « Ajouter une intervention » pour en créer."
                    : "Aucune intervention prévue pour l'instant. Vérifiez les dates du contrat et le périmètre de sites."
                  : "La prestation doit être active pour afficher et créer des interventions."}
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
          if (isQuotaMode) setQuotaUsed((prev) => prev + 1);
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
