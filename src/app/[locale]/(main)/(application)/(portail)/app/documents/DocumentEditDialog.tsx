"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
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
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import {
  getDocumentTagsAction,
  insertDocumentTagAction,
  updateDocumentAction,
} from "@/server/actions/documentsActions";
import {
  SelectDocumentWithTagsType,
  UpdateDocumentFormType,
  updateDocumentFormSchema,
} from "@/zod-schemas/documents.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilePen, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type TagType = { id: string; nom: string; couleur: string | null };

type DocumentEditDialogProps = {
  document: SelectDocumentWithTagsType | null;
  onOpenChange: (open: boolean) => void;
  entrepriseId: string;
  onSuccess: () => void;
};

export function DocumentEditDialog({
  document,
  onOpenChange,
  entrepriseId,
  onSuccess,
}: DocumentEditDialogProps) {
  const open = !!document;
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const form = useForm<UpdateDocumentFormType>({
    resolver: zodResolver(updateDocumentFormSchema),
    defaultValues: {
      documentId: "",
      entrepriseId,
      titre: "",
      visibilite: "prive",
      tagIds: [],
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  // Load tags and reset form when document changes
  useEffect(() => {
    if (!document) return;

    async function loadTags() {
      const result = await getDocumentTagsAction({ entrepriseId });
      if (result?.data?.tags) setAvailableTags(result.data.tags);
    }
    loadTags();

    form.reset({
      documentId: document.id,
      entrepriseId,
      titre: document.titre ?? "",
      visibilite: document.visibilite,
      tagIds: document.tags.map((t) => t.id),
    });
    setSelectedTagIds(document.tags.map((t) => t.id));
    setNewTagName("");
  }, [document, entrepriseId, form]);

  useEffect(() => {
    form.setValue("tagIds", selectedTagIds);
  }, [selectedTagIds, form]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    try {
      const result = await insertDocumentTagAction({
        entrepriseId,
        nom: newTagName.trim(),
      });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.tag) {
        const tag = result.data.tag;
        setAvailableTags((prev) => [...prev, { id: tag.id, nom: tag.nom, couleur: tag.couleur }]);
        setSelectedTagIds((prev) => [...prev, tag.id]);
        setNewTagName("");
      }
    } catch {
      toast.error("Erreur lors de la création du tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const onSubmit = async (data: UpdateDocumentFormType) => {
    const result = await updateDocumentAction({
      documentId: data.documentId,
      entrepriseId: data.entrepriseId,
      titre: data.titre || undefined,
      visibilite: data.visibilite,
      tagIds: selectedTagIds,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Document mis à jour");
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <FilePen className="text-primary size-5" />
            Modifier le document
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 space-y-4">
              {/* Titre */}
              <RhfInput<UpdateDocumentFormType>
                name="titre"
                label="Titre (optionnel)"
                placeholder="Nom affiché du document"
              />

              {/* Visibilité */}
              <RhfControlledSelect<UpdateDocumentFormType>
                name="visibilite"
                label="Visibilité"
                requiredMark
                selectClassName="w-full"
              >
                <SelectItem value="prive">Privé (visible uniquement par moi)</SelectItem>
                <SelectItem value="public">Partagé (visible par mes partenaires)</SelectItem>
              </RhfControlledSelect>

              {/* Tags */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Tags</p>
                {availableTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleTag(tag.id)}
                          className={`rounded-full border px-3 py-0.5 text-xs transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-primary"
                          }`}
                          style={
                            tag.couleur && isSelected
                              ? { backgroundColor: tag.couleur, borderColor: tag.couleur, color: "#fff" }
                              : tag.couleur
                              ? { borderColor: tag.couleur, color: tag.couleur }
                              : undefined
                          }
                        >
                          {tag.nom}
                          {isSelected && <X className="inline ml-1 h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nouveau tag..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleCreateTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!newTagName.trim() || isCreatingTag}
                    onClick={() => void handleCreateTag()}
                  >
                    <Plus className="h-4 w-4" />
                    Créer
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background border-t pt-4 pb-6 px-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
