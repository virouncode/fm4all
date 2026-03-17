"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { getMesClientsAction } from "@/server/actions/clientServiceExecutionsActions";
import type { ClientAvecDetails } from "@/server/queries/clientServiceExecutions.query";
import { useAppStore } from "@/stores/application/appStore";
import type {
  EntrepriseWithDetails,
  RoleEntrepriseType,
} from "@/zod-schemas/entreprise.schema";
import { Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EntrepriseCard } from "../entreprises/EntrepriseCard";
import { AjouterClientDialog } from "./AjouterClientDialog";

function toEntrepriseCard(c: ClientAvecDetails): EntrepriseWithDetails {
  return {
    id: c.id,
    nom: c.nom,
    siret: c.siret,
    numeroTva: c.numeroTva,
    adresseLigne1: c.adresseLigne1,
    adresseLigne2: c.adresseLigne2,
    codePostal: c.codePostal,
    ville: c.ville,
    formeJuridique: c.formeJuridique,
    sireneSyncedAt: c.sireneSyncedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    logoId: null,
    logoStorageKey: c.logoStorageKey,
    roles: c.roles as RoleEntrepriseType[],
    nbSites: c.nbSites,
    hasActiveAdmin: c.hasActiveAdmin,
    adminEmail: c.adminEmail,
    services: c.services,
    pendingInvitation: null,
    relationId: c.relationId,
  };
}

export function MesClientsClient() {
  const router = useRouter();
  const entreprise = useAppStore((s) => s.entreprise);
  const posture = useAppStore((s) => s.postureActive);
  const rolePrestataireAdhesion = useAppStore((s) => s.rolePrestataireAdhesion);

  const canManage =
    rolePrestataireAdhesion === "admin" || rolePrestataireAdhesion === "manager";

  const [clients, setClients] = useState<ClientAvecDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const loadClients = useCallback(async () => {
    if (!entreprise?.id || posture !== "prestataire") return;

    setLoading(true);
    const result = await getMesClientsAction({ entrepriseId: entreprise.id });
    setLoading(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      setClients(result.data.clients);
    }
  }, [entreprise?.id, posture]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  if (posture !== "prestataire") {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        Cette page est réservée à la posture prestataire.
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
            Ajouter un client
          </Button>
        )}
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Aucun client enregistré.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="auto-rows-fr grid grid-cols-1 items-stretch gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => (
              <EntrepriseCard
                key={c.id}
                entreprise={toEntrepriseCard(c)}
                onClick={() =>
                  router.push({
                    pathname: "/app/mes-clients/[entrepriseId]",
                    params: { entrepriseId: c.id },
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialog d'ajout */}
      {entreprise?.id && (
        <AjouterClientDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          prestataireEntrepriseId={entreprise.id}
          onSuccess={() => {
            setShowDialog(false);
            loadClients();
          }}
        />
      )}
    </div>
  );
}
