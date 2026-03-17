"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  getDocumentTagsAction,
  insertDocumentAction,
  insertDocumentTagAction,
} from "@/server/actions/documentsActions";
import {
  InsertDocumentFormType,
  insertDocumentFormSchema,
} from "@/zod-schemas/documents.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type TagType = { id: string; nom: string; couleur: string | null };

type DocumentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrepriseId: string;
  onSuccess: () => void;
};

export function DocumentFormDialog({
  open,
  onOpenChange,
  entrepriseId,
  onSuccess,
}: DocumentFormDialogProps) {
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const form = useForm<InsertDocumentFormType>({
    resolver: zodResolver(insertDocumentFormSchema),
    defaultValues: {
      entrepriseId,
      titre: "",
      visibilite: "prive",
      tagIds: [],
      file: undefined as never,
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  useEffect(() => {
    if (!open) return;

    form.reset({
      entrepriseId,
      titre: "",
      visibilite: "prive",
      tagIds: [],
      file: undefined as never,
    });
    setAvailableTags([]);
    setSelectedTagIds([]);
    setNewTagName("");

    async function loadTags() {
      const result = await getDocumentTagsAction({ entrepriseId });
      if (result?.data?.tags) setAvailableTags(result.data.tags);
    }
    void loadTags();
  }, [open, entrepriseId, form]);

  // Keep tagIds in sync with selectedTagIds
  useEffect(() => {
    form.setValue("tagIds", selectedTagIds);
  }, [selectedTagIds, form]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
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
        setAvailableTags((prev) => [
          ...prev,
          { id: tag.id, nom: tag.nom, couleur: tag.couleur },
        ]);
        setSelectedTagIds((prev) => [...prev, tag.id]);
        setNewTagName("");
      }
    } catch {
      toast.error("Erreur lors de la création du tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const onSubmit = async (data: InsertDocumentFormType) => {
    if (!data.file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }
    const result = await insertDocumentAction({
      entrepriseId: data.entrepriseId,
      titre: data.titre || undefined,
      visibilite: data.visibilite,
      tagIds: selectedTagIds,
      file: {
        storageKey: data.file.storageKey,
        filename: data.file.filename,
        mimeType: data.file.mimeType,
        sizeBytes: data.file.sizeBytes,
      },
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Document ajouté");
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="text-primary size-5" />
              Nouveau document
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-auto"
          >
            <DialogStyledBody>
              <div className="flex-1 space-y-4 overflow-y-auto px-6">
                {/* File upload */}
                <RhfFileInput<InsertDocumentFormType>
                  name="file"
                  label="Fichier (max 50 Mo)"
                  requiredMark
                  proprietaireEntrepriseId={entrepriseId}
                  categorie="document"
                  maxSizeBytes={50 * 1024 * 1024}
                  accept="image/*,application/pdf,video/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv"
                />

                {/* Titre */}
                <RhfInput<InsertDocumentFormType>
                  name="titre"
                  label="Titre (optionnel)"
                  placeholder="Nom affiché du document"
                />

                {/* Visibilité */}
                <RhfControlledSelect<InsertDocumentFormType>
                  name="visibilite"
                  label="Visibilité"
                  requiredMark
                  selectClassName="w-full"
                >
                  <SelectItem value="prive">
                    Privé (visible uniquement par moi)
                  </SelectItem>
                  <SelectItem value="public">
                    Partagé (visible par mes partenaires)
                  </SelectItem>
                </RhfControlledSelect>

                {/* Tags */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tags</p>

                  {/* Inline tag creation */}
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

                  {/* Tag list */}
                  <div className="mb-2 flex h-28 flex-wrap content-start gap-2 overflow-auto rounded-md border p-2">
                    {availableTags.length === 0 ? (
                      <span className="text-muted-foreground text-xs italic">
                        Aucun tag disponible
                      </span>
                    ) : (
                      availableTags.map((tag) => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTag(tag.id)}
                            className={`h-fit rounded-full border px-3 py-0.5 text-xs transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary"
                            }`}
                            style={
                              tag.couleur && isSelected
                                ? {
                                    backgroundColor: tag.couleur,
                                    borderColor: tag.couleur,
                                    color: "#fff",
                                  }
                                : tag.couleur
                                  ? {
                                      borderColor: tag.couleur,
                                      color: tag.couleur,
                                    }
                                  : undefined
                            }
                          >
                            {tag.nom}
                            {isSelected && (
                              <X className="ml-1 inline h-3 w-3" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </DialogStyledBody>
            <DialogStyledFooter className="bg-background sticky bottom-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <Spinner className="size-3" />
                ) : (
                  <BookOpen className="size-3" />
                )}{" "}
                Créer
              </Button>
            </DialogStyledFooter>
          </form>
        </Form>
      </DialogStyledContent>
    </Dialog>
  );
}
