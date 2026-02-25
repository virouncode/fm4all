"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adhesionStatutCT, roleAdhesionCT } from "@/constants/codeTables";
import { getPresignedReadUrl } from "@/lib/s3/upload-helper";
import { cn } from "@/lib/utils";
import { getUserSiteAttributionsAction } from "@/server/actions/userSiteAttributionsActions";
import { useAppStore } from "@/stores/application/appStore";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { UserWithAdhesionType } from "@/zod-schemas/user.schema";
import { RoleAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { SelectUserSiteAttributionWithInheritanceType } from "@/zod-schemas/userSiteAttribution.schema";
import {
  Calendar,
  Mail,
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
  currentUserRole: RoleAdhesionType | null;
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
  const roleHierarchy: Record<RoleAdhesionType, number> = {
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
        .catch((err) => {
          console.error("Failed to load avatar:", err);
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
        const result = await getUserSiteAttributionsAction({
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
      } catch (error) {
        console.error("Failed to load attributions:", error);
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
      const result = await getUserSiteAttributionsAction({
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
    } catch (error) {
      console.error("Failed to refresh attributions:", error);
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

            <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
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
            <Button variant="outline" size="sm" onClick={onCreateChild}>
              <Plus className="h-4 w-4" />
              Subordonné
            </Button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Mail className="text-primary size-4" />
            <h3 className="text-muted-foreground text-sm font-semibold">
              Email
            </h3>
          </div>
          <p>{user.email}</p>
        </div>

        {/* Phone */}
        {user.phone && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Phone className="text-primary size-4" />
              <h3 className="text-muted-foreground text-sm font-semibold">
                N° de téléphone
              </h3>
            </div>
            <p>{user.phone}</p>
          </div>
        )}

        {/* Rôle */}
        {user.adhesion && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Shield className="text-primary size-4" />
              <h3 className="text-muted-foreground text-sm font-semibold">
                Rôle
              </h3>
            </div>
            <p>
              {roleAdhesionCT.find((r) => r.code === user.adhesion?.role)
                ?.name || user.adhesion.role}
            </p>
          </div>
        )}

        {/* Statut */}
        {user.adhesion && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <UserIcon className="text-primary size-4" />
              <h3 className="text-muted-foreground text-sm font-semibold">
                Statut
              </h3>
            </div>
            <p>
              {adhesionStatutCT.find((s) => s.code === user.adhesion?.statut)
                ?.name || user.adhesion.statut}
            </p>
          </div>
        )}
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

      {/* Site Attributions */}
      {entreprise?.id && (
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
