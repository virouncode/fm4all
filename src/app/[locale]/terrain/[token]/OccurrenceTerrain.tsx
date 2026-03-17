"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addTachePieceJointeFieldAction,
  openTerrainSessionAction,
  startOccurrenceFieldAction,
  terminateOccurrenceFieldAction,
  updateTacheFieldAction,
} from "@/server/actions/terrainActions";
import type {
  TerrainOccurrenceType,
  TerrainTachePjType,
  TerrainTacheType,
} from "@/server/queries/terrain.query";
import type { OccurrenceTacheTransitionStatutType } from "@/zod-schemas/clientServiceOccurrences.schema";
import type {
  OccurrenceStatutType,
  OccurrenceTacheStatutType,
} from "@/zod-schemas/enums";
import type { Channel } from "pusher-js";
import {
  AlertCircle,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HardHat,
  MapPin,
  Play,
  ThumbsDown,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// localStorage keys
const LS_AGENT_NOM = "fm4all:terrainAgentNom";
const lsSessionId = (occId: string) => `fm4all:terrainSessionId_${occId}`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OccurrenceTerrainProps = {
  token: string;
  occurrence: TerrainOccurrenceType;
  taches: TerrainTacheType[];
  clientEntrepriseId: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatHeure(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const TACHE_STATUT_CONFIG: Record<
  OccurrenceTacheStatutType,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  a_faire: {
    label: "À faire",
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
    borderClass: "border-gray-200",
  },
  en_cours: {
    label: "En cours",
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-700",
    borderClass: "border-yellow-300",
  },
  terminee: {
    label: "Terminée",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    borderClass: "border-green-300",
  },
  non_honoree: {
    label: "Non honorée",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-300",
  },
  non_applicable: {
    label: "Non applicable",
    bgClass: "bg-slate-50",
    textClass: "text-slate-500",
    borderClass: "border-slate-200",
  },
  annulee: {
    label: "Annulée",
    bgClass: "bg-gray-50",
    textClass: "text-gray-400",
    borderClass: "border-gray-200",
  },
};

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export function OccurrenceTerrain({
  token,
  occurrence: initialOccurrence,
  taches: initialTaches,
}: OccurrenceTerrainProps) {
  const [occurrenceStatut, setOccurrenceStatut] =
    useState<OccurrenceStatutType>(initialOccurrence.statut);
  const [occurrenceStarterNom, setOccurrenceStarterNom] = useState<
    string | null
  >(initialOccurrence.startedByNom);
  const [taches, setTaches] = useState<TerrainTacheType[]>(initialTaches);

  const [agentNom, setAgentNom] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nomSaisi, setNomSaisi] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<
    | { type: "occurrence" }
    | {
        type: "tache";
        tacheId: string;
        statut: OccurrenceTacheTransitionStatutType;
      }
    | null
  >(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const occurrenceId = initialOccurrence.id;

  // Charger agentNom + sessionId depuis localStorage au montage
  useEffect(() => {
    const nom = localStorage.getItem(LS_AGENT_NOM) ?? "";
    if (nom) setAgentNom(nom);
    const sid = localStorage.getItem(lsSessionId(occurrenceId));
    if (sid) setSessionId(sid);
  }, [occurrenceId]);

  // Pusher — temps réel
  useEffect(() => {
    let channel: Channel | null = null;

    async function subscribe() {
      const { pusherClient } = await import("@/lib/pusher");
      channel = pusherClient.subscribe(`terrain-${occurrenceId}`);

      channel.bind(
        "occurrence-updated",
        (data: { statut: OccurrenceStatutType; startedByNom: string | null }) => {
          setOccurrenceStatut(data.statut);
          if (data.startedByNom !== undefined) {
            setOccurrenceStarterNom(data.startedByNom);
          }
        },
      );

      channel.bind(
        "tache-updated",
        (data: {
          tacheId: string;
          statut: OccurrenceTacheStatutType;
          assigneeNom: string | null;
          completeeParNom: string | null;
        }) => {
          setTaches((prev) =>
            prev.map((t) =>
              t.id === data.tacheId
                ? {
                    ...t,
                    statut: data.statut,
                    assigneeNom: data.assigneeNom,
                    completeeParNom: data.completeeParNom,
                  }
                : t,
            ),
          );
        },
      );

      channel.bind(
        "piece-jointe-added",
        (data: {
          tacheId: string;
          linkId: string;
          documentId: string;
          storageKey: string;
          filename: string;
        }) => {
          setTaches((prev) =>
            prev.map((t) =>
              t.id === data.tacheId
                ? {
                    ...t,
                    piecesJointes: [
                      ...t.piecesJointes,
                      {
                        linkId: data.linkId,
                        documentId: data.documentId,
                        storageKey: data.storageKey,
                        filename: data.filename,
                      },
                    ],
                  }
                : t,
            ),
          );
        },
      );
    }

    void subscribe();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [occurrenceId]);

  const tachesDone = taches.filter(
    (t) =>
      t.statut === "terminee" ||
      t.statut === "non_applicable" ||
      t.statut === "non_honoree" ||
      t.statut === "annulee",
  ).length;
  const allDone = tachesDone === taches.length && taches.length > 0;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleDemarrerClick = () => {
    if (!agentNom) {
      setPendingAction({ type: "occurrence" });
    } else {
      void demarrerIntervention(agentNom, sessionId);
    }
  };

  const handleTacheDemarrerClick = (
    tacheId: string,
    statut: OccurrenceTacheTransitionStatutType,
  ) => {
    if (!agentNom) {
      setPendingAction({ type: "tache", tacheId, statut });
    } else {
      void handleTacheTransition(tacheId, statut, sessionId);
    }
  };

  const handleNameSubmit = async () => {
    const nom = nomSaisi.trim();
    if (!nom) return;

    // Créer la session terrain
    const result = await openTerrainSessionAction({ token, agentNom: nom });
    if (result?.serverError || !result?.data) {
      toast.error("Impossible d'ouvrir la session. Réessayez.");
      return;
    }
    const { sessionId: newSessionId } = result.data;

    localStorage.setItem(LS_AGENT_NOM, nom);
    localStorage.setItem(lsSessionId(occurrenceId), newSessionId);
    setAgentNom(nom);
    setSessionId(newSessionId);
    setNomSaisi("");

    if (pendingAction?.type === "occurrence") {
      setPendingAction(null);
      void demarrerIntervention(nom, newSessionId);
    } else if (pendingAction?.type === "tache") {
      const { tacheId, statut } = pendingAction;
      setPendingAction(null);
      void handleTacheTransition(tacheId, statut, newSessionId);
    } else {
      setPendingAction(null);
    }
  };

  const demarrerIntervention = async (
    nom: string,
    sid: string | null,
  ) => {
    if (!sid) {
      toast.error("Session introuvable. Rechargez la page.");
      return;
    }
    setIsStarting(true);
    const result = await startOccurrenceFieldAction({ token, sessionId: sid });
    if (result?.serverError) {
      toast.error("Impossible de démarrer l'intervention.");
      setIsStarting(false);
      return;
    }
    setOccurrenceStatut("en_cours");
    setOccurrenceStarterNom(nom);
    setIsStarting(false);
    toast.success("Intervention démarrée");
  };

  const handleTacheTransition = async (
    tacheId: string,
    statut: OccurrenceTacheTransitionStatutType,
    sid: string | null,
  ) => {
    if (!sid) {
      toast.error("Session introuvable. Rechargez la page.");
      return;
    }
    const result = await updateTacheFieldAction({
      token,
      tacheId,
      statut,
      sessionId: sid,
    });
    if (result?.serverError) {
      toast.error("Impossible de mettre à jour la tâche.");
      return;
    }
    // L'état sera mis à jour via Pusher
  };

  const handleTerminerIntervention = async () => {
    if (!allDone) return;
    if (!sessionId) {
      toast.error("Session introuvable. Rechargez la page.");
      return;
    }
    const result = await terminateOccurrenceFieldAction({
      token,
      sessionId,
    });
    if (result?.serverError) {
      toast.error("Impossible de terminer l'intervention.");
      return;
    }
    setOccurrenceStatut("terminee");
    toast.success("Intervention terminée !");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ====== HEADER ====== */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <Image
            src="/img/logo_simple.webp"
            alt="fm4all"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <OccurrenceStatusBadge statut={occurrenceStatut} />
        </div>
        <p className="mt-1 text-sm font-semibold text-gray-800">
          {initialOccurrence.serviceNom}
        </p>
        <div className="mt-1 flex flex-col gap-0.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <HardHat className="h-3 w-3 flex-shrink-0 text-gray-400" />
            <span className="font-medium text-gray-500">Prestataire :</span>
            <span>{initialOccurrence.prestataireNom ?? "—"}</span>
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3 flex-shrink-0 text-gray-400" />
            <span className="font-medium text-gray-500">Client :</span>
            <span>{initialOccurrence.clientNom}</span>
          </span>
        </div>
      </header>

      {/* ====== CONTENU PRINCIPAL ====== */}
      <main className="flex flex-1 flex-col gap-4 p-4 pb-8">
        {/* Card site + date */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-gray-900">
                {initialOccurrence.siteNom}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                {initialOccurrence.siteAdresse}
              </p>
            </div>
          </div>
          {initialOccurrence.dateDebutPrevue && (
            <>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="capitalize">
                  {formatDateLong(initialOccurrence.dateDebutPrevue)}
                </span>
              </div>
              <div className="mt-1 ml-6 text-sm font-medium text-gray-800">
                {formatHeure(initialOccurrence.dateDebutPrevue)}
                {initialOccurrence.dateFinPrevue &&
                  ` → ${formatHeure(initialOccurrence.dateFinPrevue)}`}
              </div>
            </>
          )}

          {/* Consignes */}
          {initialOccurrence.notes && (
            <>
              <button
                type="button"
                className="mt-3 flex w-full items-center gap-1.5 text-left text-xs text-blue-600"
                onClick={() => setShowNotes((v) => !v)}
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium">Consignes</span>
                {showNotes ? (
                  <ChevronUp className="ml-auto h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="ml-auto h-3.5 w-3.5" />
                )}
              </button>
              {showNotes && (
                <p className="mt-2 ml-5 text-sm text-gray-600">
                  {initialOccurrence.notes}
                </p>
              )}
            </>
          )}
        </div>

        {/* ====== PHASE : PLANIFIÉE ====== */}
        {occurrenceStatut === "planifiee" && (
          <>
            {/* Aperçu tâches (lecture seule) */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-700">
                  {taches.length} tâche{taches.length > 1 ? "s" : ""} prévue
                  {taches.length > 1 ? "s" : ""}
                </p>
              </div>
              <ul className="divide-y divide-gray-100">
                {taches.map((tache) => (
                  <li
                    key={tache.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                      {tache.ordre}
                    </span>
                    <span className="text-sm text-gray-700">{tache.titre}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bouton démarrer */}
            <Button
              size="lg"
              className="h-14 w-full rounded-2xl bg-green-600 text-base font-semibold hover:bg-green-700"
              onClick={handleDemarrerClick}
              disabled={isStarting}
            >
              {isStarting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Démarrage…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Démarrer l&apos;intervention
                </span>
              )}
            </Button>

            {agentNom && (
              <p className="text-center text-xs text-gray-400">
                Connecté en tant que <strong>{agentNom}</strong>
              </p>
            )}
          </>
        )}

        {/* ====== PHASE : EN COURS ====== */}
        {occurrenceStatut === "en_cours" && (
          <>
            {/* Progression */}
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-yellow-800">
                  Intervention en cours
                </span>
                <span className="text-yellow-700">
                  {tachesDone}/{taches.length} tâches
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-yellow-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{
                    width:
                      taches.length > 0
                        ? `${(tachesDone / taches.length) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              {occurrenceStarterNom && (
                <p className="mt-1.5 text-xs text-yellow-700">
                  Démarrée par <strong>{occurrenceStarterNom}</strong>
                  {agentNom && agentNom !== occurrenceStarterNom && (
                    <span className="ml-1 text-yellow-600">
                      · vous : <strong>{agentNom}</strong>
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Liste des tâches */}
            <div className="space-y-3">
              {taches.map((tache) => (
                <TacheCard
                  key={tache.id}
                  tache={tache}
                  token={token}
                  agentNom={agentNom}
                  sessionId={sessionId}
                  onTransition={handleTacheDemarrerClick}
                  onPjAdded={(tacheId, pj) => {
                    setTaches((prev) =>
                      prev.map((t) =>
                        t.id === tacheId
                          ? { ...t, piecesJointes: [...t.piecesJointes, pj] }
                          : t,
                      ),
                    );
                  }}
                />
              ))}
            </div>

            {/* Bouton terminer l'intervention */}
            <Button
              size="lg"
              className="mt-2 h-14 w-full rounded-2xl text-base font-semibold"
              variant={allDone ? "default" : "outline"}
              disabled={!allDone}
              onClick={handleTerminerIntervention}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Terminer l&apos;intervention
              </span>
            </Button>
            {!allDone && (
              <p className="text-center text-xs text-gray-400">
                {taches.length - tachesDone} tâche
                {taches.length - tachesDone > 1 ? "s" : ""} restante
                {taches.length - tachesDone > 1 ? "s" : ""}
              </p>
            )}
          </>
        )}

        {/* ====== PHASE : TERMINÉE ====== */}
        {occurrenceStatut === "terminee" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">
                Intervention terminée !
              </p>
              {occurrenceStarterNom && (
                <p className="mt-1 text-sm text-gray-500">
                  Terminée par <strong>{occurrenceStarterNom}</strong>
                </p>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-700">
                  Récapitulatif
                </p>
              </div>
              <ul className="divide-y divide-gray-100">
                {taches.map((tache) => {
                  const cfg = TACHE_STATUT_CONFIG[tache.statut];
                  return (
                    <li
                      key={tache.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <span className="text-sm text-gray-700">
                        {tache.titre}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgClass} ${cfg.textClass}`}
                      >
                        {cfg.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="text-center text-xs text-gray-400">
              Vous pouvez fermer cette page.
            </p>
          </div>
        )}
      </main>

      {/* ====== DIALOG NOM ====== */}
      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl p-6 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">
              Comment vous appelez-vous ?
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <input
              type="text"
              autoFocus
              placeholder="Votre prénom"
              value={nomSaisi}
              onChange={(e) => setNomSaisi(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleNameSubmit();
              }}
              className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
            />
            <Button
              size="lg"
              className="h-12 w-full rounded-xl bg-green-600 text-base hover:bg-green-700"
              onClick={() => void handleNameSubmit()}
              disabled={!nomSaisi.trim()}
            >
              Commencer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composant TacheCard
// ---------------------------------------------------------------------------

type ConfirmStatutType = "non_applicable" | "non_honoree";

const CONFIRM_CONFIG: Record<
  ConfirmStatutType,
  {
    titre: string;
    description: string;
    consequence: string;
    buttonLabel: string;
    buttonClass: string;
  }
> = {
  non_applicable: {
    titre: "Tâche non applicable",
    description:
      "Cette tâche ne s'applique pas à la situation actuelle (zone inaccessible, déjà effectuée par quelqu'un d'autre, matériel absent…).",
    consequence:
      "Elle sera comptabilisée comme traitée et n'apparaîtra pas comme un manquement dans le rapport.",
    buttonLabel: "Confirmer — Non applicable",
    buttonClass: "border-slate-300 text-slate-700 hover:bg-slate-50",
  },
  non_honoree: {
    titre: "Tâche non honorée",
    description:
      "Cette tâche n'a pas pu être réalisée dans le temps imparti ou faute de moyens.",
    consequence:
      "Elle sera signalée comme non réalisée dans le rapport d'intervention et sera visible par le responsable.",
    buttonLabel: "Confirmer — Non honorée",
    buttonClass: "border-red-300 text-red-600 hover:bg-red-50",
  },
};

function TacheCard({
  tache,
  token,
  agentNom,
  sessionId,
  onTransition,
  onPjAdded,
}: {
  tache: TerrainTacheType;
  token: string;
  agentNom: string;
  sessionId: string | null;
  onTransition: (id: string, statut: OccurrenceTacheTransitionStatutType) => void;
  onPjAdded: (tacheId: string, pj: TerrainTachePjType) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmStatut, setConfirmStatut] = useState<ConfirmStatutType | null>(
    null,
  );
  // Local photo previews (blob URLs) pour affichage immédiat après upload
  const [localPreviews, setLocalPreviews] = useState<
    { blobUrl: string; filename: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cfg = TACHE_STATUT_CONFIG[tache.statut];
  const isDone =
    tache.statut === "terminee" ||
    tache.statut === "non_applicable" ||
    tache.statut === "non_honoree" ||
    tache.statut === "annulee";

  const startedBy = tache.assigneeNom;
  const myStartedThis = !!agentNom && startedBy === agentNom;
  const canTerminate = !startedBy || myStartedThis;

  const handleTransition = async (statut: OccurrenceTacheTransitionStatutType) => {
    setIsUpdating(true);
    onTransition(tache.id, statut);
    await new Promise((r) => setTimeout(r, 150)); // feedback visuel
    setIsUpdating(false);
  };

  const handleConfirmedTransition = async (statut: ConfirmStatutType) => {
    setConfirmStatut(null);
    await handleTransition(statut);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!sessionId) {
      toast.error("Session introuvable. Rechargez la page.");
      return;
    }
    setIsUploading(true);

    // Preview local immédiate
    const blobUrl = URL.createObjectURL(file);

    try {
      // 1. Obtenir l'URL de upload présignée
      const presignRes = await fetch("/api/s3/presign-upload-terrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          contentType: file.type,
          originalName: file.name,
        }),
      });

      if (!presignRes.ok) {
        toast.error("Impossible de préparer l'upload.");
        setIsUploading(false);
        return;
      }

      const { data } = (await presignRes.json()) as {
        data: { key: string; url: string; headers: Record<string, string> };
      };

      // 2. Upload vers S3
      await fetch(data.url, {
        method: "PUT",
        headers: data.headers,
        body: file,
      });

      // 3. Enregistrer en base
      const result = await addTachePieceJointeFieldAction({
        token,
        tacheId: tache.id,
        storageKey: data.key,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });

      if (result?.serverError || !result?.data) {
        toast.error("Impossible d'enregistrer la photo.");
        setIsUploading(false);
        return;
      }

      setLocalPreviews((prev) => [...prev, { blobUrl, filename: file.name }]);
      onPjAdded(tache.id, {
        linkId: result.data.linkId,
        documentId: result.data.documentId,
        storageKey: data.key,
        filename: file.name,
      });
      toast.success("Photo ajoutée");
    } catch {
      toast.error("Erreur lors de l'upload de la photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const totalPj = tache.piecesJointes.length + localPreviews.length;

  return (
    <div
      className={`rounded-2xl border-2 bg-white p-4 shadow-sm transition-all ${cfg.borderClass} ${isDone ? "opacity-70" : ""}`}
    >
      {/* En-tête de la tâche */}
      <div className="flex items-start gap-3">
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
        >
          {tache.statut === "terminee" ? (
            <Check className="h-4 w-4" />
          ) : tache.statut === "non_applicable" ? (
            <X className="h-4 w-4 text-slate-400" />
          ) : tache.statut === "non_honoree" ? (
            <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
          ) : (
            tache.ordre
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-base leading-snug font-semibold ${tache.statut === "terminee" ? "text-gray-400 line-through" : "text-gray-900"}`}
          >
            {tache.titre}
          </p>
          {tache.description && tache.statut !== "terminee" && (
            <p className="mt-1 text-sm text-gray-500">{tache.description}</p>
          )}
          {tache.statut === "en_cours" && startedBy && (
            <p className="mt-1 text-xs text-yellow-600">
              {myStartedThis ? (
                <span>Commencée par vous</span>
              ) : (
                <span>
                  En cours par <strong>{startedBy}</strong>
                </span>
              )}
            </p>
          )}
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgClass} ${cfg.textClass}`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Dialog confirmation */}
      {confirmStatut && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setConfirmStatut(null);
          }}
        >
          <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl p-6 sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center text-base">
                {CONFIRM_CONFIG[confirmStatut].titre}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-1">
              <p className="text-sm text-gray-700">
                {CONFIRM_CONFIG[confirmStatut].description}
              </p>
              <div
                className={`rounded-xl border px-3 py-2.5 text-xs ${confirmStatut === "non_honoree" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}
              >
                <span className="font-semibold">Conséquence : </span>
                {CONFIRM_CONFIG[confirmStatut].consequence}
              </div>
              <Button
                size="sm"
                variant="outline"
                className={`h-11 w-full rounded-xl border text-sm font-semibold ${CONFIRM_CONFIG[confirmStatut].buttonClass}`}
                onClick={() => void handleConfirmedTransition(confirmStatut)}
              >
                {CONFIRM_CONFIG[confirmStatut].buttonLabel}
              </Button>
              <button
                type="button"
                className="text-center text-sm text-gray-400 underline"
                onClick={() => setConfirmStatut(null)}
              >
                Annuler
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Boutons d'action */}
      {!isDone && (
        <div className="mt-4 space-y-2">
          {tache.statut === "a_faire" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-11 flex-1 rounded-xl bg-green-600 text-sm font-semibold hover:bg-green-700"
                onClick={() => handleTransition("en_cours")}
                disabled={isUpdating}
              >
                <Play className="h-4 w-4" />
                Démarrer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-11 flex-1 rounded-xl border-slate-300 text-sm text-slate-600"
                onClick={() => setConfirmStatut("non_applicable")}
                disabled={isUpdating}
              >
                Non applicable
              </Button>
            </div>
          )}

          {tache.statut === "en_cours" && (
            <>
              {/* Zone upload photo */}
              <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2.5">
                <span className="text-sm text-gray-500">
                  {isUploading
                    ? "Upload en cours…"
                    : totalPj > 0
                      ? `${totalPj} photo${totalPj > 1 ? "s" : ""}`
                      : "Ajouter une photo"}
                </span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm disabled:opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  ) : (
                    <Camera className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handlePhotoUpload(file);
                    // reset pour permettre re-upload du même fichier
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Thumbnails */}
              {localPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {localPreviews.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={p.blobUrl}
                      alt={p.filename}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              {canTerminate ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-11 flex-1 rounded-xl bg-green-600 text-sm font-semibold hover:bg-green-700"
                      onClick={() => handleTransition("terminee")}
                      disabled={isUpdating}
                    >
                      <Check className="h-4 w-4" />
                      Terminer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-11 flex-1 rounded-xl border-slate-300 text-sm text-slate-600"
                      onClick={() => setConfirmStatut("non_applicable")}
                      disabled={isUpdating}
                    >
                      Non applicable
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 w-full rounded-xl border-red-200 text-sm text-red-500 hover:bg-red-50"
                    onClick={() => setConfirmStatut("non_honoree")}
                    disabled={isUpdating}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    Non honorée
                  </Button>
                </>
              ) : (
                <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-center text-xs text-gray-500">
                  En cours par <strong>{startedBy}</strong> — vous ne pouvez
                  pas la terminer
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge statut occurrence
// ---------------------------------------------------------------------------

function OccurrenceStatusBadge({ statut }: { statut: OccurrenceStatutType }) {
  const config: Record<
    OccurrenceStatutType,
    { label: string; className: string }
  > = {
    planifiee: { label: "Planifiée", className: "bg-blue-100 text-blue-700" },
    en_cours: { label: "En cours", className: "bg-yellow-100 text-yellow-700" },
    terminee: { label: "Terminée", className: "bg-green-100 text-green-700" },
    non_honoree: { label: "Non honorée", className: "bg-red-100 text-red-700" },
    annulee: { label: "Annulée", className: "bg-gray-100 text-gray-500" },
  };
  const { label, className } = config[statut];
  return <Badge className={`text-xs ${className}`}>{label}</Badge>;
}
