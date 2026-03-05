"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adhesionStatutCodes, roleClientAdhesionCodes } from "@/constants/codeTables";
import { getUsersAction } from "@/server/actions/usersActions";
import { useAppStore } from "@/stores/application/appStore";
import { UserWithAdhesionType } from "@/zod-schemas/user.schema";
import { Filter, Plus, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { buildUserTree, getPathToRoot } from "./helpers";
import { UserDetails } from "./UserDetails";
import { UserFormDialog } from "./UserFormDialog";
import { UsersFiltersForm } from "./UsersFiltersForm";
import { UsersTree } from "./UsersTree";

export function UsersClient() {
  const entreprise = useAppStore((state) => state.entreprise);
  const currentUser = useAppStore((state) => state.user);
  const currentUserRole = useAppStore((state) => state.roleClientAdhesion);
  const currentUserPlateformeRole = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );
  const postureActive = useAppStore((state) => state.postureActive);
  const searchParams = useSearchParams();

  // Déterminer si l'utilisateur peut créer des utilisateurs RACINE
  // Manager ne peut PAS créer d'utilisateurs racine (uniquement dans sa branche)
  const canCreateRootUsers =
    currentUserPlateformeRole === "super_admin_plateforme" ||
    currentUserRole === "admin";

  const [users, setUsers] = useState<UserWithAdhesionType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [parentIdForCreate, setParentIdForCreate] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Extract search params for useEffect dependencies
  const searchFilter = searchParams.get("search") || undefined;
  const roleFilter = searchParams.get("roleAdhesion") || undefined;
  const statutFilter = searchParams.get("statutAdhesion") || undefined;

  // Check if any filters are active
  const hasActiveFilters = !!(
    searchFilter ||
    (roleFilter && roleFilter !== "all") ||
    (statutFilter && statutFilter !== "all")
  );

  // Build tree from users
  const tree = useMemo(() => {
    return buildUserTree(users);
  }, [users]);

  // Load users function with server-side filtering
  const loadUsers = async () => {
    if (!entreprise?.id) return;

    setLoading(true);
    try {
      // Build query params manually with proper typing
      const queryParams = {
        entrepriseId: entreprise.id,
        posture: (postureActive ?? "client") as "client" | "prestataire" | "plateforme",
        search: searchFilter,
        roleAdhesion:
          roleFilter && roleFilter !== "all"
            ? (roleFilter as (typeof roleClientAdhesionCodes)[number])
            : undefined,
        statutAdhesion:
          statutFilter && statutFilter !== "all"
            ? (statutFilter as (typeof adhesionStatutCodes)[number])
            : undefined,
        orderBy: "nom" as const,
        orderDir: "asc" as const,
        page: 1,
        pageSize: 1000, // Load all users for tree building
      };

      const result = await getUsersAction(queryParams);
      if (result?.data?.items) {
        const items = result.data.items;
        setUsers(items);

        // Sélection par défaut : soi-même si présent, sinon premier utilisateur
        // Si l'utilisateur sélectionné est encore dans les résultats → le conserver
        setSelectedUserId((prev) => {
          if (prev && items.some((u) => u.id === prev)) return prev;
          if (currentUser?.id && items.some((u) => u.id === currentUser.id)) {
            return currentUser.id;
          }
          return items.length > 0 ? items[0].id : null;
        });
      }
    } catch {
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount and when filters/posture change
  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entreprise?.id, postureActive, searchFilter, roleFilter, statutFilter]);

  // Déplier les ancêtres quand un utilisateur est sélectionné (par défaut ou par clic)
  useEffect(() => {
    if (!selectedUserId) return;
    const path = getPathToRoot(tree, selectedUserId);
    if (path.length <= 1) return; // Racine, rien à déplier
    const ancestorIds = path.slice(0, -1).map((n) => n.id);
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      ancestorIds.forEach((id) => next.add(id));
      return next;
    });
  }, [selectedUserId, tree]);

  // Handlers
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCreateRoot = () => {
    setParentIdForCreate(null);
    setFormMode("create");
    setFormDialogOpen(true);
  };

  const handleCreateChild = (parentId: string) => {
    setParentIdForCreate(parentId);
    setFormMode("create");
    setFormDialogOpen(true);
  };

  const handleEdit = () => {
    setFormMode("edit");
    setFormDialogOpen(true);
  };

  const handleFormSuccess = async () => {
    // Reload all users to get fresh data with adhesions
    await loadUsers();
    setParentIdForCreate(null);
  };

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const selectedUser = users.find((u) => u.id === selectedUserId) || null;

  return (
    <div className="space-y-6">
      {/* Tree Section */}
      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-primary h-6" />
            <h2 className="text-xl font-semibold">
              Organisation des utilisateurs
            </h2>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setFilterDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              <Filter className="h-4 w-4" />
              Filtrer
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 text-xs">
                  {
                    [
                      searchFilter,
                      roleFilter && roleFilter !== "all",
                      statutFilter && statutFilter !== "all",
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </Button>
            {canCreateRootUsers && (
              <Button onClick={handleCreateRoot} size="sm">
                <Plus className="h-4 w-4" />
                Utilisateur racine
              </Button>
            )}
          </div>
        </div>
        {loading ? (
          <div>Chargement...</div>
        ) : (
          <UsersTree
            tree={tree}
            selectedUserId={selectedUserId}
            onSelectUser={handleUserSelect}
            onCreateChild={handleCreateChild}
            hasActiveFilters={hasActiveFilters}
            expandedNodes={expandedNodes}
            onToggleExpand={handleToggleExpand}
            currentUserId={currentUser?.id}
            currentUserRole={currentUserRole}
            currentUserPlateformeRole={currentUserPlateformeRole}
            postureActive={postureActive}
          />
        )}
      </div>

      {/* Details Section */}
      {selectedUser && (
        <div className="rounded-lg border p-6">
          <UserDetails
            user={selectedUser}
            currentUserRole={currentUserRole}
            onEdit={handleEdit}
            onCreateChild={() => handleCreateChild(selectedUser.id)}
          />
        </div>
      )}

      {!selectedUser && (
        <div className="text-muted-foreground rounded-lg border p-12 text-center">
          Sélectionnez un utilisateur dans l&apos;arborescence pour voir ses
          détails
        </div>
      )}

      {/* Form Dialog */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        userId={formMode === "edit" ? selectedUserId : null}
        parentId={parentIdForCreate}
        defaultValues={
          formMode === "edit" && selectedUser
            ? {
                id: selectedUser.id,
                prenom: selectedUser.prenom,
                nom: selectedUser.nom,
                email: selectedUser.email,
                phone: selectedUser.phone || undefined,
                avatar: selectedUser.avatar
                  ? {
                      storageKey: selectedUser.avatar.storageKey,
                      filename: selectedUser.avatar.filename,
                      mimeType: selectedUser.avatar.mimeType,
                      sizeBytes: selectedUser.avatar.sizeBytes,
                      // previewUrl sera généré dans le dialog
                    }
                  : null,
                roleAdhesion: selectedUser.adhesion?.role,
                statut: selectedUser.adhesion?.statut,
              }
            : undefined
        }
        onSuccess={handleFormSuccess}
      />

      {/* Filters Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="!w-2/3 !max-w-none">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Filter className="text-primary size-6" />
                <h3 className="text-xl font-semibold">
                  Filtrer les utilisateurs
                </h3>
              </div>
            </DialogTitle>
          </DialogHeader>
          <UsersFiltersForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
