"use client";

import { getMonEntrepriseDetailsAction } from "@/server/actions/entreprisesActions";
import { useAppStore } from "@/stores/application/appStore";
import { useCallback, useEffect, useState } from "react";
import { EntrepriseDetailsClient } from "../entreprises/[entrepriseId]/EntrepriseDetailsClient";
import type { EntrepriseWithDetails } from "@/zod-schemas/entreprise.schema";
import { getPresignedReadUrl } from "@/lib/s3/upload-helper";
import { Skeleton } from "@/components/ui/skeleton";

type ServiceItem = { serviceId: string; nom: string };

export function MonEntrepriseClient() {
  const entreprise = useAppStore((s) => s.entreprise);
  const roleClientAdhesion = useAppStore((s) => s.roleClientAdhesion);
  const rolePrestataireAdhesion = useAppStore((s) => s.rolePrestataireAdhesion);

  const [data, setData] = useState<{
    entreprise: EntrepriseWithDetails;
    services: ServiceItem[];
  } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!entreprise?.id) return;

    setLoading(true);
    setError(null);

    const result = await getMonEntrepriseDetailsAction({
      entrepriseId: entreprise.id,
    });

    if (result?.serverError) {
      setError(result.serverError.message ?? "Erreur lors du chargement.");
      setLoading(false);
      return;
    }

    if (!result?.data) {
      setError("Données introuvables.");
      setLoading(false);
      return;
    }

    setData({
      entreprise: result.data.entreprise,
      services: result.data.services,
    });

    const storageKey = result.data.entreprise.logoStorageKey;
    if (storageKey) {
      try {
        const url = await getPresignedReadUrl({
          key: storageKey,
          proprietaireEntrepriseId: entreprise.id,
        });
        setLogoUrl(url);
      } catch {
        setLogoUrl(null);
      }
    } else {
      setLogoUrl(null);
    }

    setLoading(false);
  }, [entreprise?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canEdit = roleClientAdhesion === "admin" || rolePrestataireAdhesion === "admin";

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <p className="text-muted-foreground text-sm italic">
          {error ?? "Impossible de charger les informations de votre entreprise."}
        </p>
      </div>
    );
  }

  return (
    <EntrepriseDetailsClient
      entreprise={data.entreprise}
      services={data.services}
      logoUrl={logoUrl}
      logoStorageKey={data.entreprise.logoStorageKey}
      canEdit={canEdit}
      showBackButton={false}
      onUpdate={loadData}
    />
  );
}
