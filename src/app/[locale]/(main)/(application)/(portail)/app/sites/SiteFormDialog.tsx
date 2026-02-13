"use client";

import { RhfCheckbox } from "@/components/rhf/RhfCheckbox";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { typeBatimentCT, typeOccupationCT } from "@/constants/codeTables";
import {
  insertSiteAction,
  updateSiteAction,
} from "@/server/actions/sitesActions";
import {
  insertSiteFormSchema,
  updateSiteFormSchema,
  type InsertSiteFormType,
  type SelectSiteType,
  type UpdateSiteFormType,
} from "@/zod-schemas/sites.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type SiteFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  site: SelectSiteType | null;
  parentId: string | null;
  entrepriseId: string;
  parentSite?: SelectSiteType | null;
  onSuccess: (site: SelectSiteType) => void;
};

export function SiteFormDialog({
  open,
  onOpenChange,
  mode,
  site,
  parentId,
  entrepriseId,
  parentSite,
  onSuccess,
}: SiteFormDialogProps) {
  const t = useTranslations("DevisPage.locaux.locauxForm");
  const schema =
    mode === "create" ? insertSiteFormSchema : updateSiteFormSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues:
      mode === "edit" && site
        ? {
            id: site.id,
            nom: site.nom,
            adresseLigne1: site.adresseLigne1,
            adresseLigne2: site.adresseLigne2 || "",
            codePostal: site.codePostal,
            ville: site.ville,
            surface: String(site.surface),
            effectif: String(site.effectif),
            typeBatiment: site.typeBatiment,
            typeOccupation: site.typeOccupation,
            commentaires: site.commentaires || "",
            actif: site.actif,
          }
        : {
            nom: "",
            adresseLigne1: "",
            adresseLigne2: "",
            codePostal: "",
            ville: "",
            surface: "",
            effectif: "",
            typeBatiment: "bureaux",
            typeOccupation: "partieEtage",
            commentaires: "",
          },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  // Réinitialiser le formulaire quand le dialog s'ouvre avec de nouvelles valeurs
  useEffect(() => {
    if (open) {
      const values =
        mode === "edit" && site
          ? {
              id: site.id,
              nom: site.nom,
              adresseLigne1: site.adresseLigne1,
              adresseLigne2: site.adresseLigne2 || "",
              codePostal: site.codePostal,
              ville: site.ville,
              surface: String(site.surface),
              effectif: String(site.effectif),
              typeBatiment: site.typeBatiment,
              typeOccupation: site.typeOccupation,
              commentaires: site.commentaires || "",
              actif: site.actif,
            }
          : {
              nom: "",
              adresseLigne1: "",
              adresseLigne2: "",
              codePostal: "",
              ville: "",
              surface: "",
              effectif: "",
              typeBatiment: "bureaux" as const,
              typeOccupation: "partieEtage" as const,
              commentaires: "",
            };
      form.reset(values);
    }
  }, [open, mode, site, form]);

  // Copier l'adresse du site parent
  const handleCopyParentAddress = () => {
    if (!parentSite) return;

    form.setValue("adresseLigne1", parentSite.adresseLigne1, {
      shouldDirty: true,
    });
    form.setValue("adresseLigne2", parentSite.adresseLigne2 || "", {
      shouldDirty: true,
    });
    form.setValue("codePostal", parentSite.codePostal, { shouldDirty: true });
    form.setValue("ville", parentSite.ville, { shouldDirty: true });

    toast.success("Adresse copiée depuis le site parent");
  };

  const onSubmit = async (data: InsertSiteFormType | UpdateSiteFormType) => {
    try {
      if (mode === "create") {
        const createData = data as InsertSiteFormType;
        const result = await insertSiteAction({
          nom: createData.nom,
          adresseLigne1: createData.adresseLigne1,
          adresseLigne2: createData.adresseLigne2 || null,
          codePostal: createData.codePostal,
          ville: createData.ville,
          surface: Number(createData.surface),
          effectif: Number(createData.effectif),
          typeBatiment: createData.typeBatiment,
          typeOccupation: createData.typeOccupation,
          commentaires: createData.commentaires || null,
          parentId: parentId || null,
          entrepriseId,
        });

        // Gestion d'erreur next-safe-action
        if (result?.serverError) {
          toast.error(result.serverError.message);
          return;
        }

        if (result?.data?.site) {
          toast.success("Site créé avec succès");
          onSuccess(result.data.site);
          onOpenChange(false);
        }
      } else if (mode === "edit" && site) {
        const updateData = data as UpdateSiteFormType;
        const result = await updateSiteAction({
          id: updateData.id,
          nom: updateData.nom,
          adresseLigne1: updateData.adresseLigne1,
          adresseLigne2: updateData.adresseLigne2 || null,
          codePostal: updateData.codePostal,
          ville: updateData.ville,
          surface: updateData.surface ? Number(updateData.surface) : undefined,
          effectif: updateData.effectif
            ? Number(updateData.effectif)
            : undefined,
          typeBatiment: updateData.typeBatiment,
          typeOccupation: updateData.typeOccupation,
          commentaires: updateData.commentaires || null,
          actif: updateData.actif,
          entrepriseId,
        });

        // Gestion d'erreur next-safe-action
        if (result?.serverError) {
          toast.error(result.serverError.message);
          return;
        }

        if (result?.data?.site) {
          toast.success("Site mis à jour avec succès");
          onSuccess(result.data.site);
          onOpenChange(false);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Building className="text-primary size-6" />
              {mode === "create" ? "Créer un site" : "Modifier le site"}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-1">
              {/* Nom */}
              <RhfInput<InsertSiteFormType | UpdateSiteFormType>
                name="nom"
                label="Nom du site"
                requiredMark
              />

              {/* Statut (seulement en mode edit) */}
              {mode === "edit" && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Statut</h3>
                  <RhfCheckbox<UpdateSiteFormType>
                    name="actif"
                    label="Site actif"
                    orientation="horizontal"
                  />
                </div>
              )}

              {/* Adresse */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Adresse</h3>
                  {parentSite && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyParentAddress}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3" />
                      Copier site parent
                    </Button>
                  )}
                </div>
                <RhfInput<InsertSiteFormType | UpdateSiteFormType>
                  name="adresseLigne1"
                  label="Adresse ligne 1"
                  requiredMark
                />
                <RhfInput<InsertSiteFormType | UpdateSiteFormType>
                  name="adresseLigne2"
                  label="Adresse ligne 2"
                />
                <div className="grid grid-cols-2 gap-4">
                  <RhfInput<InsertSiteFormType | UpdateSiteFormType>
                    name="codePostal"
                    label="Code postal"
                    requiredMark
                  />
                  <RhfInput<InsertSiteFormType | UpdateSiteFormType>
                    name="ville"
                    label="Ville"
                    requiredMark
                  />
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="space-y-4">
                <h3 className="font-semibold">Caractéristiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <RhfInput<InsertSiteFormType | UpdateSiteFormType>
                    name="surface"
                    label="Surface (m²)"
                    type="number"
                    requiredMark
                  />
                  <RhfInput<InsertSiteFormType | UpdateSiteFormType>
                    name="effectif"
                    label="Effectif"
                    type="number"
                    requiredMark
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <RhfControlledSelect<InsertSiteFormType | UpdateSiteFormType>
                    name="typeBatiment"
                    label="Type de bâtiment"
                    requiredMark
                    className="col-span-1"
                    selectClassName="w-full"
                  >
                    {typeBatimentCT.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {t(type.name)}
                      </SelectItem>
                    ))}
                  </RhfControlledSelect>
                  <RhfControlledSelect<InsertSiteFormType | UpdateSiteFormType>
                    name="typeOccupation"
                    label="Type d'occupation"
                    requiredMark
                    className="col-span-1"
                    selectClassName="w-full"
                  >
                    {typeOccupationCT.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {t(type.name)}
                      </SelectItem>
                    ))}
                  </RhfControlledSelect>
                </div>
              </div>

              {/* Commentaires */}
              <RhfTextArea<InsertSiteFormType | UpdateSiteFormType>
                name="commentaires"
                label="Commentaires"
                textareaClassName="h-40"
              />
            </div>

            {/* Actions - Fixed Footer */}
            <div className="bg-background flex shrink-0 justify-end gap-4 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Spinner />}

                {mode === "create" ? "Créer" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
