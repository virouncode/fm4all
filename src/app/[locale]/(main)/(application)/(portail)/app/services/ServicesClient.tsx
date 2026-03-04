"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getServicesWithStatsAction } from "@/server/actions/servicesActions";
import type { ServiceWithStatsType } from "@/zod-schemas/service.schema";
import {
  Building2,
  ClipboardList,
  Pencil,
  Plus,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ServiceFormDialog } from "./ServiceFormDialog";

export function ServicesClient() {
  const [services, setServices] = useState<ServiceWithStatsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editService, setEditService] = useState<ServiceWithStatsType | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setIsError(false);
      try {
        const result = await getServicesWithStatsAction();
        if (result?.serverError) {
          toast.error(result.serverError.message);
          setIsError(true);
        } else if (result?.data) {
          setServices(result.data.services);
        }
      } catch {
        toast.error("Erreur lors du chargement des services");
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreated = (service: ServiceWithStatsType) => {
    setServices((prev) =>
      [...prev, service].sort((a, b) => a.nom.localeCompare(b.nom)),
    );
  };

  const handleUpdated = (updated: ServiceWithStatsType) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
    );
    setEditService(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {!loading && !isError && (
            <>
              {services.length} service{services.length !== 1 ? "s" : ""} au
              catalogue
            </>
          )}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouveau service
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-destructive flex items-center gap-2 py-8 text-center">
          <TriangleAlert className="h-5 w-5" />
          <span>Impossible de charger les services.</span>
        </div>
      ) : services.length === 0 ? (
        <div className="text-muted-foreground py-16 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>Aucun service dans le catalogue.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Créer le premier service
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => setEditService(service)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ServiceFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCreated}
      />

      {editService && (
        <ServiceFormDialog
          mode="edit"
          service={editService}
          open={!!editService}
          onOpenChange={(open) => {
            if (!open) setEditService(null);
          }}
          onSuccess={handleUpdated}
        />
      )}
    </div>
  );
}

function ServiceCard({
  service,
  onEdit,
}: {
  service: ServiceWithStatsType;
  onEdit: () => void;
}) {
  return (
    <Card className="group flex flex-col gap-0 py-0 transition-shadow hover:shadow-md">
      {/* Titre + bouton edit */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold leading-snug">{service.nom}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground -mr-1 -mt-0.5 h-6 w-6 shrink-0"
          onClick={onEdit}
          title="Modifier la description"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>

      {/* Description */}
      <p className="text-muted-foreground flex-1 px-4 text-xs leading-relaxed">
        {service.description ? (
          service.description
        ) : (
          <span className="italic opacity-50">Aucune description</span>
        )}
      </p>

      {/* Stats footer */}
      <div className="mt-3 flex items-center gap-4 border-t px-4 py-3">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Users className="text-primary h-3.5 w-3.5" />
          <span>
            <span className="text-foreground font-medium">
              {service.nbClients}
            </span>{" "}
            client{service.nbClients !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Building2 className="text-primary h-3.5 w-3.5" />
          <span>
            <span className="text-foreground font-medium">
              {service.nbPrestataires}
            </span>{" "}
            prestataire{service.nbPrestataires !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Card>
  );
}
