"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { getMesPrestatairesAction } from "@/server/actions/clientServiceExecutionsActions";
import type { PrestataireAvecDetails } from "@/server/queries/clientServiceExecutions.query";
import { useAppStore } from "@/stores/application/appStore";
import type {
  EntrepriseWithDetails,
  RoleEntrepriseType,
} from "@/zod-schemas/entreprise.schema";
import { Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EntrepriseCard } from "../entreprises/EntrepriseCard";
import { AjouterPrestataireDialog } from "./AjouterPrestataireDialog";

function toEntrepriseCard(p: PrestataireAvecDetails): EntrepriseWithDetails {
  return {
    id: p.id,
    nom: p.nom,
    siret: p.siret,
    numeroTva: p.numeroTva,
    adresseLigne1: p.adresseLigne1,
    adresseLigne2: p.adresseLigne2,
    codePostal: p.codePostal,
    ville: p.ville,
    formeJuridique: p.formeJuridique,
    sireneSyncedAt: p.sireneSyncedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    logoId: null,
    logoStorageKey: p.logoStorageKey,
    roles: p.roles as RoleEntrepriseType[],
    nbSites: 0,
    hasActiveAdmin: p.hasActiveAdmin,
    adminEmail: p.adminEmail,
    services: p.services,
    pendingInvitation: null,
    relationId: p.relationId,
  };
}

export function MesPrestatairesClient() {
  const router = useRouter();
  const entreprise = useAppStore((s) => s.entreprise);
  const posture = useAppStore((s) => s.postureActive);
  const roleClientAdhesion = useAppStore((s) => s.roleClientAdhesion);

  const canManage =
    roleClientAdhesion === "admin" || roleClientAdhesion === "manager";

  const [prestataires, setPrestataires] = useState<PrestataireAvecDetails[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const loadPrestataires = useCallback(async () => {
    if (!entreprise?.id || posture !== "client") return;

    setLoading(true);
    const result = await getMesPrestatairesAction({
      entrepriseId: entreprise.id,
    });
    setLoading(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      setPrestataires(result.data.prestataires);
    }
  }, [entreprise?.id, posture]);

  useEffect(() => {
    loadPrestataires();
  }, [loadPrestataires]);

  if (posture !== "client") {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        Cette page est réservée à la posture client.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4" />
            Ajouter un prestataire
          </Button>
        )}
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : prestataires.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Aucun prestataire enregistré.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {prestataires.map((p) => (
              <EntrepriseCard
                key={p.id}
                entreprise={toEntrepriseCard(p)}
                onClick={() =>
                  router.push({
                    pathname: "/app/mes-prestataires/[entrepriseId]",
                    params: { entrepriseId: p.id },
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialog d'ajout */}
      {entreprise?.id && (
        <AjouterPrestataireDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          clientEntrepriseId={entreprise.id}
          onSuccess={loadPrestataires}
        />
      )}

    </div>
  );
}
