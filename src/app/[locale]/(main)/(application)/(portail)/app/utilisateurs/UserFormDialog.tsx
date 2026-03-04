"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  adhesionStatutCT,
  roleClientAdhesionCT,
  rolePlateformeAdhesionCT,
} from "@/constants/codeTables";
import { getPresignedReadUrl } from "@/lib/s3/upload-helper";
import {
  insertPlateformeUserAction,
  insertUserAction,
  updateUserAction,
} from "@/server/actions/usersActions";
import { useAppStore } from "@/stores/application/appStore";
import {
  insertPlateformeUserFormSchema,
  insertUserFormSchema,
  updateUserFormSchema,
  type InsertPlateformeUserFormType,
  type InsertUserFormType,
  type UpdateUserFormType,
} from "@/zod-schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | null;
  parentId?: string | null;
  defaultValues?: Partial<InsertUserFormType | UpdateUserFormType>;
  onSuccess?: () => void;
};

export function UserFormDialog({
  open,
  onOpenChange,
  userId,
  parentId,
  defaultValues,
  onSuccess,
}: UserFormDialogProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const postureActive = useAppStore((state) => state.postureActive);
  const isEdit = !!userId;

  if (!entreprise?.id) {
    return null;
  }

  if (isEdit) {
    return (
      <EditUserForm
        open={open}
        onOpenChange={onOpenChange}
        userId={userId!}
        entrepriseId={entreprise.id}
        defaultValues={defaultValues as Partial<UpdateUserFormType>}
        onSuccess={onSuccess}
      />
    );
  }

  // Posture plateforme → formulaire de création utilisateur plateforme
  if (postureActive === "plateforme") {
    return (
      <CreatePlateformeUserForm
        open={open}
        onOpenChange={onOpenChange}
        entrepriseId={entreprise.id}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <CreateUserForm
      open={open}
      onOpenChange={onOpenChange}
      parentId={parentId}
      entrepriseId={entreprise.id}
      defaultValues={defaultValues as Partial<InsertUserFormType>}
      onSuccess={onSuccess}
    />
  );
}

// Create Form Component
function CreateUserForm({
  open,
  onOpenChange,
  parentId,
  entrepriseId,
  defaultValues,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
  entrepriseId: string;
  defaultValues?: Partial<InsertUserFormType>;
  onSuccess?: () => void;
}) {
  // Récupérer le rôle de l'utilisateur connecté
  const currentUserRole = useAppStore((state) => state.roleClientAdhesion);
  const currentUserPlateformeRole = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );

  // Filtrer les options de rôle selon le rôle actuel (même logique que EditUserForm)
  const availableRoles = roleClientAdhesionCT.filter((r) => {
    if (!currentUserRole && !currentUserPlateformeRole) return false;

    // Platform super admin: all roles
    if (currentUserPlateformeRole === "super_admin_plateforme") return true;

    // Admin: all roles
    if (currentUserRole === "admin") return true;

    // Manager: only collaborateur
    if (currentUserRole === "manager") return r.code === "collaborateur";

    return false; // Collaborateur ne peut pas créer
  });

  const form = useForm<InsertUserFormType>({
    resolver: zodResolver(insertUserFormSchema),
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
      phone: "",
      avatar: null,
      roleAdhesion: "collaborateur",
      parentId: parentId || undefined,
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const { isDirty, isSubmitting } = useFormState({ control: form.control });

  useEffect(() => {
    if (open) {
      form.reset({
        prenom: "",
        nom: "",
        email: "",
        phone: "",
        avatar: null,
        roleAdhesion: "collaborateur",
        parentId: parentId || undefined,
        ...defaultValues,
      });
    }
  }, [open, parentId, defaultValues, form]);

  const onSubmit = async (data: InsertUserFormType) => {
    const result = await insertUserAction({
      ...data,
      entrepriseId,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.validationErrors) {
      toast.error("Erreur de validation");
      return;
    }

    toast.success(result?.data?.message || "Utilisateur créé");
    onSuccess?.();
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Créer un utilisateur</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <RhfInput<InsertUserFormType>
                  label="Prénom"
                  name="prenom"
                  requiredMark
                />
                <RhfInput<InsertUserFormType>
                  label="Nom"
                  name="nom"
                  requiredMark
                />
              </div>

              <RhfInput<InsertUserFormType>
                label="Email"
                name="email"
                type="email"
                requiredMark
              />
              <RhfInput<InsertUserFormType>
                label="N° de téléphone"
                name="phone"
              />
              <RhfControlledSelect<InsertUserFormType>
                label="Rôle"
                name="roleAdhesion"
                requiredMark
                className="w-full"
                selectClassName="w-full"
              >
                {availableRoles.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.name}
                  </SelectItem>
                ))}
              </RhfControlledSelect>

              <RhfFileInput<InsertUserFormType>
                label="Avatar (format carré, max 2MB)"
                name="avatar"
                proprietaireEntrepriseId={entrepriseId}
                categorie="avatar"
                accept="image/*"
                squareMandatory
                maxSizeBytes={2 * 1024 * 1024}
              />
            </div>

            <DialogFooter className="bg-background flex shrink-0 justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Spinner />}Créer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Create Plateforme User Form Component
function CreatePlateformeUserForm({
  open,
  onOpenChange,
  entrepriseId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrepriseId: string;
  onSuccess?: () => void;
}) {
  const form = useForm<InsertPlateformeUserFormType>({
    resolver: zodResolver(insertPlateformeUserFormSchema),
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
      phone: "",
      avatar: null,
      rolePlateformeAdhesion: "operateur_plateforme",
    },
    mode: "onTouched",
  });

  const { isDirty, isSubmitting } = useFormState({ control: form.control });

  useEffect(() => {
    if (open) {
      form.reset({
        prenom: "",
        nom: "",
        email: "",
        phone: "",
        avatar: null,
        rolePlateformeAdhesion: "operateur_plateforme",
      });
    }
  }, [open, form]);

  const onSubmit = async (data: InsertPlateformeUserFormType) => {
    const result = await insertPlateformeUserAction({
      ...data,
      entrepriseId,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.validationErrors) {
      toast.error("Erreur de validation");
      return;
    }

    toast.success(result?.data?.message || "Utilisateur plateforme créé");
    onSuccess?.();
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Créer un utilisateur plateforme</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <RhfInput<InsertPlateformeUserFormType>
                  label="Prénom"
                  name="prenom"
                  requiredMark
                />
                <RhfInput<InsertPlateformeUserFormType>
                  label="Nom"
                  name="nom"
                  requiredMark
                />
              </div>

              <RhfInput<InsertPlateformeUserFormType>
                label="Email"
                name="email"
                type="email"
                requiredMark
              />
              <RhfInput<InsertPlateformeUserFormType>
                label="N° de téléphone"
                name="phone"
              />
              <RhfControlledSelect<InsertPlateformeUserFormType>
                label="Rôle plateforme"
                name="rolePlateformeAdhesion"
                requiredMark
                className="w-full"
                selectClassName="w-full"
              >
                {rolePlateformeAdhesionCT.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.name}
                  </SelectItem>
                ))}
              </RhfControlledSelect>

              <RhfFileInput<InsertPlateformeUserFormType>
                label="Avatar (format carré, max 2MB)"
                name="avatar"
                proprietaireEntrepriseId={entrepriseId}
                categorie="avatar"
                accept="image/*"
                squareMandatory
                maxSizeBytes={2 * 1024 * 1024}
              />
            </div>

            <DialogFooter className="bg-background flex shrink-0 justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Spinner />}Créer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Form Component
function EditUserForm({
  open,
  onOpenChange,
  userId,
  entrepriseId,
  defaultValues,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  entrepriseId: string;
  defaultValues?: Partial<UpdateUserFormType>;
  onSuccess?: () => void;
}) {
  // Récupérer l'utilisateur connecté
  const currentUser = useAppStore((state) => state.user);
  const currentUserRole = useAppStore((state) => state.roleClientAdhesion);
  const currentUserPlateformeRole = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );

  // Déterminer si on édite soi-même
  const isEditingSelf = currentUser?.id === userId;

  // Filtrer les options de rôle selon le rôle actuel
  const availableRoles = roleClientAdhesionCT.filter(() => {
    if (!currentUserRole && !currentUserPlateformeRole) return false;

    // Platform super admin: all roles
    if (currentUserPlateformeRole === "super_admin_plateforme") return true;

    // Admin: all roles
    if (currentUserRole === "admin") return true;

    return false; // Manager et Collaborateur ne peuvent pas modifier les rôles
  });

  // Peut modifier le rôle : uniquement super_admin_plateforme et admin
  const canEditRole =
    !isEditingSelf &&
    (currentUserPlateformeRole === "super_admin_plateforme" ||
      currentUserRole === "admin");

  // Peut modifier le statut : super_admin_plateforme, admin ET manager
  const canEditStatut =
    !isEditingSelf &&
    (currentUserPlateformeRole === "super_admin_plateforme" ||
      currentUserRole === "admin" ||
      currentUserRole === "manager");

  const form = useForm<UpdateUserFormType>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      id: userId,
      prenom: "",
      nom: "",
      email: "",
      phone: "",
      avatar: null,
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (open) {
      form.reset({
        id: userId,
        prenom: "",
        nom: "",
        email: "",
        phone: "",
        avatar: null,
        ...defaultValues,
      });
    }
  }, [open, userId, defaultValues, form]);

  // Force refresh quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [open]);

  // Load avatar preview with presigned URL
  useEffect(() => {
    const loadAvatarPreview = async () => {
      if (defaultValues?.avatar?.storageKey && entrepriseId) {
        try {
          const previewUrl = await getPresignedReadUrl({
            key: defaultValues.avatar.storageKey,
            proprietaireEntrepriseId: entrepriseId,
          });

          // Update form with previewUrl
          form.setValue(
            "avatar",
            {
              ...defaultValues.avatar,
              previewUrl,
            },
            { shouldDirty: false },
          );
        } catch {
          // avatar preview load failure is non-critical
        }
      }
    };

    if (open && defaultValues?.avatar) {
      loadAvatarPreview();
    }
  }, [open, defaultValues?.avatar, entrepriseId, form, refreshKey]);

  const onSubmit = async (data: UpdateUserFormType) => {
    const result = await updateUserAction({
      ...data,
      entrepriseId,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.validationErrors) {
      toast.error("Erreur de validation");
      return;
    }

    // ✅ Update store si on modifie son propre profil
    if (isEditingSelf && result?.data?.user) {
      useAppStore.getState().updateUser({
        id: result.data.user.id,
        prenom: result.data.user.prenom,
        nom: result.data.user.nom,
        email: result.data.user.email,
        avatarId: result.data.user.avatarId,
      });
    }

    // ✅ Toast différent selon si email changé ou non
    if (result?.data?.emailChanged) {
      toast.warning(
        "Utilisateur mis à jour. Un email de vérification a été envoyé au nouvel email. L'utilisateur devra vérifier son email avant de pouvoir se reconnecter.",
        {
          duration: 8000,
          description: "Le nouvel email devra être vérifié pour se connecter.",
        },
      );
    } else {
      toast.success(result?.data?.message || "Utilisateur mis à jour");
    }

    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <User className="text-primary" />
              Modifier un utilisateur
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              toast.error(
                `Erreur de validation: ${Object.keys(errors).join(", ")}`,
              );
            })}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <RhfInput<UpdateUserFormType>
                  label="Prénom"
                  name="prenom"
                  requiredMark
                />
                <RhfInput<UpdateUserFormType>
                  label="Nom"
                  name="nom"
                  requiredMark
                />
              </div>

              <RhfInput<UpdateUserFormType>
                label="Email"
                name="email"
                type="email"
                requiredMark
              />
              <RhfInput<UpdateUserFormType>
                label="N° de téléphone"
                name="phone"
              />

              {/* Champ rôle : uniquement admin et super_admin */}
              {canEditRole && (
                <RhfControlledSelect<UpdateUserFormType>
                  label="Rôle"
                  name="roleAdhesion"
                  className="w-full"
                  selectClassName="w-full"
                >
                  {availableRoles.map((r) => (
                    <SelectItem key={r.code} value={r.code}>
                      {r.name}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>
              )}

              {/* Champ statut : admin, super_admin ET manager */}
              {canEditStatut && (
                <RhfControlledSelect<UpdateUserFormType>
                  label="Statut"
                  name="statut"
                  className="w-full"
                  selectClassName="w-full"
                >
                  {adhesionStatutCT.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.name}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>
              )}

              <RhfFileInput<UpdateUserFormType>
                label="Avatar (format carré, max 2MB)"
                name="avatar"
                proprietaireEntrepriseId={entrepriseId}
                categorie="avatar"
                accept="image/*"
                squareMandatory
                maxSizeBytes={2 * 1024 * 1024}
                previewHeight={200}
              />
            </div>

            <DialogFooter className="bg-background flex shrink-0 justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Spinner />}Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
