"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  toCodeTableName,
  typeBatimentCT,
  typeOccupationCT,
} from "@/constants/codeTables";
import { cn } from "@/lib/utils";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { RoleAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { RolePlateformeAdhesionType } from "@/zod-schemas/userPlateformeAdhesion.schema";
import {
  Building,
  Building2,
  House,
  MapPin,
  Pencil,
  Plus,
  RulerDimensionLine,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

type SiteDetailsProps = {
  site: SelectSiteType;
  onEdit: () => void;
  onCreateChild: () => void;
  currentUserRole: RoleAdhesionType | null;
  currentUserPlateformeRole: RolePlateformeAdhesionType | null;
  responsableSiteIds: Set<string>;
};

export function SiteDetails({
  site,
  onEdit,
  onCreateChild,
  currentUserRole,
  currentUserPlateformeRole,
  responsableSiteIds,
}: SiteDetailsProps) {
  const t = useTranslations("DevisPage.locaux.locauxForm");
  const typeBatiment =
    toCodeTableName(site.typeBatiment, typeBatimentCT) || site.typeBatiment;
  const typeOccupation =
    toCodeTableName(site.typeOccupation, typeOccupationCT) ||
    site.typeOccupation;

  // Permissions
  const isAdmin =
    currentUserPlateformeRole === "super_admin_plateforme" ||
    currentUserRole === "admin";
  const isResponsable = responsableSiteIds.has(site.id);

  // Admin peut tout faire
  // Non-admin doit être responsable du site
  const canEdit = isAdmin || isResponsable;
  const canCreateChild = isAdmin || isResponsable;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building className="text-primary h-6 w-6" />
            <h2 className="text-xl font-bold">{site.nom}</h2>
            <Badge
              variant="outline"
              className={cn(
                "border-0 text-xs",
                site.actif
                  ? "bg-green-500/10 text-green-600 dark:text-green-500"
                  : "bg-red-500/10 text-red-600 dark:text-red-500",
              )}
            >
              {site.actif ? "Actif" : "Inactif"}
            </Badge>
          </div>

          <p className="text-muted-foreground mt-1 text-sm">
            {site.ville} ({site.codePostal})
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
          )}
          {canCreateChild && (
            <Button variant="outline" size="sm" onClick={onCreateChild}>
              <Plus className="h-4 w-4" />
              Sous-site
            </Button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Adresse */}
        <div className="col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="text-primary size-4" />
            <h3 className="text-muted-foreground text-sm font-semibold">
              Adresse
            </h3>
          </div>

          <div className="space-y-1">
            <p>{site.adresseLigne1}</p>
            {site.adresseLigne2 && <p>{site.adresseLigne2}</p>}
            <p>
              {site.codePostal} {site.ville}
            </p>
          </div>
        </div>

        {/* Surface */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <RulerDimensionLine className="text-primary size-4" />
            <h3 className="text-muted-foreground text-sm font-semibold">
              Surface
            </h3>
          </div>
          <p>{site.surface} m²</p>
        </div>

        {/* Effectif */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Users className="text-primary size-4" />
            <h3 className="text-muted-foreground text-sm font-semibold">
              Effectif
            </h3>
          </div>
          <p>{site.effectif} personnes</p>
        </div>

        {/* Type de bâtiment */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Building2 className="text-primary size-4" />
            <h3 className="text-muted-foreground text-sm font-semibold">
              Type de bâtiment
            </h3>
          </div>
          <p>{t(typeBatiment)}</p>
        </div>

        {/* Type d'occupation */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <House className="text-primary size-4" />
            <h3 className="text-muted-foreground text-sm font-semibold">
              Type d&apos;occupation
            </h3>
          </div>
          <p>{t(typeOccupation)}</p>
        </div>

        {/* Commentaires */}
        {site.commentaires && (
          <div className="col-span-2">
            <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
              Commentaires
            </h3>
            <p className="whitespace-pre-wrap">{site.commentaires}</p>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="text-muted-foreground space-y-1 border-t pt-4 text-xs">
        <p>Créé le {new Date(site.createdAt).toLocaleDateString()}</p>
        <p>Modifié le {new Date(site.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
