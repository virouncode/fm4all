"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useRouter } from "@/i18n/navigation";
import {
  type ExecutionWithPrix,
  type OccurrenceListItem,
} from "@/server/queries/clientServiceExecutions.query";
import { type PrestationListItem } from "@/zod-schemas/clientServices.schema";
import {
  ArrowLeft,
  Building,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  RotateCcw,
  Settings,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { PrestationFormDialog } from "../PrestationFormDialog";
import { PrestationStatutDialog } from "../PrestationStatutDialog";
import {
  formatDate,
  formatDuree,
  getFrequenceLabel,
  getModePlanningBadge,
  getPrestationStatutBadge,
} from "../helpers";

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

export function PrestationDetailsClient({
  prestation,
  canManage,
  isPlateforme,
  executions,
  occurrences,
}: PrestationDetailsClientProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statutDialogOpen, setStatutDialogOpen] = useState(false);

  const statutBadge = getPrestationStatutBadge(prestation.statut);
  const modeBadge = getModePlanningBadge(prestation.modePlanning);
  const frequenceLabel = getFrequenceLabel(
    prestation.frequence,
    prestation.frequenceParPeriode,
    prestation.intervalleJours,
  );
  const canChangeStatut = prestation.statut !== "termine";

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    router.refresh();
  };

  const handleStatutSuccess = () => {
    setStatutDialogOpen(false);
    router.refresh();
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-6">
      {/* ==================== HEADER ==================== */}
      <div className="space-y-3">
        {/* Bouton retour */}
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/app/prestations">
            <ArrowLeft className="h-4 w-4" />
            Retour aux prestations
          </Link>
        </Button>

        {/* Titre + badges + actions */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{prestation.serviceNom}</h1>
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

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statutBadge.className}>{statutBadge.label}</Badge>
            <Badge className={modeBadge.className}>{modeBadge.label}</Badge>
            {canManage && canChangeStatut && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatutDialogOpen(true)}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Statut
              </Button>
            )}
            {canManage && (
              <Button size="sm" onClick={() => setEditDialogOpen(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Modifier
              </Button>
            )}
          </div>
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
          <div className="grid gap-4 md:grid-cols-2">
            {/* Fréquence & Planning */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="text-primary h-4 w-4" />
                  Planification
                </CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base">
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
                    prestation.dateFin ? formatDate(prestation.dateFin) : "∞ Sans échéance"
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
                <CardTitle className="text-base">Notes</CardTitle>
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
            prestationId={prestation.id}
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

      <PrestationStatutDialog
        open={statutDialogOpen}
        onOpenChange={setStatutDialogOpen}
        prestation={prestation}
        onSuccess={handleStatutSuccess}
      />
    </div>
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
  prestationId,
}: {
  executions: ExecutionWithPrix[];
  canManage: boolean;
  prestationId: string;
}) {
  if (executions.length === 0) {
    return (
      <div className="py-16 text-center">
        <Zap className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
        <p className="text-muted-foreground text-lg font-medium">
          Aucun prestataire assigné
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Ajoutez un prestataire et configurez les tarifs pour activer cette
          prestation.
        </p>
        {canManage && (
          <Button className="mt-4" disabled>
            <Zap className="mr-2 h-4 w-4" />
            Ajouter un prestataire (bientôt disponible)
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button disabled>
            <Zap className="mr-2 h-4 w-4" />
            Ajouter un prestataire (bientôt disponible)
          </Button>
        </div>
      )}

      {executions.map((execution) => (
        <ExecutionCard key={execution.id} execution={execution} />
      ))}
    </div>
  );
}

function ExecutionCard({ execution }: { execution: ExecutionWithPrix }) {
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

  return (
    <Card className={isActive ? "" : "opacity-60"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building className="text-primary h-4 w-4" />
            {execution.prestataireNom ?? "Prestataire inconnu"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isActive && (
              <Badge className="bg-gray-100 text-gray-600 text-xs">
                Inactif
              </Badge>
            )}
            <Badge className="bg-blue-100 text-blue-700 text-xs">
              Priorité {execution.priorite}
            </Badge>
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
    planifiee: {
      label: "Planifiée",
      className: "bg-blue-100 text-blue-700",
    },
    en_cours: {
      label: "En cours",
      className: "bg-amber-100 text-amber-700",
    },
    terminee: {
      label: "Terminée",
      className: "bg-green-100 text-green-700",
    },
    non_honoree: {
      label: "Non honorée",
      className: "bg-red-100 text-red-700",
    },
    annulee: {
      label: "Annulée",
      className: "bg-gray-100 text-gray-600",
    },
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
          {occurrences.length} intervention{occurrences.length > 1 ? "s" : ""}
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
