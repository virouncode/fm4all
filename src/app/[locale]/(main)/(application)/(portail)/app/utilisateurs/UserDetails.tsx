"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleClientAdhesionCT, rolePlateformeAdhesionCT } from "@/constants/codeTables";
import { getPresignedReadUrl } from "@/lib/s3/upload-helper";
import { cn } from "@/lib/utils";
import { getUserClientSiteAttributionsAction } from "@/server/actions/userSiteAttributionsActions";
import { useAppStore } from "@/stores/application/appStore";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { UserWithAdhesionType } from "@/zod-schemas/user.schema";
import { RoleClientAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { SelectUserSiteAttributionWithInheritanceType } from "@/zod-schemas/userSiteAttribution.schema";
import {
  Calendar,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { UserSiteAttributionDialog } from "./UserSiteAttributionDialog";
import { UserSiteAttributionsList } from "./UserSiteAttributionsList";

type UserDetailsProps = {
  user: UserWithAdhesionType;
  currentUserRole: RoleClientAdhesionType | null;
  onEdit: () => void;
  onCreateChild: () => void;
};

export function UserDetails({
  user,
  currentUserRole,
  onEdit,
  onCreateChild,
}: UserDetailsProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const currentUser = useAppStore((state) => state.user);
  const currentUserPlateformeRole = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );
  const postureActive = useAppStore((state) => state.postureActive);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Site attributions state
  const [attributions, setAttributions] = useState<
    SelectUserSiteAttributionWithInheritanceType[]
  >([]);
  const [allSites, setAllSites] = useState<SelectSiteType[]>([]); // Tous les sites pour construire l'arbre
  const [dialogOpen, setDialogOpen] = useState(false);

  // Déterminer si on regarde son propre profil
  const isViewingSelf = currentUser?.id === user.id;

  // Hiérarchie des rôles
  const roleHierarchy: Record<RoleClientAdhesionType, number> = {
    admin: 3,
    manager: 2,
    collaborateur: 1,
  };

  // Platform role is highest (level 4) - check separately
  const currentUserLevel =
    currentUserPlateformeRole === "super_admin_plateforme"
      ? 4
      : currentUserRole
        ? roleHierarchy[currentUserRole]
        : 0;

  const selectedUserLevel = user.adhesion?.role
    ? roleHierarchy[user.adhesion.role]
    : 0;

  // Permissions
  // Peut éditer le profil: soi-même OU niveau supérieur (pas même niveau)
  const canEdit =
    isViewingSelf ||
    (currentUserLevel > selectedUserLevel && currentUserLevel > 1);

  // Peut gérer les attributions de sites:
  // - Platform super admin/Admin: toujours (même sur soi-même)
  // - Manager/Collaborateur: UNIQUEMENT sur les subordonnés (PAS sur soi-même)
  const canManageSiteAttributions =
    currentUserPlateformeRole === "super_admin_plateforme" ||
    currentUserRole === "admin" ||
    (!isViewingSelf &&
      currentUserLevel > selectedUserLevel &&
      currentUserLevel > 1);

  // Peut créer un subordonné:
  // - super_admin_plateforme: toujours
  // - admin: toujours
  // - manager: sous lui-même OU sous un collaborateur (pas sous un autre manager)
  // - collaborateur: jamais
  const canCreateChild =
    currentUserPlateformeRole === "super_admin_plateforme" ||
    currentUserRole === "admin" ||
    (currentUserRole === "manager" &&
      (isViewingSelf || user.adhesion?.role === "collaborateur"));

  // Force refresh quand l'utilisateur change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [user.id]);

  useEffect(() => {
    if (user.avatar?.storageKey && entreprise?.id) {
      getPresignedReadUrl({
        key: user.avatar.storageKey,
        proprietaireEntrepriseId: entreprise.id,
      })
        .then(setAvatarUrl)
        .catch(() => {
          setAvatarUrl(null);
        });
    } else {
      setAvatarUrl(null);
    }
  }, [user.avatar?.storageKey, entreprise?.id, refreshKey]);

  // Fetch attributions on user change
  useEffect(() => {
    if (!entreprise?.id) return;

    const fetchAttributions = async () => {
      try {
        const result = await getUserClientSiteAttributionsAction({
          userId: user.id,
          entrepriseId: entreprise.id,
        });
        if (result?.data?.attributions) {
          setAttributions(result.data.attributions);
          setAllSites(result.data.allSites || []);
        } else {
          setAttributions([]);
          setAllSites([]);
        }
      } catch {
        setAttributions([]);
        setAllSites([]);
      }
    };

    fetchAttributions();
  }, [user.id, entreprise?.id]);

  // Refresh callback
  const handleAttributionChange = async () => {
    if (!entreprise?.id) return;

    try {
      const result = await getUserClientSiteAttributionsAction({
        userId: user.id,
        entrepriseId: entreprise.id,
      });

      if (result?.data?.attributions) {
        setAttributions(result.data.attributions);
        setAllSites(result.data.allSites || []);
      } else {
        setAttributions([]);
        setAllSites([]);
      }
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="border-border h-16 w-16 border-2">
            <AvatarImage
              src={avatarUrl || undefined}
              alt={`${user.prenom} ${user.nom}`}
            />
            <AvatarFallback>
              <UserIcon className="text-muted-foreground h-8 w-8" />
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">
                {user.prenom} {user.nom}
              </h2>
              {user.adhesion?.statut && (
                <Badge
                  variant="outline"
                  className={cn(
                    "border-0 text-xs",
                    user.adhesion.statut === "actif" &&
                      "bg-green-500/10 text-green-600 dark:text-green-500",
                    user.adhesion.statut === "suspendu" &&
                      "bg-red-500/10 text-red-600 dark:text-red-500",
                    user.adhesion.statut === "en_attente" &&
                      "bg-orange-500/10 text-orange-600 dark:text-orange-500",
                  )}
                >
                  {user.adhesion.statut === "actif"
                    ? "Actif"
                    : user.adhesion.statut === "suspendu"
                      ? "Suspendu"
                      : user.adhesion.statut === "en_attente"
                        ? "En attente"
                        : "Refusé"}
                </Badge>
              )}
            </div>

            {postureActive !== "plateforme" && (
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>
                  {attributions.length === 0
                    ? "Aucun site attribué"
                    : attributions.length === 1
                      ? "1 site attribué"
                      : `${attributions.length} sites attribués`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
          )}
          {canCreateChild && (
            <Button size="sm" onClick={onCreateChild}>
              <Plus className="h-4 w-4" />
              Subordonné
            </Button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-3">
        {/* Email */}
        <div className="flex items-center gap-2">
          <Mail className="text-primary size-4 shrink-0" />
          <a
            href={`mailto:${user.email}`}
            className="hover:text-primary text-sm transition-colors"
          >
            {user.email}
          </a>
        </div>

        {/* Phone */}
        {user.phone && (
          <div className="flex items-center gap-2">
            <Phone className="text-primary size-4 shrink-0" />
            <a
              href={`tel:${user.phone}`}
              className="hover:text-primary text-sm transition-colors"
            >
              {user.phone}
            </a>
          </div>
        )}

        {/* Rôle */}
        {postureActive === "plateforme" && user.plateformeAdhesion ? (
          <div className="flex items-center gap-2">
            <Shield className="text-primary size-4 shrink-0" />
            <p className="text-sm">
              {rolePlateformeAdhesionCT.find(
                (r) => r.code === user.plateformeAdhesion?.role,
              )?.name || user.plateformeAdhesion.role}
            </p>
          </div>
        ) : user.adhesion ? (
          <div className="flex items-center gap-2">
            <Shield className="text-primary size-4 shrink-0" />
            <p className="text-sm">
              {roleClientAdhesionCT.find((r) => r.code === user.adhesion?.role)
                ?.name || user.adhesion.role}
            </p>
          </div>
        ) : null}
      </div>

      {/* Metadata */}
      <div className="text-muted-foreground space-y-1 border-t pt-4 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>Créé le {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>
            Modifié le {new Date(user.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Site Attributions — masqué en posture plateforme */}
      {entreprise?.id && postureActive !== "plateforme" && (
        <>
          <UserSiteAttributionsList
            attributions={attributions}
            allSites={allSites}
            userId={user.id}
            canEdit={canManageSiteAttributions}
            onAttributionDeleted={handleAttributionChange}
            onAddClick={() => setDialogOpen(true)}
          />

          <UserSiteAttributionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            userId={user.id}
            entrepriseId={entreprise.id}
            onSuccess={handleAttributionChange}
          />
        </>
      )}
    </div>
  );
}
