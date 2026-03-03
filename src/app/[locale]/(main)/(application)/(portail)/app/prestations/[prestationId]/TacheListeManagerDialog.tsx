"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteTacheListeItemAction,
  deleteTacheListeTemplateAction,
  getTacheListesTemplatesAction,
  insertTacheListeItemAction,
  insertTacheListeTemplateAction,
  reorderTacheListeItemsAction,
  updateTacheListeItemAction,
  updateTacheListeTemplateAction,
} from "@/server/actions/tacheListesTemplatesActions";
import type {
  TacheListeItemRow,
  TacheListeTemplateWithItems,
} from "@/server/queries/tacheListesTemplates.query";
import { Reorder, useDragControls } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type TacheListeManagerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  /** null = afficher les templates système (posture plateforme) */
  proprietaireEntrepriseId: string | null;
  /** Fourni en posture plateforme : permet de choisir entre système et client */
  clientEntrepriseId?: string;
  clientEntrepriseNom?: string;
}

export function TacheListeManagerDialog({
  open,
  onOpenChange,
  serviceId,
  proprietaireEntrepriseId,
  clientEntrepriseId,
  clientEntrepriseNom,
}: TacheListeManagerDialogProps) {
  const [packs, setPacks] = useState<TacheListeTemplateWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedPackId, setExpandedPackId] = useState<string | null>(null);
  const [newPackName, setNewPackName] = useState("");
  const [isCreatingPack, setIsCreatingPack] = useState(false);
  const [creatingPack, setCreatingPack] = useState(false);
  // En posture plateforme : choix du propriétaire du nouveau pack
  const isPlatformMode = proprietaireEntrepriseId === null && !!clientEntrepriseId;
  const [newPackOwner, setNewPackOwner] = useState<"system" | "client">("system");

  const loadPacks = useCallback(async () => {
    setLoading(true);
    const result = await getTacheListesTemplatesAction({
      proprietaireEntrepriseId,
      serviceId,
    });
    if (result?.data?.packs) {
      setPacks(result.data.packs);
    } else if (result?.serverError) {
      toast.error("Impossible de charger les checklists.");
    }
    setLoading(false);
  }, [proprietaireEntrepriseId, serviceId]);

  useEffect(() => {
    if (open) {
      loadPacks();
      setIsCreatingPack(false);
      setNewPackName("");
      setNewPackOwner("system");
      setExpandedPackId(null);
    }
  }, [open, loadPacks]);

  const handleCreatePack = async () => {
    if (!newPackName.trim()) return;

    // Résoudre le propriétaire selon le choix
    const resolvedProprietaireId: string | null =
      isPlatformMode
        ? newPackOwner === "system"
          ? null
          : (clientEntrepriseId ?? null)
        : proprietaireEntrepriseId;

    setCreatingPack(true);
    const result = await insertTacheListeTemplateAction({
      nom: newPackName.trim(),
      serviceId,
      proprietaireEntrepriseId: resolvedProprietaireId,
    });
    setCreatingPack(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    setNewPackName("");
    setIsCreatingPack(false);
    await loadPacks();
    toast.success("Checklist créée.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="text-primary h-5 w-5" />
            Gérer mes checklists
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-[60vh] px-6 py-4">
              <div className="space-y-3">
                {/* Bouton créer un pack */}
                {!isCreatingPack ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreatingPack(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle checklist
                  </Button>
                ) : (
                  <div className="rounded-lg border p-3 space-y-3">
                    {/* Choix du propriétaire (posture plateforme uniquement) */}
                    {isPlatformMode && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Propriétaire</Label>
                        <RadioGroup
                          value={newPackOwner}
                          onValueChange={(v) => setNewPackOwner(v as "system" | "client")}
                          className="space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="system" id="owner-system" />
                            <Label htmlFor="owner-system" className="text-sm font-normal cursor-pointer">
                              Système{" "}
                              <span className="text-muted-foreground text-xs">(disponible pour tous les clients)</span>
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="client" id="owner-client" />
                            <Label htmlFor="owner-client" className="text-sm font-normal cursor-pointer">
                              Pour ce client{" "}
                              {clientEntrepriseNom && (
                                <span className="text-muted-foreground text-xs">: {clientEntrepriseNom}</span>
                              )}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    <div>
                      <Label className="mb-1.5 block text-sm font-medium">
                        Nom de la checklist
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={newPackName}
                          onChange={(e) => setNewPackName(e.target.value)}
                          placeholder="Ex : Protocole nettoyage standard"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleCreatePack();
                            if (e.key === "Escape") {
                              setIsCreatingPack(false);
                              setNewPackName("");
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreatePack}
                          disabled={creatingPack || !newPackName.trim()}
                        >
                          {creatingPack ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Créer"
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsCreatingPack(false);
                            setNewPackName("");
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {packs.length === 0 && !isCreatingPack && (
                  <div className="py-8 text-center">
                    <ClipboardList className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
                    <p className="text-muted-foreground text-sm">
                      Aucune checklist créée pour ce service.
                    </p>
                  </div>
                )}

                {/* Liste des packs */}
                {packs.map((pack) => (
                  <PackEditor
                    key={pack.id}
                    pack={pack}
                    expanded={expandedPackId === pack.id}
                    onToggleExpand={() =>
                      setExpandedPackId(
                        expandedPackId === pack.id ? null : pack.id,
                      )
                    }
                    entrepriseId={pack.proprietaireEntrepriseId}
                    onRefresh={loadPacks}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <Separator />

        <div className="flex justify-end px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== PACK EDITOR ====================

function PackEditor({
  pack,
  expanded,
  onToggleExpand,
  entrepriseId,
  onRefresh,
}: {
  pack: TacheListeTemplateWithItems;
  expanded: boolean;
  onToggleExpand: () => void;
  entrepriseId: string | null;
  onRefresh: () => Promise<void>;
}) {
  const [localItems, setLocalItems] = useState<TacheListeItemRow[]>(pack.items);
  const latestOrderRef = useRef<TacheListeItemRow[]>(pack.items);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(pack.nom);
  const [isSavingName, setIsSavingName] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Sync local items when pack refreshes from parent
  useEffect(() => {
    setLocalItems(pack.items);
    latestOrderRef.current = pack.items;
  }, [pack.items]);

  const handleReorder = (newItems: TacheListeItemRow[]) => {
    setLocalItems(newItems);
    latestOrderRef.current = newItems;
  };

  const handleSaveOrder = async () => {
    const newItems = latestOrderRef.current;
    const result = await reorderTacheListeItemsAction({
      listeTemplateId: pack.id,
      entrepriseId,
      orderedIds: newItems.map((i) => i.id),
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
      // Revert to server state
      setLocalItems(pack.items);
      latestOrderRef.current = pack.items;
    }
  };

  const handleItemAdded = (newItem: TacheListeItemRow) => {
    setLocalItems((prev) => [...prev, newItem]);
    latestOrderRef.current = [...latestOrderRef.current, newItem];
    setIsAddingItem(false);
    // Background sync
    void onRefresh();
  };

  const handleItemDeleted = (itemId: string) => {
    setLocalItems((prev) => prev.filter((i) => i.id !== itemId));
    latestOrderRef.current = latestOrderRef.current.filter((i) => i.id !== itemId);
    void onRefresh();
  };

  const handleItemUpdated = (updatedItem: TacheListeItemRow) => {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
    );
    latestOrderRef.current = latestOrderRef.current.map((i) =>
      i.id === updatedItem.id ? updatedItem : i,
    );
    void onRefresh();
  };

  const handleRename = async () => {
    if (!editName.trim() || editName === pack.nom) {
      setIsEditingName(false);
      setEditName(pack.nom);
      return;
    }
    setIsSavingName(true);
    const result = await updateTacheListeTemplateAction({
      id: pack.id,
      entrepriseId,
      nom: editName.trim(),
    });
    setIsSavingName(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else {
      setIsEditingName(false);
      await onRefresh();
    }
  };

  const handleToggleActif = async (actif: boolean) => {
    const result = await updateTacheListeTemplateAction({
      id: pack.id,
      entrepriseId,
      actif,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else {
      await onRefresh();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteTacheListeTemplateAction({
      id: pack.id,
      entrepriseId,
    });
    setIsDeleting(false);
    setDeleteConfirmOpen(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else {
      toast.success("Checklist supprimée.");
      await onRefresh();
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Header pack */}
      <div className="flex items-center gap-2 p-3">
        {/* Toggle expand */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
          aria-label={expanded ? "Réduire" : "Développer"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Nom (éditable) */}
        {isEditingName ? (
          <div className="flex flex-1 gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-7 flex-1 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleRename();
                if (e.key === "Escape") {
                  setIsEditingName(false);
                  setEditName(pack.nom);
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              className="h-7"
              onClick={handleRename}
              disabled={isSavingName}
            >
              {isSavingName ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "OK"
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7"
              onClick={() => {
                setIsEditingName(false);
                setEditName(pack.nom);
              }}
            >
              Annuler
            </Button>
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm font-medium">{pack.nom}</span>
            {pack.proprietaireEntrepriseId === null && (
              <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium">
                Système
              </span>
            )}
            <span className="text-muted-foreground text-xs">
              {localItems.length} tâche{localItems.length !== 1 ? "s" : ""}
            </span>
          </>
        )}

        {!isEditingName && (
          <div className="flex flex-shrink-0 items-center gap-1">
            {/* Toggle actif */}
            <Switch
              checked={pack.actif}
              onCheckedChange={handleToggleActif}
              aria-label={pack.actif ? "Désactiver" : "Activer"}
              className="scale-75"
            />
            {/* Renommer */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setIsEditingName(true)}
              aria-label="Renommer"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            {/* Supprimer */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-destructive h-7 w-7"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isDeleting}
              aria-label="Supprimer"
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation suppression */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la checklist ?</AlertDialogTitle>
            <AlertDialogDescription>
              La checklist <strong>{pack.nom}</strong> et toutes ses tâches
              seront définitivement supprimées. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Items (si expanded) */}
      {expanded && (
        <div className="bg-muted/20 border-t">
          {localItems.length === 0 && !isAddingItem && (
            <p className="text-muted-foreground px-4 py-3 text-xs italic">
              Aucune tâche dans cette checklist.
            </p>
          )}

          <Reorder.Group
            axis="y"
            values={localItems}
            onReorder={handleReorder}
            className="outline-none"
            as="div"
          >
            {localItems.map((item) => (
              <DraggableItemRow
                key={item.id}
                item={item}
                packId={pack.id}
                entrepriseId={entrepriseId}
                onDragEnd={handleSaveOrder}
                onDeleted={() => handleItemDeleted(item.id)}
                onUpdated={handleItemUpdated}
              />
            ))}
          </Reorder.Group>

          {/* Ajouter un item */}
          {isAddingItem ? (
            <AddItemForm
              packId={pack.id}
              entrepriseId={entrepriseId}
              onSuccess={handleItemAdded}
              onCancel={() => setIsAddingItem(false)}
            />
          ) : (
            <div className="px-3 py-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setIsAddingItem(true)}
              >
                <Plus className="h-3 w-3" />
                Ajouter une tâche
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== DRAGGABLE ITEM ROW ====================

function DraggableItemRow({
  item,
  packId: _packId,
  entrepriseId,
  onDragEnd,
  onDeleted,
  onUpdated,
}: {
  item: TacheListeItemRow;
  packId: string;
  entrepriseId: string | null;
  onDragEnd: () => Promise<void>;
  onDeleted: () => void;
  onUpdated: (item: TacheListeItemRow) => void;
}) {
  const controls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitre, setEditTitre] = useState(item.titre);
  const [editDesc, setEditDesc] = useState(item.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!editTitre.trim()) return;
    setIsSaving(true);
    const result = await updateTacheListeItemAction({
      id: item.id,
      entrepriseId,
      titre: editTitre.trim(),
      description: editDesc.trim() || undefined,
    });
    setIsSaving(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data?.item) {
      onUpdated({
        id: result.data.item.id,
        ordre: result.data.item.ordre,
        titre: result.data.item.titre,
        description: result.data.item.description ?? null,
        actif: result.data.item.actif,
        dureeEstimeeMinutes: result.data.item.dureeEstimeeMinutes ?? null,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteTacheListeItemAction({
      id: item.id,
      entrepriseId,
    });
    setIsDeleting(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else {
      onDeleted();
    }
  };

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={() => { void onDragEnd(); }}
      className="outline-none"
      as="div"
    >
      <div className="border-t first:border-t-0">
        {isEditing ? (
          <div className="space-y-2 px-4 py-3">
            <Input
              value={editTitre}
              onChange={(e) => setEditTitre(e.target.value)}
              placeholder="Titre de la tâche"
              className="text-sm"
              autoFocus
            />
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description (optionnel)"
              className="min-h-[60px] text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !editTitre.trim()}
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Enregistrer
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitre(item.titre);
                  setEditDesc(item.description ?? "");
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 px-4 py-2">
            {/* Drag handle */}
            <button
              type="button"
              onPointerDown={(e) => controls.start(e)}
              className="text-muted-foreground hover:text-foreground mt-0.5 cursor-grab touch-none active:cursor-grabbing"
              aria-label="Déplacer"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* Contenu */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.titre}</p>
              {item.description && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {item.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-0.5">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setIsEditing(true)}
                aria-label="Modifier"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-destructive h-6 w-6"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Supprimer"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

// ==================== ADD ITEM FORM ====================

function AddItemForm({
  packId,
  entrepriseId,
  onSuccess,
  onCancel,
}: {
  packId: string;
  entrepriseId: string | null;
  onSuccess: (item: TacheListeItemRow) => void;
  onCancel: () => void;
}) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!titre.trim()) return;
    setSaving(true);
    const result = await insertTacheListeItemAction({
      listeTemplateId: packId,
      entrepriseId,
      titre: titre.trim(),
      description: description.trim() || undefined,
    });
    setSaving(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else if (result?.data?.item) {
      onSuccess({
        id: result.data.item.id,
        ordre: result.data.item.ordre,
        titre: result.data.item.titre,
        description: result.data.item.description ?? null,
        actif: result.data.item.actif,
        dureeEstimeeMinutes: result.data.item.dureeEstimeeMinutes ?? null,
      });
    }
  };

  return (
    <div className="space-y-2 border-t px-4 py-3">
      <Input
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Titre de la tâche *"
        className="text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") void handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optionnel)"
        className="min-h-[50px] text-sm"
        rows={2}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={saving || !titre.trim()}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Ajouter
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
