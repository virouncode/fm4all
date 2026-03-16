"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  adhesionStatutCT,
  roleClientAdhesionCT,
  rolePlateformeAdhesionCT,
  rolePrestataireAdhesionCT,
} from "@/constants/codeTables";
import { getPresignedReadUrl } from "@/lib/s3/upload-helper";
import {
  addAdhesionToExistingUserAction,
  getUsersEligibleForAdhesionAction,
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
import { User, UserPlus } from "lucide-react";
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
  /** Posture cible — utilisé par la plateforme pour créer des users client/prestataire */
  targetPosture?: "client" | "prestataire" | "plateforme";
  /** ID de l'entreprise cible — utilisé par la plateforme au lieu de l'entreprise du store */
  targetEntrepriseId?: string;
};

export function UserFormDialog({
  open,
  onOpenChange,
  userId,
  parentId,
  defaultValues,
  onSuccess,
  targetPosture,
  targetEntrepriseId,
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

  // Posture plateforme avec type client/prestataire sélectionné
  // → utiliser l'entreprise cible et la posture cible (pas "plateforme")
  if (
    postureActive === "plateforme" &&
    (targetPosture === "client" || targetPosture === "prestataire") &&
    targetEntrepriseId
  ) {
    return (
      <CreateOrLinkUserForm
        open={open}
        onOpenChange={onOpenChange}
        parentId={parentId}
        entrepriseId={targetEntrepriseId}
        posture={targetPosture}
        onSuccess={onSuccess}
      />
    );
  }

  // Posture plateforme vue "plateforme" → formulaire utilisateur plateforme
  if (postureActive === "plateforme") {
    return (
      <CreateOrLinkUserForm
        open={open}
        onOpenChange={onOpenChange}
        parentId={parentId}
        entrepriseId={entreprise.id}
        posture="plateforme"
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <CreateOrLinkUserForm
      open={open}
      onOpenChange={onOpenChange}
      parentId={parentId}
      entrepriseId={entreprise.id}
      posture={postureActive === "prestataire" ? "prestataire" : "client"}
      defaultValues={defaultValues as Partial<InsertUserFormType>}
      onSuccess={onSuccess}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Wrapper: choisit entre "Nouvel utilisateur" et "Rattacher existant"
// ──────────────────────────────────────────────────────────────────────────────
function CreateOrLinkUserForm({
  open,
  onOpenChange,
  parentId,
  entrepriseId,
  posture,
  defaultValues,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
  entrepriseId: string;
  posture: "client" | "prestataire" | "plateforme";
  defaultValues?: Partial<InsertUserFormType>;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<"nouveau" | "existant">("nouveau");

  // Reset mode on open
  useEffect(() => {
    if (open) setMode("nouveau");
  }, [open]);

  const title =
    posture === "plateforme"
      ? "Créer un utilisateur plateforme"
      : "Créer un utilisateur";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <UserPlus className="text-primary" />
                {title}
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <DialogStyledBody className="px-5 py-4">
          {/* Toggle mode */}
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={mode}
            onValueChange={(v) => v && setMode(v as "nouveau" | "existant")}
            className="self-start"
          >
            <ToggleGroupItem
              value="nouveau"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 text-xs"
            >
              Nouvel utilisateur
            </ToggleGroupItem>
            <ToggleGroupItem
              value="existant"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 text-xs"
            >
              Rattacher existant
            </ToggleGroupItem>
          </ToggleGroup>
        </DialogStyledBody>

        {mode === "existant" ? (
          <LinkExistingUserForm
            entrepriseId={entrepriseId}
            posture={posture}
            onSuccess={onSuccess}
            onOpenChange={onOpenChange}
          />
        ) : posture === "plateforme" ? (
          <CreatePlateformeUserFormInner
            entrepriseId={entrepriseId}
            onSuccess={onSuccess}
            onOpenChange={onOpenChange}
          />
        ) : (
          <CreateUserFormInner
            parentId={parentId}
            entrepriseId={entrepriseId}
            posture={posture}
            defaultValues={defaultValues}
            onSuccess={onSuccess}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogStyledContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Rattacher un utilisateur existant
// ──────────────────────────────────────────────────────────────────────────────
function LinkExistingUserForm({
  entrepriseId,
  posture,
  onSuccess,
  onOpenChange,
}: {
  entrepriseId: string;
  posture: "client" | "prestataire" | "plateforme";
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [eligibleUsers, setEligibleUsers] = useState<
    { id: string; prenom: string; nom: string; email: string }[]
  >([]);
  const [totalUsersInEntreprise, setTotalUsersInEntreprise] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Rôles disponibles selon la posture
  const availableRoles =
    posture === "plateforme"
      ? rolePlateformeAdhesionCT
      : posture === "prestataire"
        ? rolePrestataireAdhesionCT
        : roleClientAdhesionCT;

  useEffect(() => {
    async function load() {
      setLoadingUsers(true);
      const result = await getUsersEligibleForAdhesionAction({
        entrepriseId,
        posture,
      });
      if (result?.data) {
        setEligibleUsers(result.data.users);
        setTotalUsersInEntreprise(result.data.totalUsersInEntreprise);
      }
      setLoadingUsers(false);
    }
    load();
  }, [entrepriseId, posture]);

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error("Sélectionnez un utilisateur et un rôle.");
      return;
    }

    setSubmitting(true);
    const result = await addAdhesionToExistingUserAction({
      targetUserId: selectedUserId,
      entrepriseId,
      posture,
      role: selectedRole as never,
    });
    setSubmitting(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success(result?.data?.message || "Adhésion ajoutée");
    onSuccess?.();
    onOpenChange(false);
  };

  if (loadingUsers) {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <Spinner />
        <span className="text-muted-foreground ml-2 text-sm">
          Chargement des utilisateurs...
        </span>
      </div>
    );
  }

  if (eligibleUsers.length === 0) {
    const emptyMessage =
      totalUsersInEntreprise === 0 ? (
        <>
          Cette entreprise n&apos;a pas encore d&apos;utilisateur.
          <br />
          Créez d&apos;abord un utilisateur via l&apos;onglet
          &laquo;&nbsp;Nouvel utilisateur&nbsp;&raquo;.
        </>
      ) : (
        <>
          Aucun utilisateur existant à rattacher pour cette posture.
          <br />
          Tous les utilisateurs de l&apos;entreprise ont déjà une adhésion{" "}
          {posture}.
        </>
      );
    return (
      <>
        <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          {emptyMessage}
        </div>
        <DialogStyledFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogStyledFooter>
      </>
    );
  }

  return (
    <>
      <DialogStyledBody className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Utilisateur à rattacher <span aria-hidden="true">*</span>
            </Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {eligibleUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.prenom} {u.nom}{" "}
                    <span className="text-muted-foreground">({u.email})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Rôle <span aria-hidden="true">*</span>
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogStyledBody>

      <DialogStyledFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !selectedUserId || !selectedRole}
        >
          {submitting && <Spinner />}
          Rattacher
        </Button>
      </DialogStyledFooter>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Création d'un nouvel utilisateur (client ou prestataire)
// ──────────────────────────────────────────────────────────────────────────────
function CreateUserFormInner({
  parentId,
  entrepriseId,
  posture,
  defaultValues,
  onSuccess,
  onOpenChange,
}: {
  parentId?: string | null;
  entrepriseId: string;
  posture: "client" | "prestataire";
  defaultValues?: Partial<InsertUserFormType>;
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const roleClientAdhesion = useAppStore((state) => state.roleClientAdhesion);
  const rolePrestataireAdhesion = useAppStore(
    (state) => state.rolePrestataireAdhesion,
  );
  const currentUserPlateformeRole = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );

  const currentUserRole =
    posture === "prestataire" ? rolePrestataireAdhesion : roleClientAdhesion;

  const roleCT =
    posture === "prestataire"
      ? rolePrestataireAdhesionCT
      : roleClientAdhesionCT;

  const availableRoles = roleCT.filter((r) => {
    if (!currentUserRole && !currentUserPlateformeRole) return false;
    if (currentUserPlateformeRole === "super_admin_plateforme") return true;
    if (currentUserRole === "admin") return true;
    if (currentUserRole === "manager") return r.code === "collaborateur";
    return false;
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
  }, [parentId, defaultValues, form]);

  const onSubmit = async (data: InsertUserFormType) => {
    const result = await insertUserAction({
      ...data,
      entrepriseId,
      posture,
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <DialogStyledBody className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <RhfInput<InsertUserFormType>
                label="Prénom"
                name="prenom"
                requiredMark
              />
              <RhfInput<InsertUserFormType> label="Nom" name="nom" requiredMark />
            </div>

            <RhfInput<InsertUserFormType>
              label="Email"
              name="email"
              type="email"
              requiredMark
            />
            <RhfInput<InsertUserFormType> label="N° de téléphone" name="phone" />
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
        </DialogStyledBody>

        <DialogStyledFooter>
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
        </DialogStyledFooter>
      </form>
    </Form>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Création d'un nouvel utilisateur plateforme
// ──────────────────────────────────────────────────────────────────────────────
function CreatePlateformeUserFormInner({
  entrepriseId,
  onSuccess,
  onOpenChange,
}: {
  entrepriseId: string;
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <DialogStyledBody className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
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
        </DialogStyledBody>

        <DialogStyledFooter>
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
        </DialogStyledFooter>
      </form>
    </Form>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Edit Form Component
// ──────────────────────────────────────────────────────────────────────────────
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
  const currentUser = useAppStore((state) => state.user);
  const postureActive = useAppStore((state) => state.postureActive);
  const roleClientAdhesion = useAppStore((state) => state.roleClientAdhesion);
  const rolePrestataireAdhesion = useAppStore(
    (state) => state.rolePrestataireAdhesion,
  );
  const currentUserPlateformeRole = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );

  const currentUserRole =
    postureActive === "prestataire"
      ? rolePrestataireAdhesion
      : roleClientAdhesion;

  const posture: "client" | "prestataire" =
    postureActive === "prestataire" ? "prestataire" : "client";

  const isEditingSelf = currentUser?.id === userId;

  const roleCT =
    posture === "prestataire"
      ? rolePrestataireAdhesionCT
      : roleClientAdhesionCT;

  const availableRoles = roleCT.filter(() => {
    if (!currentUserRole && !currentUserPlateformeRole) return false;
    if (currentUserPlateformeRole === "super_admin_plateforme") return true;
    if (currentUserRole === "admin") return true;
    return false;
  });

  const canEditRole =
    !isEditingSelf &&
    (currentUserPlateformeRole === "super_admin_plateforme" ||
      currentUserRole === "admin");

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

  useEffect(() => {
    if (open) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [open]);

  useEffect(() => {
    const loadAvatarPreview = async () => {
      if (defaultValues?.avatar?.storageKey && entrepriseId) {
        try {
          const previewUrl = await getPresignedReadUrl({
            key: defaultValues.avatar.storageKey,
            proprietaireEntrepriseId: entrepriseId,
          });
          form.setValue(
            "avatar",
            { ...defaultValues.avatar, previewUrl },
            { shouldDirty: false },
          );
        } catch {
          // non-critical
        }
      }
    };

    if (open && defaultValues?.avatar) {
      loadAvatarPreview();
    }
  }, [open, defaultValues?.avatar, entrepriseId, form, refreshKey]);

  const onSubmit = async (data: UpdateUserFormType) => {
    const result = await updateUserAction({ ...data, entrepriseId, posture });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.validationErrors) {
      toast.error("Erreur de validation");
      return;
    }

    if (isEditingSelf && result?.data?.user) {
      useAppStore.getState().updateUser({
        id: result.data.user.id,
        prenom: result.data.user.prenom,
        nom: result.data.user.nom,
        email: result.data.user.email,
        avatarId: result.data.user.avatarId,
      });
    }

    if (result?.data?.emailChanged) {
      toast.warning(
        isEditingSelf
          ? "Votre email a été modifié. Un email de vérification vous a été envoyé."
          : `Utilisateur mis à jour. Un email de vérification a été envoyé à ${result.data.user?.email}.`,
        { duration: 8000 },
      );
    } else {
      toast.success(result?.data?.message || "Utilisateur mis à jour");
    }

    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <User className="text-primary" />
                Modifier un utilisateur
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              toast.error(
                `Erreur de validation: ${Object.keys(errors).join(", ")}`,
              );
            })}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <DialogStyledBody className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
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
            </DialogStyledBody>

            <DialogStyledFooter>
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
            </DialogStyledFooter>
          </form>
        </Form>
      </DialogStyledContent>
    </Dialog>
  );
}
