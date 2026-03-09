"use client";

import { Button } from "@/components/ui/button";
import { getMesPrestatairesAction } from "@/server/actions/clientServiceExecutionsActions";
import type { PrestataireAvecDetails } from "@/server/queries/clientServiceExecutions.query";
import { useAppStore } from "@/stores/application/appStore";
import type {
  EntrepriseWithDetails,
  RoleEntrepriseType,
} from "@/zod-schemas/entreprise.schema";
import { Info, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EntrepriseCard } from "../entreprises/EntrepriseCard";
import { AjouterPrestataireDialog } from "./AjouterPrestataireDialog";
import { InviterPrestataireDialog } from "./InviterPrestataireDialog";

function toEntrepriseCard(p: PrestataireAvecDetails): EntrepriseWithDetails {
  return {
    id: p.id,
    nom: p.nom,
    siret: p.siret,
    numeroTva: p.numeroTva,
    prenomContact: p.prenomContact,
    nomContact: p.nomContact,
    emailContact: p.emailContact,
    phoneContact: p.phoneContact,
    createdAt: p.createdAt,
    logoId: null,
    logoStorageKey: p.logoStorageKey,
    roles: p.roles as RoleEntrepriseType[],
    nbSites: 0,
    hasActiveAdmin: p.hasActiveAdmin,
    services: p.services,
    pendingInvitation: null,
  };
}

export function MesPrestatairesClient() {
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
  const [inviteTarget, setInviteTarget] =
    useState<PrestataireAvecDetails | null>(null);

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

      {/* Disclaimer lecture seule */}
      <div className="text-muted-foreground flex items-start gap-2 rounded-md border px-3 py-2 text-xs">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Les informations de vos prestataires sont consultables mais non
          modifiables depuis votre espace. Pour mettre à jour leurs données,
          invitez-les à créer leur compte ou{" "}
          <a
            href="mailto:contact@fm4all.com"
            className="underline underline-offset-2"
          >
            contactez FM4ALL
          </a>
          .
        </span>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : prestataires.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">Aucun prestataire enregistré.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="auto-rows-fr grid grid-cols-1 items-stretch gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {prestataires.map((p) => (
              <EntrepriseCard
                key={p.id}
                entreprise={toEntrepriseCard(p)}
                onInvite={
                  canManage && !p.hasActiveAdmin
                    ? () => setInviteTarget(p)
                    : undefined
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

      {/* Dialog d'invitation */}
      {entreprise?.id && inviteTarget && (
        <InviterPrestataireDialog
          open={!!inviteTarget}
          onOpenChange={(v) => {
            if (!v) setInviteTarget(null);
          }}
          clientEntrepriseId={entreprise.id}
          prestataireEntrepriseId={inviteTarget.id}
          prestataireNom={inviteTarget.nom}
          defaultEmail={inviteTarget.emailContact}
          onSuccess={() => {
            setPrestataires((prev) =>
              prev.map((p) =>
                p.id === inviteTarget.id ? { ...p, hasActiveAdmin: true } : p,
              ),
            );
            setInviteTarget(null);
          }}
        />
      )}
    </div>
  );
}
