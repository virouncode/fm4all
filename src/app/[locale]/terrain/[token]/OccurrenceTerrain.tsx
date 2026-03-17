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
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Play,
  ThumbsDown,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OccurrenceStatutType = "planifiee" | "en_cours" | "terminee" | "non_honoree" | "annulee";
type TacheStatutType = "a_faire" | "en_cours" | "terminee" | "non_honoree" | "non_applicable" | "annulee";

type MockOccurrenceType = {
  id: string;
  serviceNom: string;
  siteNom: string;
  siteAdresse: string;
  dateDebutPrevue: Date;
  dateFinPrevue: Date;
  statut: OccurrenceStatutType;
  notes: string | null;
};

type MockTacheType = {
  id: string;
  ordre: number;
  titre: string;
  description: string | null;
  statut: TacheStatutType;
  piecesJointes: string[];
};

type OccurrenceTerrainProps = {
  token: string;
  occurrence: MockOccurrenceType;
  taches: MockTacheType[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatHeure(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
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
  TacheStatutType,
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
  token: _token,
  occurrence: initialOccurrence,
  taches: initialTaches,
}: OccurrenceTerrainProps) {
  const [occurrenceStatut, setOccurrenceStatut] = useState<OccurrenceStatutType>(
    initialOccurrence.statut,
  );
  const [taches, setTaches] = useState<MockTacheType[]>(initialTaches);
  const [agentNom, setAgentNom] = useState<string>("");
  const [nomSaisi, setNomSaisi] = useState<string>("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Charger le nom depuis localStorage si déjà saisi précédemment
  useEffect(() => {
    const saved = localStorage.getItem("terrain_agent_nom");
    if (saved) setAgentNom(saved);
  }, []);

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
      setShowNamePrompt(true);
    } else {
      void demarrerIntervention(agentNom);
    }
  };

  const handleNameSubmit = () => {
    const nom = nomSaisi.trim();
    if (!nom) return;
    localStorage.setItem("terrain_agent_nom", nom);
    setAgentNom(nom);
    setNomSaisi("");
    setShowNamePrompt(false);
    void demarrerIntervention(nom);
  };

  const demarrerIntervention = async (_nom: string) => {
    setIsStarting(true);
    // TODO: appeler updateOccurrenceStatutAction via le token
    await new Promise((r) => setTimeout(r, 600)); // simulation latence
    setOccurrenceStatut("en_cours");
    setIsStarting(false);
    toast.success("Intervention démarrée");
  };

  const handleTacheTransition = async (tacheId: string, statut: TacheStatutType) => {
    // TODO: appeler updateOccurrenceTacheStatutAction via le token
    await new Promise((r) => setTimeout(r, 300));
    setTaches((prev) =>
      prev.map((t) => (t.id === tacheId ? { ...t, statut } : t)),
    );
  };

  const handleTerminerIntervention = async () => {
    if (!allDone) return;
    // TODO: appeler updateOccurrenceStatutAction → terminee via le token
    await new Promise((r) => setTimeout(r, 600));
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
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            fm4all
          </span>
          <OccurrenceStatusBadge statut={occurrenceStatut} />
        </div>
        <p className="mt-0.5 text-xs font-medium text-gray-500">
          {initialOccurrence.serviceNom}
        </p>
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
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="capitalize">{formatDateLong(initialOccurrence.dateDebutPrevue)}</span>
          </div>
          <div className="mt-1 ml-6 text-sm font-medium text-gray-800">
            {formatHeure(initialOccurrence.dateDebutPrevue)} →{" "}
            {formatHeure(initialOccurrence.dateFinPrevue)}
          </div>

          {/* Notes */}
          {initialOccurrence.notes && (
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
          )}
          {showNotes && initialOccurrence.notes && (
            <p className="mt-2 ml-5 text-sm text-gray-600">
              {initialOccurrence.notes}
            </p>
          )}
        </div>

        {/* ====== PHASE : PLANIFIÉE ====== */}
        {occurrenceStatut === "planifiee" && (
          <>
            {/* Aperçu tâches (lecture seule) */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-700">
                  {taches.length} tâche{taches.length > 1 ? "s" : ""} prévue{taches.length > 1 ? "s" : ""}
                </p>
              </div>
              <ul className="divide-y divide-gray-100">
                {taches.map((tache) => (
                  <li key={tache.id} className="flex items-center gap-3 px-4 py-3">
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
                    width: taches.length > 0 ? `${(tachesDone / taches.length) * 100}%` : "0%",
                  }}
                />
              </div>
              {agentNom && (
                <p className="mt-1.5 text-xs text-yellow-700">
                  Agent : <strong>{agentNom}</strong>
                </p>
              )}
            </div>

            {/* Liste des tâches */}
            <div className="space-y-3">
              {taches.map((tache) => (
                <TacheCard
                  key={tache.id}
                  tache={tache}
                  onTransition={handleTacheTransition}
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
              title={!allDone ? "Toutes les tâches doivent être traitées" : undefined}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Terminer l&apos;intervention
              </span>
            </Button>
            {!allDone && (
              <p className="text-center text-xs text-gray-400">
                {taches.length - tachesDone} tâche{taches.length - tachesDone > 1 ? "s" : ""} restante{taches.length - tachesDone > 1 ? "s" : ""}
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
              {agentNom && (
                <p className="mt-1 text-sm text-gray-500">
                  Réalisée par <strong>{agentNom}</strong>
                </p>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-700">Récapitulatif</p>
              </div>
              <ul className="divide-y divide-gray-100">
                {taches.map((tache) => {
                  const cfg = TACHE_STATUT_CONFIG[tache.statut];
                  return (
                    <li
                      key={tache.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <span className="text-sm text-gray-700">{tache.titre}</span>
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
      <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
        <DialogContent className="mx-4 max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">
              Comment vous appelez-vous ?
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <input
              type="text"
              autoFocus
              placeholder="Prénom (ex : Maria)"
              value={nomSaisi}
              onChange={(e) => setNomSaisi(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSubmit();
              }}
              className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
            <Button
              size="lg"
              className="h-12 w-full rounded-xl bg-green-600 text-base hover:bg-green-700"
              onClick={handleNameSubmit}
              disabled={!nomSaisi.trim()}
            >
              Commencer
            </Button>
            <button
              type="button"
              className="text-center text-sm text-gray-400 underline"
              onClick={() => {
                setShowNamePrompt(false);
                void demarrerIntervention("Anonyme");
              }}
            >
              Continuer sans indiquer mon nom
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composant TacheCard
// ---------------------------------------------------------------------------

function TacheCard({
  tache,
  onTransition,
}: {
  tache: MockTacheType;
  onTransition: (id: string, statut: TacheStatutType) => Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cfg = TACHE_STATUT_CONFIG[tache.statut];
  const isDone =
    tache.statut === "terminee" ||
    tache.statut === "non_applicable" ||
    tache.statut === "non_honoree" ||
    tache.statut === "annulee";

  const handleTransition = async (statut: TacheStatutType) => {
    setIsUpdating(true);
    await onTransition(tache.id, statut);
    setIsUpdating(false);
  };

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
            className={`text-base font-semibold leading-snug ${tache.statut === "terminee" ? "text-gray-400 line-through" : "text-gray-900"}`}
          >
            {tache.titre}
          </p>
          {tache.description && tache.statut !== "terminee" && (
            <p className="mt-1 text-sm text-gray-500">{tache.description}</p>
          )}
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgClass} ${cfg.textClass}`}
        >
          {cfg.label}
        </span>
      </div>

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
                <Play className="mr-1.5 h-4 w-4" />
                Démarrer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-11 flex-1 rounded-xl border-slate-300 text-sm text-slate-600"
                onClick={() => handleTransition("non_applicable")}
                disabled={isUpdating}
              >
                Non applicable
              </Button>
            </div>
          )}

          {tache.statut === "en_cours" && (
            <>
              {/* Zone PJ */}
              <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2.5">
                <span className="text-sm text-gray-500">Ajouter une photo</span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5 text-gray-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={() => {
                    // TODO: upload via action serveur
                    toast.info("Upload photo — à connecter");
                  }}
                />
              </div>

              {/* Affichage PJ existantes */}
              {tache.piecesJointes.length > 0 && (
                <div className="flex gap-2">
                  {tache.piecesJointes.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-11 flex-1 rounded-xl bg-green-600 text-sm font-semibold hover:bg-green-700"
                  onClick={() => handleTransition("terminee")}
                  disabled={isUpdating}
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  Terminer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-11 flex-1 rounded-xl border-slate-300 text-sm text-slate-600"
                  onClick={() => handleTransition("non_applicable")}
                  disabled={isUpdating}
                >
                  Non applicable
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-full rounded-xl border-red-200 text-sm text-red-500 hover:bg-red-50"
                onClick={() => handleTransition("non_honoree")}
                disabled={isUpdating}
              >
                <ThumbsDown className="mr-1.5 h-3.5 w-3.5" />
                Non honorée
              </Button>
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
  const config: Record<OccurrenceStatutType, { label: string; className: string }> = {
    planifiee: { label: "Planifiée", className: "bg-blue-100 text-blue-700" },
    en_cours: { label: "En cours", className: "bg-yellow-100 text-yellow-700" },
    terminee: { label: "Terminée", className: "bg-green-100 text-green-700" },
    non_honoree: { label: "Non honorée", className: "bg-red-100 text-red-700" },
    annulee: { label: "Annulée", className: "bg-gray-100 text-gray-500" },
  };
  const { label, className } = config[statut];
  return <Badge className={`text-xs ${className}`}>{label}</Badge>;
}
