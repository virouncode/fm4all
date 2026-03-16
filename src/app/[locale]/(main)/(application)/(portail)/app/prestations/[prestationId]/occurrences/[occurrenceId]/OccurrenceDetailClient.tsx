"use client";

import { RhfDateTimePicker } from "@/components/rhf/RhfDateTimePicker";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link, useRouter } from "@/i18n/navigation";
import { getPresignedReadUrl, uploadFileToS3 } from "@/lib/s3/upload-helper";
import {
  addTachePieceJointeAction,
  deleteTachePieceJointeAction,
  getAssignableUsersForOccurrenceAction,
  getAvailableTicketsForLinkingAction,
  getTicketsByOccurrenceAction,
  deleteAdHocTacheAction,
  insertAdHocTacheAction,
  linkTicketToOccurrenceAction,
  unlinkTicketFromOccurrenceAction,
  updateAdHocTacheAction,
  updateOccurrenceAssigneeAction,
  updateOccurrenceDatesAction,
  updateOccurrenceStatutAction,
  updateOccurrenceTacheStatutAction,
  updateTacheAssigneeAction,
  updateTacheTempsPasseAction,
} from "@/server/actions/clientServiceOccurrencesActions";
import type {
  OccurrenceDetail,
  OccurrenceTacheDetail,
  TachePieceJointe,
} from "@/server/queries/clientServiceExecutions.query";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import type { OccurrenceTransitionStatutType } from "@/zod-schemas/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,

  Clock,

  ImageIcon,
  Info,
  Link2,
  Link2Off,
  ListTodo,
  Loader2,
  MapPin,
  Paperclip,
  Pencil,
  Play,
  Trash2,
  Plus,
  Ticket,
  Timer,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { formatDate, formatDateTime } from "../../../helpers";

type OccurrenceDetailClientProps = {
  occurrence: OccurrenceDetail;
  prestation: PrestationListItem;
  taches: OccurrenceTacheDetail[];
  canManage: boolean; // contrôle total : annuler, non honorée, modifier dates, supprimer tâches ad-hoc
  canExecute: boolean; // travail terrain : démarrer, terminer, tâches, auto-assign
  canAssignOccurrence: boolean; // assigner/modifier l'intervenant prestataire de l'occurrence
  suiviMode: "interne" | "prestataire";
  currentUserId: string;
  currentUserPrenom: string | null;
  currentUserNom: string | null;
}

type LinkedTicketType = {
  id: string;
  titre: string;
  statut: string;
  priorite: string;
  type: string;
  createdAt: Date;
}

type AssignableUserType = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
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
  canExecute,
  canAssignOccurrence,
  suiviMode,
  currentUserId,
  currentUserPrenom,
  currentUserNom,
}: OccurrenceDetailClientProps) {
  const router = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isUpdatingStatut, setIsUpdatingStatut] = useState(false);
  const [taches, setTaches] = useState<OccurrenceTacheDetail[]>(initialTaches);
  const [occurrenceStatut, setOccurrenceStatut] = useState(occurrence.statut);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [linkedTickets, setLinkedTickets] = useState<LinkedTicketType[]>([]);

  // Occurrence-level assignee (mutable)
  const [occurrenceAssigneeUserId, setOccurrenceAssigneeUserId] = useState<string | null>(
    occurrence.assigneeUserId,
  );
  const [occurrenceAssigneePrenom, setOccurrenceAssigneePrenom] = useState<string | null>(
    occurrence.assigneePrenom,
  );
  const [occurrenceAssigneeNom, setOccurrenceAssigneeNom] = useState<string | null>(
    occurrence.assigneeNom,
  );
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUserType[]>([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [applyToTaches, setApplyToTaches] = useState(false);

  // Charger les tickets liés à l'occurrence
  useEffect(() => {
    async function loadLinkedTickets() {
      const result = await getTicketsByOccurrenceAction({
        occurrenceId: occurrence.id,
        entrepriseId: prestation.entrepriseId,
      });
      if (result?.data?.tickets) {
        setLinkedTickets(result.data.tickets as LinkedTicketType[]);
      }
    }
    void loadLinkedTickets();
  }, [occurrence.id, prestation.entrepriseId]);
  const [isAddingAdHoc, setIsAddingAdHoc] = useState(false);

  // Dates prévues mutables en local (mises à jour après sauvegarde sans router.refresh)
  const [dateDebutPrevue, setDateDebutPrevue] = useState<Date | null>(
    occurrence.dateDebutPrevue,
  );
  const [dateFinPrevue, setDateFinPrevue] = useState<Date | null>(
    occurrence.dateFinPrevue,
  );

  useEffect(() => {
    setOccurrenceStatut(occurrence.statut);
  }, [occurrence.statut]);

  const occurrenceBadge = OCCURRENCE_STATUT[occurrenceStatut];

  const handleTransition = async (statut: OccurrenceTransitionStatutType) => {
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
      setOccurrenceStatut(statut);
      toast.success(result.data.message);
      router.refresh();
    }
  };

  // Utilisé par TacheRow en cascade : démarre l'occurrence silencieusement avant de démarrer une tâche
  const startOccurrenceForCascade = async (): Promise<boolean> => {
    const result = await updateOccurrenceStatutAction({
      occurrenceId: occurrence.id,
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      statut: "en_cours",
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return false;
    }
    if (result?.data) {
      setOccurrenceStatut("en_cours");
      toast.success("Intervention démarrée automatiquement");
      return true;
    }
    return false;
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

  const handlePjAdded = (tacheId: string, pj: TachePieceJointe) => {
    setTaches((prev) =>
      prev.map((t) =>
        t.id === tacheId
          ? { ...t, piecesJointes: [...t.piecesJointes, pj] }
          : t,
      ),
    );
  };

  const handlePjDeleted = (tacheId: string, linkId: string) => {
    setTaches((prev) =>
      prev.map((t) =>
        t.id === tacheId
          ? {
              ...t,
              piecesJointes: t.piecesJointes.filter((pj) => pj.linkId !== linkId),
            }
          : t,
      ),
    );
  };

  const handleAdHocAdded = (newTache: OccurrenceTacheDetail) => {
    setTaches((prev) => [...prev, newTache]);
    setIsAddingAdHoc(false);
  };

  const handleAdHocUpdated = (updatedTache: OccurrenceTacheDetail) => {
    setTaches((prev) =>
      prev.map((t) => (t.id === updatedTache.id ? { ...t, ...updatedTache } : t)),
    );
  };

  const handleAdHocDeleted = (tacheId: string) => {
    setTaches((prev) => prev.filter((t) => t.id !== tacheId));
  };

  const handleAssigneeChanged = (tacheId: string, assigneeUserId: string | null, assigneePrenom: string | null, assigneeNom: string | null) => {
    setTaches((prev) =>
      prev.map((t) =>
        t.id === tacheId ? { ...t, assigneeUserId, assigneePrenom, assigneeNom } : t,
      ),
    );
  };

  // Load assignable users when the occurrence assignee popover opens
  useEffect(() => {
    if (!assigneePopoverOpen || !occurrence.prestataireEntrepriseId) return;
    setLoadingAssignees(true);
    getAssignableUsersForOccurrenceAction({
      entrepriseId: occurrence.prestataireEntrepriseId,
    })
      .then((result) => {
        if (result?.data?.users) setAssignableUsers(result.data.users);
      })
      .finally(() => setLoadingAssignees(false));
  }, [assigneePopoverOpen, occurrence.prestataireEntrepriseId]);

  const handleOccurrenceAssign = async (userId: string | null) => {
    setIsAssigning(true);
    const result = await updateOccurrenceAssigneeAction({
      occurrenceId: occurrence.id,
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      assigneeUserId: userId,
      applyToTaches,
    });
    setIsAssigning(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    if (result?.data !== undefined) {
      const user = assignableUsers.find((u) => u.id === userId);
      setOccurrenceAssigneeUserId(userId);
      setOccurrenceAssigneePrenom(user?.prenom ?? null);
      setOccurrenceAssigneeNom(user?.nom ?? null);
      setApplyToTaches(false);
      setAssigneePopoverOpen(false);
      toast.success(userId ? "Intervenant assigné." : "Assignation retirée.");
    }
  };

  const handleAssignAllTaches = async () => {
    if (!occurrenceAssigneeUserId) return;
    const activeTachesCount = taches.filter(
      (t) => t.statut === "a_faire" || t.statut === "en_cours",
    ).length;
    if (activeTachesCount === 0) {
      toast.info("Aucune tâche active à assigner.");
      return;
    }
    setIsAssigning(true);
    const result = await updateOccurrenceAssigneeAction({
      occurrenceId: occurrence.id,
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      assigneeUserId: occurrenceAssigneeUserId,
      applyToTaches: true,
    });
    setIsAssigning(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    if (result?.data !== undefined) {
      setTaches((prev) =>
        prev.map((t) =>
          t.statut === "a_faire" || t.statut === "en_cours"
            ? {
                ...t,
                assigneeUserId: occurrenceAssigneeUserId,
                assigneePrenom: occurrenceAssigneePrenom,
                assigneeNom: occurrenceAssigneeNom,
              }
            : t,
        ),
      );
      toast.success(
        `${activeTachesCount} tâche${activeTachesCount > 1 ? "s" : ""} assignée${activeTachesCount > 1 ? "s" : ""}.`,
      );
    }
  };

  const handleTicketLinked = (ticket: LinkedTicketType) => {
    setLinkedTickets((prev) => [...prev, ticket]);
  };

  const handleTicketUnlinked = (ticketId: string) => {
    setLinkedTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const canEditDates =
    canManage &&
    (occurrenceStatut === "planifiee" || occurrenceStatut === "en_cours");

  const canAddAdHoc =
    canManage &&
    (occurrenceStatut === "planifiee" || occurrenceStatut === "en_cours");

  // Une occurrence peut être clôturée si aucune tâche n'est encore ouverte (a_faire ou en_cours)
  const allTasksDone =
    taches.length === 0 ||
    taches.every((t) => t.statut !== "a_faire" && t.statut !== "en_cours");

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

              {/* Intervenant de l'occurrence */}
              {occurrence.prestataireEntrepriseId && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {occurrenceAssigneePrenom
                    ? `${occurrenceAssigneePrenom} ${occurrenceAssigneeNom}`
                    : "Non assigné"}
                  {canAssignOccurrence && (
                    <Popover
                      open={assigneePopoverOpen}
                      onOpenChange={setAssigneePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          title="Modifier l'intervenant"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-72 space-y-3 p-4"
                        align="start"
                      >
                        <p className="text-sm font-medium">
                          Modifier l&apos;intervenant
                        </p>
                        <Select
                          value={occurrenceAssigneeUserId ?? ""}
                          onValueChange={(v) =>
                            handleOccurrenceAssign(v || null)
                          }
                          disabled={loadingAssignees || isAssigning}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                loadingAssignees
                                  ? "Chargement..."
                                  : "Sélectionnez"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">
                              <span className="text-muted-foreground italic">
                                Retirer l&apos;assignation
                              </span>
                            </SelectItem>
                            {assignableUsers.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.prenom} {u.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <label className="flex cursor-pointer items-center gap-2">
                          <Checkbox
                            checked={applyToTaches}
                            onCheckedChange={(v) => setApplyToTaches(!!v)}
                          />
                          <span className="text-xs">
                            Appliquer aussi aux tâches non terminées
                          </span>
                        </label>
                      </PopoverContent>
                    </Popover>
                  )}
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
                query: { tab: "interventions" },
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        {/* Statut badge + actions */}
        <div className="flex flex-wrap items-center gap-2">
          {!occurrence.executionId && (
            <Badge className="bg-orange-100 text-xs text-orange-700">
              À attribuer
            </Badge>
          )}

          <Badge className={occurrenceBadge.className}>
            {occurrenceBadge.label}
          </Badge>

          {canExecute && occurrenceStatut === "en_cours" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTransition("terminee")}
              disabled={isUpdatingStatut || !allTasksDone}
              title={
                !allTasksDone
                  ? "Toutes les tâches doivent être dans un état final (terminées, N/A, annulées ou non honorées)"
                  : undefined
              }
            >
              <CheckCircle2 className="h-4 w-4" />
              Terminer
            </Button>
          )}

          {/* Boutons managériaux + Démarrer regroupés à droite */}
          <div className="ml-auto flex items-center gap-2">
            {isUpdatingStatut && (
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            )}

            {canExecute && occurrenceStatut === "planifiee" && (
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
            )}

            {canManage && occurrenceStatut === "planifiee" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
                disabled={isUpdatingStatut}
              >
                Annuler
              </Button>
            )}

            {canManage && occurrenceStatut === "planifiee" && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => handleTransition("non_honoree")}
                disabled={isUpdatingStatut}
              >
                Non honorée
              </Button>
            )}
          </div>
        </div>

        {/* Message d'aide si aucun prestataire assigné */}
        {!occurrence.executionId && (
          <p className="text-muted-foreground text-sm">
            Aucun prestataire n&apos;est encore assigné à cette intervention.{" "}
            <Link
              href={{
                pathname: "/app/prestations/[prestationId]",
                params: { prestationId: prestation.id },
                query: { tab: "execution" },
              }}
              className="text-primary font-medium underline underline-offset-2"
            >
              Ajoutez une exécution dans la prestation
            </Link>{" "}
            pour l&apos;attribuer.
          </p>
        )}
      </div>

      <Separator className="my-5 flex-shrink-0" />

      {/* ==================== BANNIÈRE MODE DE SUIVI ==================== */}
      {occurrence.executionId && (
        <div
          className={`flex-shrink-0 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm mb-4 ${
            suiviMode === "prestataire"
              ? "border-blue-200 bg-blue-50 text-blue-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            {suiviMode === "prestataire" ? (
              <>
                <span className="font-semibold">Suivi prestataire</span>
                {" — "}
                Des agents du prestataire suivent cette intervention depuis la plateforme.
              </>
            ) : (
              <>
                <span className="font-semibold">Suivi interne</span>
                {" — "}
                Le prestataire n&apos;est pas sur la plateforme pour ce site. L&apos;avancement est géré en interne.
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== CONTENT ==================== */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-6">
        {/* Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Calendar className="text-primary h-4 w-4" />
              Dates
              {canEditDates && !isEditingDates && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => setIsEditingDates(true)}
                >
                  <Pencil className="h-3 w-3" />
                  Modifier
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isEditingDates ? (
              <DateEditForm
                occurrenceId={occurrence.id}
                prestationId={prestation.id}
                entrepriseId={prestation.entrepriseId}
                initialDateDebut={dateDebutPrevue}
                initialDateFin={dateFinPrevue}
                onSaved={(debut, fin) => {
                  setDateDebutPrevue(debut);
                  setDateFinPrevue(fin);
                  setIsEditingDates(false);
                }}
                onCancel={() => setIsEditingDates(false)}
              />
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Début prévu</span>
                  <span className="font-medium">
                    {dateDebutPrevue ? formatDateTime(dateDebutPrevue) : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fin prévue</span>
                  <span className="font-medium">
                    {dateFinPrevue ? formatDateTime(dateFinPrevue) : "—"}
                  </span>
                </div>
              </>
            )}
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <ListTodo className="text-primary h-4 w-4" />
              Tâches
              {taches.length > 0 && (
                <span className="text-muted-foreground text-xs font-normal">
                  (
                  {
                    taches.filter(
                      (t) =>
                        t.statut === "terminee" ||
                        t.statut === "non_applicable" ||
                        t.statut === "annulee" ||
                        t.statut === "non_honoree",
                    ).length
                  }
                  /{taches.length} traitées)
                </span>
              )}
              {canAssignOccurrence && occurrenceAssigneeUserId && taches.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto h-7 gap-1.5 px-2 text-xs"
                  onClick={handleAssignAllTaches}
                  disabled={isAssigning}
                >
                  <Users className="h-3.5 w-3.5" />
                  Assigner toutes
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {taches.length === 0 && !isAddingAdHoc && (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Aucune tâche associée à cette intervention.
              </p>
            )}
            {taches.map((tache) => (
              <TacheRow
                key={tache.id}
                tache={tache}
                canExecute={canExecute}
                canManage={canManage}
                canAssignOccurrence={canAssignOccurrence}
                currentUserId={currentUserId}
                currentUserPrenom={currentUserPrenom}
                currentUserNom={currentUserNom}
                occurrenceStatut={occurrenceStatut}
                executionId={occurrence.executionId}
                prestationId={prestation.id}
                entrepriseId={prestation.entrepriseId}
                prestataireEntrepriseId={occurrence.prestataireEntrepriseId}
                occurrenceId={occurrence.id}
                onStartOccurrence={startOccurrenceForCascade}
                onTransition={(statut) =>
                  handleTacheTransition(tache.id, statut)
                }
                onPjAdded={(pj) => handlePjAdded(tache.id, pj)}
                onPjDeleted={(linkId) => handlePjDeleted(tache.id, linkId)}
                onAdHocUpdated={handleAdHocUpdated}
                onAdHocDeleted={handleAdHocDeleted}
                onAssigneeChanged={(userId, prenom, nom) =>
                  handleAssigneeChanged(tache.id, userId, prenom, nom)
                }
              />
            ))}

            {/* Zone ajout tâche ad-hoc */}
            {canAddAdHoc && (
              <div className="border-t pt-2">
                {isAddingAdHoc ? (
                  <AdHocTacheForm
                    occurrenceId={occurrence.id}
                    prestationId={prestation.id}
                    entrepriseId={prestation.entrepriseId}
                    onAdded={handleAdHocAdded}
                    onCancel={() => setIsAddingAdHoc(false)}
                  />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-muted-foreground h-7 gap-1.5 px-2 text-xs"
                    onClick={() => setIsAddingAdHoc(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une tâche
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Tickets liés */}
        <LinkedTicketsCard
          occurrenceId={occurrence.id}
          entrepriseId={prestation.entrepriseId}
          linkedTickets={linkedTickets}
          onLinked={handleTicketLinked}
          onUnlinked={handleTicketUnlinked}
        />
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

function formatTemps(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function TacheRow({
  tache,
  canExecute,
  canManage,
  canAssignOccurrence,
  currentUserId,
  currentUserPrenom,
  currentUserNom,
  occurrenceStatut,
  executionId,
  prestationId,
  entrepriseId,
  prestataireEntrepriseId,
  occurrenceId,
  onStartOccurrence,
  onTransition,
  onPjAdded,
  onPjDeleted,
  onAdHocUpdated,
  onAdHocDeleted,
  onAssigneeChanged,
}: {
  tache: OccurrenceTacheDetail;
  canExecute: boolean;
  canManage: boolean;
  canAssignOccurrence: boolean;
  currentUserId: string;
  currentUserPrenom: string | null;
  currentUserNom: string | null;
  occurrenceStatut: OccurrenceDetail["statut"];
  executionId: string | null;
  prestationId: string;
  entrepriseId: string;
  prestataireEntrepriseId: string | null;
  occurrenceId: string;
  onStartOccurrence: () => Promise<boolean>;
  onTransition: (
    statut:
      | "en_cours"
      | "terminee"
      | "non_honoree"
      | "non_applicable"
      | "annulee",
  ) => Promise<void>;
  onPjAdded: (pj: TachePieceJointe) => void;
  onPjDeleted: (linkId: string) => void;
  onAdHocUpdated: (tache: OccurrenceTacheDetail) => void;
  onAdHocDeleted: (tacheId: string) => void;
  onAssigneeChanged: (userId: string | null, prenom: string | null, nom: string | null) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingAdHoc, setIsEditingAdHoc] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUserType[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [localTempsPasseSecondes, setLocalTempsPasseSecondes] = useState<number | null>(tache.tempsPasseSecondes ?? null);
  const [isEditingTempsPasse, setIsEditingTempsPasse] = useState(false);
  const [tempsPasseInputMinutes, setTempsPasseInputMinutes] = useState("");
  const badge = TACHE_STATUT[tache.statut];
  const isAdHoc = tache.listeItemId === null;

  const handleOpenAssigneePopover = async (open: boolean) => {
    setAssigneePopoverOpen(open);
    if (open && assignableUsers.length === 0 && prestataireEntrepriseId) {
      const result = await getAssignableUsersForOccurrenceAction({
        entrepriseId: prestataireEntrepriseId,
      });
      if (result?.data?.users) {
        setAssignableUsers(result.data.users as AssignableUserType[]);
      }
    }
  };

  const handleAssignUser = async (userId: string | null) => {
    setIsAssigning(true);
    const result = await updateTacheAssigneeAction({
      tacheId: tache.id,
      occurrenceId,
      entrepriseId,
      assigneeUserId: userId,
    });
    setIsAssigning(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    // Lookup du nom : self-assign utilise currentUser, sinon la liste chargée
    let prenom: string | null = null;
    let nom: string | null = null;
    if (userId === currentUserId) {
      prenom = currentUserPrenom;
      nom = currentUserNom;
    } else if (userId !== null) {
      const user = assignableUsers.find((u) => u.id === userId);
      prenom = user?.prenom ?? null;
      nom = user?.nom ?? null;
    }
    onAssigneeChanged(userId, prenom, nom);
    setAssigneePopoverOpen(false);
  };

  const handleTransition = async (
    statut:
      | "en_cours"
      | "terminee"
      | "non_honoree"
      | "non_applicable"
      | "annulee",
  ) => {
    setIsUpdating(true);

    // Cascade : toute interaction sur une tâche (démarrer OU marquer N/A) démarre
    // l'occurrence automatiquement si elle est encore planifiée et qu'un prestataire est assigné.
    if (
      (statut === "en_cours" || statut === "non_applicable") &&
      occurrenceStatut === "planifiee"
    ) {
      const started = await onStartOccurrence();
      if (!started) {
        setIsUpdating(false);
        return;
      }
    }

    await onTransition(statut);
    setIsUpdating(false);
  };

  // Boutons visibles quand planifiée ou en cours ; disabled si planifiée SANS prestataire assigné
  const showButtons =
    canExecute &&
    (occurrenceStatut === "en_cours" || occurrenceStatut === "planifiee");
  const buttonsDisabled =
    isUpdating || (occurrenceStatut === "planifiee" && !executionId);
  const disabledTitle =
    occurrenceStatut === "planifiee" && !executionId
      ? "Attribuez un prestataire à l'intervention avant de travailler sur les tâches"
      : undefined;

  const showPjZone =
    canExecute &&
    occurrenceStatut === "en_cours" &&
    tache.statut === "en_cours";

  return (
    <div className={`rounded-lg border p-3 text-sm ${isAdHoc ? "border-dashed" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-5 flex-shrink-0 text-center text-xs">
              {tache.ordre}.
            </span>
            {isAdHoc && (
              <span className="text-muted-foreground rounded bg-slate-100 px-1 py-0.5 text-[10px]">
                ad-hoc
              </span>
            )}
            {isEditingAdHoc ? (
              <AdHocTacheInlineEdit
                tache={tache}
                occurrenceId={occurrenceId}
                prestationId={prestationId}
                entrepriseId={entrepriseId}
                onSaved={(updated) => {
                  onAdHocUpdated({ ...tache, ...updated });
                  setIsEditingAdHoc(false);
                }}
                onCancel={() => setIsEditingAdHoc(false)}
              />
            ) : (
              <>
                <span
                  className={`font-medium ${tache.statut === "terminee" ? "line-through opacity-60" : ""}`}
                >
                  {tache.titre}
                </span>
                {isAdHoc &&
                  canManage &&
                  (tache.statut === "a_faire" || tache.statut === "en_cours") &&
                  (occurrenceStatut === "planifiee" || occurrenceStatut === "en_cours") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingAdHoc(true)}
                      className="ml-1 h-5 w-5 flex-shrink-0 p-0"
                      title="Modifier"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                {isAdHoc &&
                  canManage &&
                  !isEditingAdHoc &&
                  (tache.statut === "a_faire" || tache.statut === "en_cours") &&
                  (occurrenceStatut === "planifiee" || occurrenceStatut === "en_cours") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="ml-1 h-5 w-5 flex-shrink-0 p-0 text-red-500 hover:text-red-600"
                      title="Annuler la tâche"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
              </>
            )}
          </div>
          {!isEditingAdHoc && tache.description && (
            <p className="text-muted-foreground ml-7 text-xs">
              {tache.description}
            </p>
          )}
          {tache.doneAt && (
            <p className="text-muted-foreground ml-7 flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {formatDateTime(tache.doneAt)}
              {localTempsPasseSecondes !== null && localTempsPasseSecondes !== undefined && (
                <span className="ml-1 flex items-center gap-0.5">
                  <Timer className="h-3 w-3" />
                  {formatTemps(localTempsPasseSecondes)}
                  {canManage && !isEditingTempsPasse && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground ml-0.5 rounded p-0.5"
                      title="Corriger le temps passé"
                      onClick={() => {
                        setTempsPasseInputMinutes(String(Math.round(localTempsPasseSecondes / 60)));
                        setIsEditingTempsPasse(true);
                      }}
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </button>
                  )}
                </span>
              )}
            </p>
          )}
          {isEditingTempsPasse && canManage && tache.statut === "terminee" && (
            <div className="ml-7 flex items-center gap-1.5 pt-0.5">
              <input
                type="number"
                min={0}
                max={10080}
                value={tempsPasseInputMinutes}
                onChange={(e) => setTempsPasseInputMinutes(e.target.value)}
                className="border-input focus-visible:ring-ring h-6 w-20 rounded border px-2 text-xs focus-visible:outline-none focus-visible:ring-1"
                placeholder="min"
              />
              <span className="text-muted-foreground text-xs">min</span>
              <Button
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={async () => {
                  const minutes = parseInt(tempsPasseInputMinutes, 10);
                  if (isNaN(minutes) || minutes < 0 || minutes > 10080) {
                    toast.error("Durée invalide (0–10080 min)");
                    return;
                  }
                  const result = await updateTacheTempsPasseAction({
                    tacheId: tache.id,
                    occurrenceId,
                    prestationId,
                    entrepriseId,
                    tempsPasseSecondes: minutes * 60,
                  });
                  if (result?.serverError) {
                    toast.error(result.serverError.message);
                    return;
                  }
                  setLocalTempsPasseSecondes(minutes * 60);
                  setIsEditingTempsPasse(false);
                  toast.success("Temps passé mis à jour");
                }}
              >
                OK
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={() => setIsEditingTempsPasse(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>

          {/* Assignee — visible quand l'occurrence est active */}
          {canExecute && (occurrenceStatut === "planifiee" || occurrenceStatut === "en_cours") && (
            canAssignOccurrence && prestataireEntrepriseId ? (
              // Responsable / plateforme : popover complet — uniquement si un prestataire est assigné
              <Popover open={assigneePopoverOpen} onOpenChange={handleOpenAssigneePopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 gap-1 px-2 text-xs"
                    title={tache.assigneePrenom ? `Assigné à ${tache.assigneePrenom} ${tache.assigneeNom ?? ""}` : "Assigner un intervenant"}
                    aria-label={tache.assigneePrenom ? `Intervenant assigné : ${tache.assigneePrenom} ${tache.assigneeNom ?? ""}` : "Assigner un intervenant à cette tâche"}
                  >
                    {tache.assigneeUserId ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-medium text-blue-700">
                        {(tache.assigneePrenom?.[0] ?? "").toUpperCase()}{(tache.assigneeNom?.[0] ?? "").toUpperCase()}
                      </span>
                    ) : (
                      "Assigner"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
                  {isAssigning && (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  {!isAssigning && assignableUsers.length === 0 && (
                    <p className="text-muted-foreground px-2 py-2 text-xs">Aucun intervenant disponible</p>
                  )}
                  {!isAssigning && assignableUsers.length > 0 && (
                    <div className="space-y-0.5">
                      {tache.assigneeUserId && (
                        <button
                          className="text-muted-foreground hover:bg-muted w-full rounded px-2 py-1.5 text-left text-xs italic"
                          onClick={() => handleAssignUser(null)}
                        >
                          Désassigner
                        </button>
                      )}
                      {assignableUsers.map((u) => (
                        <button
                          key={u.id}
                          className={`hover:bg-muted w-full rounded px-2 py-1.5 text-left text-xs ${u.id === tache.assigneeUserId ? "font-semibold" : ""}`}
                          onClick={() => handleAssignUser(u.id)}
                        >
                          {u.prenom} {u.nom}
                        </button>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            ) : !canAssignOccurrence ? (
              // Intervenant — UI selon état d'assignation
              tache.assigneeUserId === null ? (
                // Tâche non assignée → "Je prends"
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleAssignUser(currentUserId)}
                  disabled={isAssigning}
                  title="M'assigner cette tâche"
                >
                  {isAssigning ? <Loader2 className="h-3 w-3 animate-spin" /> : "Je prends"}
                </Button>
              ) : tache.assigneeUserId === currentUserId ? (
                // Assignée à soi-même → avatar cliquable pour se désassigner
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 rounded-full p-0"
                  onClick={() => handleAssignUser(null)}
                  disabled={isAssigning}
                  title="Me désassigner"
                  aria-label={`Assigné à vous — cliquer pour se désassigner`}
                >
                  {isAssigning ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span className="text-[10px] font-medium text-blue-700">
                      {(tache.assigneePrenom?.[0] ?? "").toUpperCase()}{(tache.assigneeNom?.[0] ?? "").toUpperCase()}
                    </span>
                  )}
                </Button>
              ) : (
                // Assignée à quelqu'un d'autre → lecture seule
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-medium text-blue-700"
                  title={`${tache.assigneePrenom} ${tache.assigneeNom ?? ""}`}
                >
                  {(tache.assigneePrenom?.[0] ?? "").toUpperCase()}{(tache.assigneeNom?.[0] ?? "").toUpperCase()}
                </span>
              )
            ) : null /* canAssignOccurrence sans prestataire assigné : pas d'UI d'assignation */
          )}

          {/* Assignee lecture seule (non-interactif) */}
          {!canExecute && tache.assigneeUserId && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-medium text-blue-700" title={`${tache.assigneePrenom} ${tache.assigneeNom ?? ""}`}>
              {(tache.assigneePrenom?.[0] ?? "").toUpperCase()}{(tache.assigneeNom?.[0] ?? "").toUpperCase()}
            </span>
          )}

          {isUpdating && (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          )}

          {/* Boutons de transition selon statut courant */}
          {showButtons && !isUpdating && (
            <>
              {tache.statut === "a_faire" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleTransition("en_cours")}
                    disabled={buttonsDisabled}
                    title={disabledTitle}
                  >
                    <Play className="h-4 w-4" />
                    Démarrer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleTransition("non_honoree")}
                    disabled={buttonsDisabled}
                    title={disabledTitle}
                  >
                    Non honorée
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleTransition("non_applicable")}
                    disabled={buttonsDisabled}
                    title={disabledTitle}
                  >
                    Non applicable
                  </Button>
                </>
              )}
              {tache.statut === "en_cours" && (
                <>
                  {canExecute && (tache.assigneeUserId === currentUserId || canManage) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleTransition("terminee")}
                      disabled={buttonsDisabled}
                      title={disabledTitle}
                    >
                      Terminer
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleTransition("non_honoree")}
                    disabled={buttonsDisabled}
                    title={disabledTitle}
                  >
                    Non honorée
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleTransition("non_applicable")}
                    disabled={buttonsDisabled}
                    title={disabledTitle}
                  >
                    Non applicable
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Zone pièces jointes — visible uniquement quand la tâche est en cours */}
      {showPjZone && (
        <PjUploadZone
          tache={tache}
          prestationId={prestationId}
          entrepriseId={entrepriseId}
          occurrenceId={occurrenceId}
          onPjAdded={onPjAdded}
          onPjDeleted={onPjDeleted}
        />
      )}

      {/* Affichage des PJs existantes même hors zone upload (tâche terminée, etc.) */}
      {!showPjZone && tache.piecesJointes.length > 0 && (
        <div className="mt-2 ml-7 flex flex-wrap gap-2">
          {tache.piecesJointes.map((pj) => (
            <PjThumb
              key={pj.linkId}
              pj={pj}
              proprietaireEntrepriseId={entrepriseId}
            />
          ))}
        </div>
      )}

      {/* AlertDialog annulation tâche ad-hoc */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette tâche ?</AlertDialogTitle>
            <AlertDialogDescription>
              La tâche sera marquée comme annulée. Elle restera visible dans la liste avec le statut &quot;annulée&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Retour</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                setIsDeleting(true);
                const result = await deleteAdHocTacheAction({
                  tacheId: tache.id,
                  occurrenceId,
                  prestationId,
                  entrepriseId,
                });
                setIsDeleting(false);
                if (result?.serverError) {
                  toast.error(result.serverError.message);
                  return;
                }
                if (result?.data?.tache) {
                  toast.success("Tâche annulée.");
                  setDeleteConfirmOpen(false);
                  onAdHocUpdated({ ...tache, ...result.data.tache });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Annuler la tâche"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== PJ UPLOAD ZONE ====================

function PjUploadZone({
  tache,
  prestationId,
  entrepriseId,
  occurrenceId,
  onPjAdded,
  onPjDeleted,
}: {
  tache: OccurrenceTacheDetail;
  prestationId: string;
  entrepriseId: string;
  occurrenceId: string;
  onPjAdded: (pj: TachePieceJointe) => void;
  onPjDeleted: (linkId: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = tache.piecesJointes.length < 2;

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    if (tache.piecesJointes.length >= 2) {
      toast.error("Maximum 2 photos par tâche.");
      return;
    }

    setIsUploading(true);
    try {
      const { key } = await uploadFileToS3({
        file,
        proprietaireEntrepriseId: entrepriseId,
        categorie: "tache_piece_jointe",
      });

      const result = await addTachePieceJointeAction({
        tacheId: tache.id,
        occurrenceId,
        prestationId,
        entrepriseId,
        storageKey: key,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.pieceJointe) {
        onPjAdded(result.data.pieceJointe);
        toast.success("Photo ajoutée");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
      // Réinitialiser les inputs pour permettre le même fichier à nouveau
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (pj: TachePieceJointe) => {
    setIsDeleting(pj.linkId);
    const result = await deleteTachePieceJointeAction({
      linkId: pj.linkId,
      documentId: pj.documentId,
      tacheId: tache.id,
      occurrenceId,
      prestationId,
      entrepriseId,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else {
      onPjDeleted(pj.linkId);
    }
    setIsDeleting(null);
  };

  return (
    <div className="mt-3 ml-7 space-y-2">
      {/* Thumbnails existants */}
      {tache.piecesJointes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tache.piecesJointes.map((pj) => (
            <div key={pj.linkId} className="relative">
              <PjThumb pj={pj} proprietaireEntrepriseId={entrepriseId} />
              <button
                onClick={() => handleDelete(pj)}
                disabled={isDeleting === pj.linkId || isUploading}
                className="bg-destructive text-destructive-foreground absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full shadow-sm disabled:opacity-50"
                title="Supprimer"
              >
                {isDeleting === pj.linkId ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ) : (
                  <X className="h-2.5 w-2.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Boutons d'ajout */}
      {canAddMore && (
        <div className="flex flex-wrap gap-2">
          {/* Input caché — appareil photo (mobile) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />
          {/* Input caché — sélecteur de fichier */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />

          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            Photo
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Paperclip className="h-3.5 w-3.5" />
            )}
            Fichier
          </Button>

          {tache.piecesJointes.length === 0 && (
            <span className="text-muted-foreground self-center text-xs">
              Optionnel · max 2
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== PJ THUMBNAIL ====================

function PjThumb({
  pj,
  proprietaireEntrepriseId,
}: {
  pj: TachePieceJointe;
  proprietaireEntrepriseId: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getPresignedReadUrl({ key: pj.storageKey, proprietaireEntrepriseId })
      .then(setUrl)
      .catch(() => setUrl(null));
  }, [pj.storageKey, proprietaireEntrepriseId]);

  const isImage = pj.mimeType.startsWith("image/");

  if (isImage && url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={pj.filename}
          className="h-14 w-14 rounded border object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="border-muted-foreground/30 text-muted-foreground flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded border text-center"
    >
      <ImageIcon className="h-5 w-5" />
      <span className="w-full truncate px-1 text-[10px]">{pj.filename}</span>
    </a>
  );
}

// ==================== AD-HOC TACHE FORM (nouveau) ====================

function AdHocTacheForm({
  occurrenceId,
  prestationId,
  entrepriseId,
  onAdded,
  onCancel,
}: {
  occurrenceId: string;
  prestationId: string;
  entrepriseId: string;
  onAdded: (tache: OccurrenceTacheDetail) => void;
  onCancel: () => void;
}) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;
    setIsSubmitting(true);
    const result = await insertAdHocTacheAction({
      occurrenceId,
      prestationId,
      entrepriseId,
      titre: titre.trim(),
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    if (result?.data?.tache) {
      onAdded({
        ...result.data.tache,
        piecesJointes: [],
        assigneePrenom: null,
        assigneeNom: null,
      });
      toast.success("Tâche ajoutée");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-1">
      <input
        autoFocus
        type="text"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Titre de la tâche *"
        maxLength={255}
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optionnel)"
        maxLength={1000}
        rows={2}
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !titre.trim()}
          className="h-7 gap-1.5 px-3 text-xs"
        >
          {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
          Ajouter
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-7 px-3 text-xs"
        >
          <X className="h-3 w-3" />
          Annuler
        </Button>
      </div>
    </form>
  );
}

// ==================== AD-HOC TACHE INLINE EDIT ====================

function AdHocTacheInlineEdit({
  tache,
  occurrenceId,
  prestationId,
  entrepriseId,
  onSaved,
  onCancel,
}: {
  tache: OccurrenceTacheDetail;
  occurrenceId: string;
  prestationId: string;
  entrepriseId: string;
  onSaved: (updated: { titre: string; description: string | null }) => void;
  onCancel: () => void;
}) {
  const [titre, setTitre] = useState(tache.titre);
  const [description, setDescription] = useState(tache.description ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;
    setIsSubmitting(true);
    const result = await updateAdHocTacheAction({
      tacheId: tache.id,
      occurrenceId,
      prestationId,
      entrepriseId,
      titre: titre.trim(),
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    if (result?.data?.tache) {
      onSaved({
        titre: result.data.tache.titre,
        description: result.data.tache.description,
      });
      toast.success("Tâche mise à jour");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-1.5">
      <input
        autoFocus
        type="text"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        maxLength={255}
        className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-2 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-1"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optionnel)"
        maxLength={1000}
        rows={2}
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1"
      />
      <div className="flex gap-1.5">
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !titre.trim()}
          className="h-6 px-2 text-xs"
        >
          {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
          OK
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-6 px-2 text-xs"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </form>
  );
}

// ==================== DATE EDIT FORM ====================

const occurrenceDatesSchema = z.object({
  dateDebutPrevue: z.string().optional(),
  dateFinPrevue: z.string().optional(),
});
type OccurrenceDatesFormType = z.infer<typeof occurrenceDatesSchema>;

function DateEditForm({
  occurrenceId,
  prestationId,
  entrepriseId,
  initialDateDebut,
  initialDateFin,
  onSaved,
  onCancel,
}: {
  occurrenceId: string;
  prestationId: string;
  entrepriseId: string;
  initialDateDebut: Date | null;
  initialDateFin: Date | null;
  onSaved: (debut: Date | null, fin: Date | null) => void;
  onCancel: () => void;
}) {
  const form = useForm<OccurrenceDatesFormType>({
    resolver: zodResolver(occurrenceDatesSchema),
    defaultValues: {
      dateDebutPrevue: initialDateDebut?.toISOString() ?? "",
      dateFinPrevue: initialDateFin?.toISOString() ?? "",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  const onSubmit = async (data: OccurrenceDatesFormType) => {
    const result = await updateOccurrenceDatesAction({
      occurrenceId,
      prestationId,
      entrepriseId,
      dateDebutPrevue: data.dateDebutPrevue || null,
      dateFinPrevue: data.dateFinPrevue || null,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    if (result?.data) {
      onSaved(result.data.dateDebutPrevue, result.data.dateFinPrevue);
      toast.success("Dates mises à jour");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <RhfDateTimePicker<OccurrenceDatesFormType>
          name="dateDebutPrevue"
          label="Début prévu"
          timeFormat="24"
          withError={false}
        />
        <RhfDateTimePicker<OccurrenceDatesFormType>
          name="dateFinPrevue"
          label="Fin prévue"
          timeFormat="24"
          withError={false}
        />
        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-7 gap-1.5 px-3 text-xs"
          >
            {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
            Enregistrer
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-7 gap-1.5 px-3 text-xs"
          >
            <X className="h-3 w-3" />
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ==================== LINKED TICKETS CARD ====================

const TICKET_STATUT_LABELS: Record<string, { label: string; className: string }> = {
  ouvert: { label: "Ouvert", className: "bg-blue-100 text-blue-700" },
  en_attente_prestataire: { label: "En attente prestataire", className: "bg-orange-100 text-orange-700" },
  en_attente_client: { label: "En attente client", className: "bg-yellow-100 text-yellow-700" },
  resolu: { label: "Résolu", className: "bg-green-100 text-green-700" },
  ferme: { label: "Fermé", className: "bg-gray-100 text-gray-500" },
};

function LinkedTicketsCard({
  occurrenceId,
  entrepriseId,
  linkedTickets,
  onLinked,
  onUnlinked,
}: {
  occurrenceId: string;
  entrepriseId: string;
  linkedTickets: LinkedTicketType[];
  onLinked: (ticket: LinkedTicketType) => void;
  onUnlinked: (ticketId: string) => void;
}) {
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [availableTickets, setAvailableTickets] = useState<LinkedTicketType[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);

  const handleOpenLinkPopover = async (open: boolean) => {
    setLinkPopoverOpen(open);
    if (open) {
      setIsLoadingAvailable(true);
      const result = await getAvailableTicketsForLinkingAction({
        occurrenceId,
        entrepriseId,
      });
      if (result?.data?.tickets) {
        setAvailableTickets(result.data.tickets as LinkedTicketType[]);
      }
      setIsLoadingAvailable(false);
    }
  };

  const handleLink = async (ticket: LinkedTicketType) => {
    setIsLinking(ticket.id);
    const result = await linkTicketToOccurrenceAction({
      ticketId: ticket.id,
      occurrenceId,
      entrepriseId,
    });
    setIsLinking(null);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    onLinked(ticket);
    setLinkPopoverOpen(false);
    toast.success("Ticket lié à l'intervention");
  };

  const handleUnlink = async (ticketId: string) => {
    setIsUnlinking(ticketId);
    const result = await unlinkTicketFromOccurrenceAction({
      ticketId,
      occurrenceId,
      entrepriseId,
    });
    setIsUnlinking(null);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    onUnlinked(ticketId);
    toast.success("Ticket délié");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-base font-medium">
          <span className="flex items-center gap-2">
            <Ticket className="text-primary h-4 w-4" />
            Tickets liés
            {linkedTickets.length > 0 && (
              <span className="text-muted-foreground text-xs font-normal">
                ({linkedTickets.length})
              </span>
            )}
          </span>
          <Popover open={linkPopoverOpen} onOpenChange={handleOpenLinkPopover}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-xs">
                <Link2 className="h-3.5 w-3.5" />
                Lier un ticket
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="end">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Tickets disponibles
              </p>
              {isLoadingAvailable && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {!isLoadingAvailable && availableTickets.length === 0 && (
                <p className="text-muted-foreground py-2 text-center text-xs">
                  Aucun ticket disponible à lier
                </p>
              )}
              {!isLoadingAvailable && availableTickets.length > 0 && (
                <div className="max-h-52 space-y-1 overflow-y-auto">
                  {availableTickets.map((t) => {
                    const alreadyLinked = linkedTickets.some((l) => l.id === t.id);
                    if (alreadyLinked) return null;
                    const statutInfo = TICKET_STATUT_LABELS[t.statut];
                    return (
                      <button
                        key={t.id}
                        className="hover:bg-muted w-full rounded px-2 py-1.5 text-left"
                        onClick={() => handleLink(t)}
                        disabled={isLinking === t.id}
                      >
                        <div className="flex items-center gap-2">
                          {isLinking === t.id ? (
                            <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin" />
                          ) : (
                            <Link2 className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium">{t.titre}</span>
                            {statutInfo && (
                              <span className={`mt-0.5 inline-block rounded px-1 py-0.5 text-[10px] ${statutInfo.className}`}>
                                {statutInfo.label}
                              </span>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linkedTickets.length === 0 && (
          <p className="text-muted-foreground py-2 text-center text-sm">
            Aucun ticket lié à cette intervention.
          </p>
        )}
        {linkedTickets.length > 0 && (
          <div className="space-y-2">
            {linkedTickets.map((ticket) => {
              const statutInfo = TICKET_STATUT_LABELS[ticket.statut];
              return (
                <div
                  key={ticket.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                >
                  <Ticket className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{ticket.titre}</span>
                    {statutInfo && (
                      <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] ${statutInfo.className}`}>
                        {statutInfo.label}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 flex-shrink-0 p-0"
                    title="Délier"
                    onClick={() => handleUnlink(ticket.id)}
                    disabled={isUnlinking === ticket.id}
                  >
                    {isUnlinking === ticket.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Link2Off className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
