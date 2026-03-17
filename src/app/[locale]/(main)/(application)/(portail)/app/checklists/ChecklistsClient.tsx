"use client";

import { TacheListeManagerContent } from "@/app/[locale]/(main)/(application)/(portail)/app/prestations/[prestationId]/TacheListeManagerDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  getEntreprisesClientesAction,
  getEntreprisesPrestatairesAction,
} from "@/server/actions/entreprisesActions";
import { getChecklistsForPageAction } from "@/server/actions/tacheListesTemplatesActions";
import { NewChecklistDialog } from "./NewChecklistDialog";
import type { TacheListeTemplateWithServiceNom } from "@/server/queries/tacheListesTemplates.query";
import { useAppStore } from "@/stores/application/appStore";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  ListChecks,
  Loader2,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type ServiceGroupType = {
  serviceId: string;
  serviceNom: string;
  systemPacks: TacheListeTemplateWithServiceNom[];
};

type TypeProprietaireType = "all" | "systeme" | "client" | "prestataire";

export function ChecklistsClient() {
  const posture = useAppStore((s) => s.postureActive);
  const entreprise = useAppStore((s) => s.entreprise);
  const roleClientAdhesion = useAppStore((s) => s.roleClientAdhesion);
  const rolePrestataireAdhesion = useAppStore((s) => s.rolePrestataireAdhesion);
  const rolePlateformeAdhesion = useAppStore((s) => s.rolePlateformeAdhesion);

  // Peut créer/modifier/supprimer des checklists (au moins manager)
  const canManageChecklist =
    (posture === "plateforme" && !!rolePlateformeAdhesion) ||
    (posture === "client" && (roleClientAdhesion === "admin" || roleClientAdhesion === "manager")) ||
    (posture === "prestataire" && (rolePrestataireAdhesion === "admin" || rolePrestataireAdhesion === "manager"));

  // Data — uniquement pour déterminer quels services afficher
  const [systemPacks, setSystemPacks] = useState<
    TacheListeTemplateWithServiceNom[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const [typeFilter, setTypeFilter] = useState<TypeProprietaireType>("all");
  const [entrepriseFilterId, setEntrepriseFilterId] = useState<string>("");
  const [entreprisesList, setEntreprisesList] = useState<
    Array<{ id: string; nom: string }>
  >([]);
  const [loadingEntreprises, setLoadingEntreprises] = useState(false);

  // Services proposés par le prestataire (posture prestataire uniquement)
  const [prestataireServices, setPrestataireServices] = useState<
    Array<{ id: string; nom: string }> | null
  >(null);

  // Tous les services (posture client uniquement)
  const [clientServices, setClientServices] = useState<
    Array<{ id: string; nom: string }> | null
  >(null);

  // ====================== LOAD SERVICE GROUPS ======================

  const loadServiceGroups = useCallback(async () => {
    if (!posture) return;
    setLoading(true);

    if (posture === "plateforme") {
      if (
        (typeFilter === "client" || typeFilter === "prestataire") &&
        !entrepriseFilterId
      ) {
        setSystemPacks([]);
        setLoading(false);
        return;
      }

      // all → undefined (pas de filtre), systeme → null, client/prestataire → uuid
      const proprietaireFilter: string | null | undefined =
        typeFilter === "all"
          ? undefined
          : typeFilter === "systeme"
            ? null
            : entrepriseFilterId || null;

      const result = await getChecklistsForPageAction({
        posture: "plateforme",
        serviceId: serviceFilter === "all" ? undefined : serviceFilter,
        proprietaireFilter,
      });
      if (result?.data) {
        // Pour plateforme, ownPacks contient tout
        setSystemPacks(result.data.ownPacks);
      }
    } else if (posture === "client" || posture === "prestataire") {
      if (!entreprise?.id) {
        setLoading(false);
        return;
      }
      const result = await getChecklistsForPageAction({
        posture,
        entrepriseId: entreprise.id,
        serviceId: serviceFilter === "all" ? undefined : serviceFilter,
      });
      if (result?.data) {
        // Combine system + own packs pour construire les groupes de services
        // (TacheListeManagerContent gère ses propres packs indépendamment)
        setSystemPacks([
          ...result.data.systemPacks,
          ...result.data.ownPacks,
        ]);
        if (posture === "prestataire") {
          setPrestataireServices(result.data.prestataireServices ?? null);
        }
        if (posture === "client") {
          setClientServices(result.data.clientServices ?? null);
        }
      }
    }

    setLoading(false);
  }, [posture, entreprise?.id, serviceFilter, typeFilter, entrepriseFilterId]);

  useEffect(() => {
    void loadServiceGroups();
  }, [loadServiceGroups]);

  // ====================== LOAD ENTERPRISES (plateforme) ======================

  useEffect(() => {
    if (posture !== "plateforme") return;
    if (typeFilter === "all" || typeFilter === "systeme") {
      setEntreprisesList([]);
      setEntrepriseFilterId("");
      return;
    }

    setLoadingEntreprises(true);
    setEntrepriseFilterId("");

    const load = async () => {
      if (typeFilter === "client") {
        const result = await getEntreprisesClientesAction();
        if (result?.data?.clients) setEntreprisesList(result.data.clients);
      } else {
        const result = await getEntreprisesPrestatairesAction();
        if (result?.data?.prestataires)
          setEntreprisesList(result.data.prestataires);
      }
      setLoadingEntreprises(false);
    };
    void load();
  }, [posture, typeFilter]);

  // IDs clients pour le mode "all" plateforme (permet de distinguer Client vs Prestataire)
  const [clientEntrepriseIdsForAllMode, setClientEntrepriseIdsForAllMode] =
    useState<Set<string>>(new Set());

  useEffect(() => {
    if (posture !== "plateforme" || typeFilter !== "all") {
      setClientEntrepriseIdsForAllMode(new Set());
      return;
    }
    void getEntreprisesClientesAction().then((result) => {
      if (result?.data?.clients) {
        setClientEntrepriseIdsForAllMode(
          new Set(result.data.clients.map((c) => c.id)),
        );
      }
    });
  }, [posture, typeFilter]);

  // ====================== GROUP BY SERVICE ======================

  const serviceGroups = useMemo((): ServiceGroupType[] => {
    const map = new Map<string, ServiceGroupType>();
    for (const pack of systemPacks) {
      const existing = map.get(pack.serviceId) ?? {
        serviceId: pack.serviceId,
        serviceNom: pack.serviceNom,
        systemPacks: [],
      };
      existing.systemPacks.push(pack);
      map.set(pack.serviceId, existing);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.serviceNom.localeCompare(b.serviceNom, "fr"),
    );
  }, [systemPacks]);

  const availableServices = useMemo(() => {
    const seen = new Map<string, string>();
    for (const g of serviceGroups) seen.set(g.serviceId, g.serviceNom);
    return Array.from(seen.entries()).map(([id, nom]) => ({ id, nom }));
  }, [serviceGroups]);

  const filteredGroups = useMemo(() => {
    if (serviceFilter === "all") return serviceGroups;
    return serviceGroups.filter((g) => g.serviceId === serviceFilter);
  }, [serviceGroups, serviceFilter]);

  // ====================== COMPUTED ======================

  const isPlateformMode = posture === "plateforme";

  // null = packs système, uuid = packs d'une entreprise spécifique
  const proprietaireEntrepriseId: string | null = isPlateformMode
    ? typeFilter === "systeme" || typeFilter === "all"
      ? null
      : entrepriseFilterId || null
    : (entreprise?.id ?? null);

  // ====================== NEW CHECKLIST DIALOG ======================

  const [newChecklistOpen, setNewChecklistOpen] = useState(false);

  const handleNewChecklistSuccess = useCallback(() => {
    void loadServiceGroups();
  }, [loadServiceGroups]);

  // ====================== RENDER ======================

  return (
    <div className="flex h-full flex-col gap-4">
      {/* ===== HEADER ===== */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <ListChecks className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold">Checklists</h1>
      </div>

      {/* ===== FILTRES PLATEFORME ===== */}
      {isPlateformMode && (
        <div className="bg-muted/30 flex flex-shrink-0 flex-wrap items-center gap-3 rounded-lg border px-4 py-3">
          {/* Service filter */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Service
            </span>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="h-8 w-48 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>
                {availableServices.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Type de propriétaire */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Type
            </span>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as TypeProprietaireType)}
            >
              <SelectTrigger className="h-8 w-44 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="systeme">Système</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="prestataire">Prestataire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entreprise (si client ou prestataire) */}
          {(typeFilter === "client" || typeFilter === "prestataire") && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  Entreprise
                </span>
                {loadingEntreprises ? (
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                ) : (
                  <Select
                    value={entrepriseFilterId || "all"}
                    onValueChange={(v) =>
                      setEntrepriseFilterId(v === "all" ? "" : v)
                    }
                  >
                    <SelectTrigger className="h-8 w-52 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {typeFilter === "client"
                          ? "Tous les clients"
                          : "Tous les prestataires"}
                      </SelectItem>
                      {entreprisesList.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </>
          )}

          {/* Bouton Nouvelle checklist — masqué si aucune entreprise sélectionnée
              (évite de créer un pack système par mégarde en mode "client"/"prestataire") */}
          {canManageChecklist &&
            !((typeFilter === "client" || typeFilter === "prestataire") && !entrepriseFilterId) && (
              <Button
                type="button"
                size="sm"
                className="ml-auto"
                onClick={() => setNewChecklistOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Nouvelle checklist
              </Button>
            )}
        </div>
      )}

      {/* ===== FILTRES CLIENT / PRESTATAIRE ===== */}
      {!isPlateformMode && (
        <div className="bg-muted/30 flex flex-shrink-0 flex-wrap items-center gap-3 rounded-lg border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Service
            </span>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="h-8 w-48 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>
                {(posture === "prestataire" && prestataireServices
                  ? prestataireServices
                  : posture === "client" && clientServices
                    ? clientServices
                    : availableServices
                ).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canManageChecklist && (
            <Button
              type="button"
              size="sm"
              className="ml-auto"
              onClick={() => setNewChecklistOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nouvelle checklist
            </Button>
          )}
        </div>
      )}

      {/* ===== CONTENU ===== */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : isPlateformMode &&
          (typeFilter === "client" || typeFilter === "prestataire") &&
          !entrepriseFilterId ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ListChecks className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Sélectionnez une entreprise pour afficher ses checklists.
            </p>
          </div>
        ) : filteredGroups.length === 0 && !isPlateformMode ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ListChecks className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Aucune checklist disponible.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pour plateforme : affiche TacheListeManagerContent groupé si aucun groupe trouvé */}
            {isPlateformMode && filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ListChecks className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                  Aucune checklist trouvée.
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <ServiceGroupCard
                  key={group.serviceId}
                  group={group}
                  posture={posture}
                  isPlateformMode={isPlateformMode}
                  typeFilter={typeFilter}
                  proprietaireEntrepriseId={proprietaireEntrepriseId}
                  clientEntrepriseIdsForAllMode={clientEntrepriseIdsForAllMode}
                  canManage={canManageChecklist}
                  nonSystemBadgeRole={
                    isPlateformMode
                      ? typeFilter === "client"
                        ? "client"
                        : typeFilter === "prestataire"
                          ? "prestataire"
                          : undefined
                      : posture === "client" || posture === "prestataire"
                        ? (posture as "client" | "prestataire")
                        : undefined
                  }
                  onPacksChanged={loadServiceGroups}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ===== DIALOG NOUVELLE CHECKLIST ===== */}
      <NewChecklistDialog
        open={newChecklistOpen}
        onOpenChange={setNewChecklistOpen}
        proprietaireEntrepriseId={proprietaireEntrepriseId}
        allowedServiceIds={prestataireServices?.map((s) => s.id)}
        onSuccess={handleNewChecklistSuccess}
      />
    </div>
  );
}

// ========================== SERVICE GROUP CARD ==========================

function ServiceGroupCard({
  group,
  posture,
  isPlateformMode,
  typeFilter,
  proprietaireEntrepriseId,
  clientEntrepriseIdsForAllMode,
  canManage,
  nonSystemBadgeRole,
  onPacksChanged,
}: {
  group: ServiceGroupType;
  posture: string | null;
  isPlateformMode: boolean;
  typeFilter: TypeProprietaireType;
  proprietaireEntrepriseId: string | null;
  clientEntrepriseIdsForAllMode?: Set<string>;
  canManage?: boolean;
  nonSystemBadgeRole?: "client" | "prestataire";
  onPacksChanged: () => Promise<void>;
}) {
  if (!group.serviceId) return null;

  // En mode "all" plateforme : grouper par propriétaire, un TacheListeManagerContent par groupe
  if (isPlateformMode && typeFilter === "all") {
    type ProprietaireGroupType = {
      proprietaireEntrepriseId: string | null;
      proprietaireEntrepriseNom: string | null;
    };
    const proprietaireGroupMap = new Map<string | null, ProprietaireGroupType>();
    for (const pack of group.systemPacks) {
      const key = pack.proprietaireEntrepriseId;
      if (!proprietaireGroupMap.has(key)) {
        proprietaireGroupMap.set(key, {
          proprietaireEntrepriseId: key,
          proprietaireEntrepriseNom: pack.proprietaireEntrepriseNom ?? null,
        });
      }
    }
    const sortedGroups = Array.from(proprietaireGroupMap.values()).sort(
      (a, b) => {
        if (a.proprietaireEntrepriseId === null) return -1;
        if (b.proprietaireEntrepriseId === null) return 1;
        return (a.proprietaireEntrepriseNom ?? "").localeCompare(
          b.proprietaireEntrepriseNom ?? "",
          "fr",
        );
      },
    );

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{group.serviceNom}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {sortedGroups.map((pg, idx) => (
            <div key={pg.proprietaireEntrepriseId ?? "__system__"}>
              {(sortedGroups.length > 1 || pg.proprietaireEntrepriseId !== null) && (
                <>
                  {idx > 0 && <Separator className="mb-4" />}
                  <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                    {pg.proprietaireEntrepriseId === null
                      ? "Système"
                      : pg.proprietaireEntrepriseNom}
                  </p>
                </>
              )}
              <TacheListeManagerContent
                serviceId={group.serviceId}
                proprietaireEntrepriseId={pg.proprietaireEntrepriseId}
                nonSystemBadgeRole={
                  pg.proprietaireEntrepriseId !== null
                    ? clientEntrepriseIdsForAllMode?.has(
                        pg.proprietaireEntrepriseId,
                      )
                      ? "client"
                      : "prestataire"
                    : undefined
                }
                hideCreateButton
                canManage={canManage}
                onPacksChanged={onPacksChanged}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const systemPacksForReadOnly = !isPlateformMode
    ? group.systemPacks.filter((p) => p.proprietaireEntrepriseId === null)
    : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{group.serviceNom}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Checklists système en lecture seule (client/prestataire uniquement) */}
        {systemPacksForReadOnly.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Système
            </p>
            <div className="space-y-1">
              {systemPacksForReadOnly.map((pack) => (
                <PackRow key={pack.id} pack={pack} showSystemBadge />
              ))}
            </div>
          </div>
        )}

        {/* Gestion des checklists — toujours affiché (droits ≠ filtre) */}
        {posture !== null && (
          <>
            {!isPlateformMode && (
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Mes checklists
              </p>
            )}
            <TacheListeManagerContent
              serviceId={group.serviceId}
              proprietaireEntrepriseId={proprietaireEntrepriseId}
              nonSystemBadgeRole={nonSystemBadgeRole}
              hideCreateButton
              canManage={canManage}
              onPacksChanged={onPacksChanged}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ========================== PACK ROW (lecture seule) ==========================

function PackRow({
  pack,
  showSystemBadge = false,
}: {
  pack: TacheListeTemplateWithServiceNom;
  showSystemBadge?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-md border ${!pack.actif ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        className="hover:bg-muted/40 flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronDown className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <ChevronRight className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
        )}

        <span className="flex-1 font-medium">{pack.nom}</span>

        {showSystemBadge && pack.proprietaireEntrepriseId === null && (
          <span className="flex-shrink-0 rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300">
            Système
          </span>
        )}

        {!pack.actif && (
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            Inactif
          </Badge>
        )}

        <span className="text-muted-foreground flex-shrink-0 text-xs">
          {pack.items.length} tâche{pack.items.length !== 1 ? "s" : ""}
        </span>
      </button>

      {expanded && pack.items.length > 0 && (
        <div className="bg-muted/20 divide-y border-t">
          {pack.items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start gap-2 px-4 py-1.5 text-xs"
            >
              <span className="text-muted-foreground w-4 flex-shrink-0 text-center">
                {idx + 1}.
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-medium">
                  {item.emoji && <span className="mr-1.5">{item.emoji}</span>}
                  {item.titre}
                </span>
                {item.description && (
                  <p className="text-muted-foreground mt-0.5 truncate">
                    {item.description}
                  </p>
                )}
              </div>
              {item.dureeEstimeeMinutes && (
                <span className="text-muted-foreground flex flex-shrink-0 items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {item.dureeEstimeeMinutes}min
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {expanded && pack.items.length === 0 && (
        <p className="text-muted-foreground border-t px-4 py-2 text-xs italic">
          Aucune tâche dans cette checklist.
        </p>
      )}
    </div>
  );
}
