"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
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
import { Building } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type SiteFormProps = {
  mode: "create" | "edit";
  site: SelectSiteType | null;
  parentId: string | null;
  entrepriseId: string;
  onSuccess: (site: SelectSiteType) => void;
  onCancel: () => void;
};

// Type union pour gérer les deux modes
type SiteFormValues = InsertSiteFormType | UpdateSiteFormType;

export function SiteForm({
  mode,
  site,
  parentId,
  entrepriseId,
  onSuccess,
  onCancel,
}: SiteFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? insertSiteFormSchema : updateSiteFormSchema,
    ),
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
          },
  });

  const onSubmit = async (data: SiteFormValues) => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        // En mode create, on sait que data est de type InsertSiteFormType
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
        }
      } else if (mode === "edit" && site) {
        // En mode edit, on sait que data est de type UpdateSiteFormType
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
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full max-h-[calc(100vh-12rem)] flex-col"
      >
        <div className="flex-1 space-y-6 overflow-y-auto px-1">
          <div className="flex items-center gap-2">
            <Building className="text-primary size-6" />
            <h2 className="text-2xl font-bold">
              {mode === "create" ? "Créer un site" : "Modifier le site"}
            </h2>
          </div>

          {/* Nom */}
          <RhfInput name="nom" label="Nom du site" requiredMark />

          {/* Adresse */}
          <div className="space-y-4">
            <h3 className="font-semibold">Adresse</h3>
            <RhfInput
              name="adresseLigne1"
              label="Adresse ligne 1"
              requiredMark
            />
            <RhfInput name="adresseLigne2" label="Adresse ligne 2" />
            <div className="grid grid-cols-2 gap-4">
              <RhfInput name="codePostal" label="Code postal" requiredMark />
              <RhfInput name="ville" label="Ville" requiredMark />
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="space-y-4">
            <h3 className="font-semibold">Caractéristiques</h3>
            <div className="grid grid-cols-2 gap-4">
              <RhfInput
                name="surface"
                label="Surface (m²)"
                type="number"
                requiredMark
              />
              <RhfInput
                name="effectif"
                label="Effectif"
                type="number"
                requiredMark
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <RhfControlledSelect
                name="typeBatiment"
                label="Type de bâtiment"
                requiredMark
              >
                {typeBatimentCT.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
              <RhfControlledSelect
                name="typeOccupation"
                label="Type d'occupation"
                requiredMark
              >
                {typeOccupationCT.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
            </div>
          </div>

          {/* Commentaires */}
          <RhfTextArea
            name="commentaires"
            label="Commentaires"
            className="h-20"
          />
        </div>

        {/* Actions - Sticky Footer */}
        <div className="bg-background flex shrink-0 justify-end gap-4 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Enregistrement..."
              : mode === "create"
                ? "Créer"
                : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
