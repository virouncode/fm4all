"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  toCodeTableName,
  typeBatimentCT,
  typeOccupationCT,
} from "@/constants/codeTables";
import { cn } from "@/lib/utils";
import type { SiteResponsable } from "@/server/queries/sites.query";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { RoleAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { RolePlateformeAdhesionType } from "@/zod-schemas/userPlateformeAdhesion.schema";
import {
  Building,
  Building2,
  Calendar,
  House,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RulerDimensionLine,
  TriangleAlert,
  User,
  UserCog,
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
  siteResponsables: SiteResponsable[];
  loadingResponsables: boolean;
};

export function SiteDetails({
  site,
  onEdit,
  onCreateChild,
  currentUserRole,
  currentUserPlateformeRole,
  responsableSiteIds,
  siteResponsables,
  loadingResponsables,
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

      {/* Details */}
      <div className="flex items-stretch gap-4">
        {/* Gauche : infos du site */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Adresse */}
          <div className="flex items-start gap-2">
            <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${site.adresseLigne1}${site.adresseLigne2 ? ` ${site.adresseLigne2}` : ""}, ${site.codePostal} ${site.ville}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary text-sm transition-colors"
            >
              <span>{site.adresseLigne1}</span>
              {site.adresseLigne2 && (
                <>
                  <br />
                  <span>{site.adresseLigne2}</span>
                </>
              )}
              <br />
              <span>
                {site.codePostal} {site.ville}
              </span>
            </a>
          </div>

          {/* Surface */}
          <div className="flex items-center gap-2">
            <RulerDimensionLine className="text-primary size-4 shrink-0" />
            <p className="text-sm">{site.surface} m²</p>
          </div>

          {/* Effectif */}
          <div className="flex items-center gap-2">
            <Users className="text-primary size-4 shrink-0" />
            <p className="text-sm">{site.effectif} personnes</p>
          </div>

          {/* Type de bâtiment */}
          <div className="flex items-center gap-2">
            <Building2 className="text-primary size-4 shrink-0" />
            <p className="text-sm">{t(typeBatiment)}</p>
          </div>

          {/* Type d'occupation */}
          <div className="flex items-center gap-2">
            <House className="text-primary size-4 shrink-0" />
            <p className="text-sm">{t(typeOccupation)}</p>
          </div>

          {/* Commentaires */}
          {site.commentaires && (
            <p className="text-muted-foreground border-t pt-3 text-sm whitespace-pre-wrap">
              {site.commentaires}
            </p>
          )}
        </div>

        {/* Droite : responsable(s) de site */}
        <div className="flex-1 space-y-3 border-l pl-4">
          <div className="flex items-center gap-2">
            <UserCog className="text-primary size-4 shrink-0" />
            <span className="text-sm font-medium">Responsable du site</span>
          </div>

          {loadingResponsables ? (
            <p className="text-muted-foreground text-sm">Chargement...</p>
          ) : siteResponsables.length === 0 ? (
            <div className="text-destructive flex items-start gap-2">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm">
                Aucun responsable assigné à ce site. Sans responsable, les
                tickets et interventions n&apos;ont pas de point de contact
                dédié. Assignez un responsable via la gestion des utilisateurs.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pl-6">
              {siteResponsables.map((resp) => (
                <div key={resp.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="text-primary size-4 shrink-0" />
                    <span className="text-sm font-medium">
                      {resp.prenom} {resp.nom}
                    </span>
                  </div>
                  {resp.phone && (
                    <a
                      href={`tel:${resp.phone}`}
                      className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                    >
                      <Phone className="text-primary size-4 shrink-0" />
                      <span>{resp.phone}</span>
                    </a>
                  )}
                  <a
                    href={`mailto:${resp.email}`}
                    className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                  >
                    <Mail className="text-primary size-4 shrink-0" />
                    <span>{resp.email}</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-muted-foreground space-y-1 border-t pt-4 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>Créé le {new Date(site.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>
            Modifié le {new Date(site.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
