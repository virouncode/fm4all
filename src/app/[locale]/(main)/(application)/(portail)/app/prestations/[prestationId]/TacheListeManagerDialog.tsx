"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface TacheListeManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  proprietaireEntrepriseId: string;
}

export function TacheListeManagerDialog({
  open,
  onOpenChange,
  serviceId,
  proprietaireEntrepriseId,
}: TacheListeManagerDialogProps) {
  const [packs, setPacks] = useState<TacheListeTemplateWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedPackId, setExpandedPackId] = useState<string | null>(null);
  const [newPackName, setNewPackName] = useState("");
  const [isCreatingPack, setIsCreatingPack] = useState(false);
  const [creatingPack, setCreatingPack] = useState(false);

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
      setExpandedPackId(null);
    }
  }, [open, loadPacks]);

  const handleCreatePack = async () => {
    if (!newPackName.trim()) return;
    setCreatingPack(true);
    const result = await insertTacheListeTemplateAction({
      nom: newPackName.trim(),
      serviceId,
      proprietaireEntrepriseId,
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
                  <div className="rounded-lg border p-3">
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
                    entrepriseId={proprietaireEntrepriseId}
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
  entrepriseId: string;
  onRefresh: () => Promise<void>;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(pack.nom);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

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
            <span className="text-muted-foreground text-xs">
              {pack.items.length} tâche{pack.items.length !== 1 ? "s" : ""}
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
        )}
      </div>

      {/* Items (si expanded) */}
      {expanded && (
        <div className="bg-muted/20 border-t">
          {pack.items.length === 0 && !isAddingItem && (
            <p className="text-muted-foreground px-4 py-3 text-xs italic">
              Aucune tâche dans cette checklist.
            </p>
          )}

          {pack.items.map((item, idx) => (
            <ItemRow
              key={item.id}
              item={item}
              index={idx}
              total={pack.items.length}
              packId={pack.id}
              entrepriseId={entrepriseId}
              onRefresh={onRefresh}
              orderedIds={pack.items.map((i) => i.id)}
            />
          ))}

          {/* Ajouter un item */}
          {isAddingItem ? (
            <AddItemForm
              packId={pack.id}
              entrepriseId={entrepriseId}
              onSuccess={async () => {
                setIsAddingItem(false);
                await onRefresh();
              }}
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

// ==================== ITEM ROW ====================

function ItemRow({
  item,
  index,
  total,
  packId,
  entrepriseId,
  onRefresh,
  orderedIds,
}: {
  item: TacheListeItemRow;
  index: number;
  total: number;
  packId: string;
  entrepriseId: string;
  onRefresh: () => Promise<void>;
  orderedIds: string[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitre, setEditTitre] = useState(item.titre);
  const [editDesc, setEditDesc] = useState(item.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

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
    } else {
      setIsEditing(false);
      await onRefresh();
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
      await onRefresh();
    }
  };

  const handleMove = async (direction: "up" | "down") => {
    const newIds = [...orderedIds];
    const currentIdx = newIds.indexOf(item.id);
    if (direction === "up" && currentIdx > 0) {
      [newIds[currentIdx - 1], newIds[currentIdx]] = [
        newIds[currentIdx]!,
        newIds[currentIdx - 1]!,
      ];
    } else if (direction === "down" && currentIdx < newIds.length - 1) {
      [newIds[currentIdx + 1], newIds[currentIdx]] = [
        newIds[currentIdx]!,
        newIds[currentIdx + 1]!,
      ];
    } else {
      return;
    }

    setIsReordering(true);
    const result = await reorderTacheListeItemsAction({
      listeTemplateId: packId,
      entrepriseId,
      orderedIds: newIds,
    });
    setIsReordering(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
    } else {
      await onRefresh();
    }
  };

  return (
    <div className="divide-y border-t first:border-t-0">
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
          {/* Numéro */}
          <span className="text-muted-foreground mt-0.5 w-5 flex-shrink-0 text-center text-xs">
            {index + 1}.
          </span>

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
              onClick={() => handleMove("up")}
              disabled={index === 0 || isReordering}
              aria-label="Monter"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleMove("down")}
              disabled={index === total - 1 || isReordering}
              aria-label="Descendre"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
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
  entrepriseId: string;
  onSuccess: () => Promise<void>;
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
    } else {
      await onSuccess();
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
