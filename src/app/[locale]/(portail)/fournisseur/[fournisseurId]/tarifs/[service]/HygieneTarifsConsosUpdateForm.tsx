"use client";

import { updateHygieneTarifConsoAction } from "@/actions/hygieneTarifsAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RATIO } from "@/constants/constants";
import { useToast } from "@/hooks/use-toast";
import { LocaleType } from "@/i18n/routing";
import { SelectHygieneConsoTarifsFournisseurType } from "@/zod-schemas/hygieneConsoTarifs";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { DateTime } from "luxon";
import { useLocale } from "next-intl";
import { ChangeEvent, useState } from "react";

const mapping = {
  effectif: "Effectif",
  paParPersonneEmp: "Prix annuel par personne - Essuie-mains (€ HT)",
  paParPersonneSavon: "Prix annuel par personne - Savon (€ HT)",
  paParPersonnePh: "Prix annuel par personne - Papier hygiénique (€ HT)",
  paParPersonneDesinfectant: "Prix annuel par personne - Désinfectant (€ HT)",
};

type HygieneTarifsConsosUpdateFormProps = {
  initialTarifs: SelectHygieneConsoTarifsFournisseurType[];
  title?: string;
};

export default function HygieneTarifsConsosUpdateForm({
  initialTarifs,
  title = "Tarifs des consommables d&apos;hygiène",
}: HygieneTarifsConsosUpdateFormProps) {
  const [tarifs, setTarifs] =
    useState<SelectHygieneConsoTarifsFournisseurType[]>(initialTarifs);
  const [modifiedTarifs, setModifiedTarifs] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const locale = useLocale() as LocaleType;

  const lastUpdate = format(
    initialTarifs.sort(
      (a, b) =>
        DateTime.fromJSDate(b.updatedAt).toMillis() -
        DateTime.fromJSDate(a.updatedAt).toMillis()
    )[0].updatedAt,
    locale === "fr" ? "dd/MM/yyyy à HH:mm" : "yyyy/MM/dd at hh:mm a"
  );

  // Vérifier s'il y a des modifications non sauvegardées
  const hasUnsavedChanges = modifiedTarifs.size > 0;

  // Fonction pour vérifier si un tarif a été modifié
  const isTarifModified = (id: number) => modifiedTarifs.has(id);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: number,
    field: keyof SelectHygieneConsoTarifsFournisseurType
  ) => {
    // Filtrer pour n'accepter que les chiffres et les virgules/points
    const inputValue = e.target.value;
    // Convertir en nombre
    const value = inputValue ? parseFloat(inputValue) : 0;

    // Vérifier si la valeur a changé par rapport à initialTarifs
    const initialTarif = initialTarifs.find((t) => t.id === id);
    const hasChanged = initialTarif && initialTarif[field] !== value;

    // Mettre à jour l'UI immédiatement
    setTarifs((prevTarifs) =>
      prevTarifs.map((tarif) =>
        tarif.id === id ? { ...tarif, [field]: value } : tarif
      )
    );

    // Mettre à jour la liste des tarifs modifiés
    if (hasChanged) {
      setModifiedTarifs((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
    } else {
      // Si la valeur est revenue à sa valeur initiale, vérifier si tous les autres champs correspondent également
      const allFieldsMatch =
        initialTarif &&
        Object.entries(initialTarif).every(([key, val]) => {
          if (key === field) {
            return val === value;
          }
          return (
            val ===
            tarifs.find((t) => t.id === id)?.[
              key as keyof SelectHygieneConsoTarifsFournisseurType
            ]
          );
        });

      if (allFieldsMatch) {
        setModifiedTarifs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    let success = true;
    let errorMessage = "";

    // Sauvegarder chaque tarif modifié
    for (const id of modifiedTarifs) {
      const tarif = tarifs.find((t) => t.id === id);
      if (!tarif) continue;

      const initialTarif = initialTarifs.find((t) => t.id === id);
      if (!initialTarif) continue;

      // Vérifier quels champs ont été modifiés
      const fieldsToUpdate: Array<
        keyof SelectHygieneConsoTarifsFournisseurType
      > = [];
      if (tarif.effectif !== initialTarif.effectif) {
        fieldsToUpdate.push("effectif");
      }
      if (tarif.paParPersonneEmp !== initialTarif.paParPersonneEmp) {
        fieldsToUpdate.push("paParPersonneEmp");
      }
      if (tarif.paParPersonneSavon !== initialTarif.paParPersonneSavon) {
        fieldsToUpdate.push("paParPersonneSavon");
      }
      if (tarif.paParPersonnePh !== initialTarif.paParPersonnePh) {
        fieldsToUpdate.push("paParPersonnePh");
      }
      if (
        tarif.paParPersonneDesinfectant !==
        initialTarif.paParPersonneDesinfectant
      ) {
        fieldsToUpdate.push("paParPersonneDesinfectant");
      }

      // Mettre à jour chaque champ modifié
      for (const field of fieldsToUpdate) {
        try {
          // S'assurer que la valeur est un nombre
          const value = tarif[field];

          if (typeof value === "number") {
            if (value === 0) {
              toast({
                variant: "destructive",
                title: "Erreur 😿",
                description: `La valeur de "${mapping[field as keyof typeof mapping]}" ne peut être nulle ou mal formatée, entrez une valeur entière ou décimale`,
              });
              setSaving(false);
              return;
            }

            const result = await updateHygieneTarifConsoAction({
              id,
              field,
              value: Math.round(value * RATIO),
              effectif: tarif.effectif as number,
            });
            if (!result?.data?.success) {
              success = false;
              errorMessage =
                result?.data?.message ??
                "Une erreur est survenue lors de la mise à jour";
              break;
            }
          }
        } catch (err) {
          success = false;
          errorMessage = "Une erreur est survenue lors de la mise à jour";
          console.error(err);
          break;
        }
      }

      if (!success) break;
    }

    setSaving(false);

    if (success) {
      // Mettre à jour initialTarifs avec les nouvelles valeurs
      setModifiedTarifs(new Set());
      toast({
        title: "Succès ! 🚀",
        description: "Les tarifs ont été mis à jour avec succès",
      });
      window.location.reload();
    } else {
      toast({
        variant: "destructive",
        title: "Erreur 😿",
        description:
          errorMessage || "Une erreur est survenue lors de la mise à jour",
      });
    }
  };

  const handleCancel = () => {
    // Réinitialiser les tarifs à leur état initial
    setTarifs(initialTarifs);
    setModifiedTarifs(new Set());
  };

  if (tarifs.length === 0) {
    return (
      <div className="text-center p-8">
        Aucun tarif trouvé. Veuillez contacter l&apos;administrateur pour
        configurer vos tarifs.
      </div>
    );
  }

  // Trier les tarifs par effectif
  const sortedTarifs = [...tarifs].sort((a, b) => {
    // Convertir en nombre si c'est une chaîne
    const effectifA =
      typeof a.effectif === "string" ? parseInt(a.effectif) : a.effectif;
    const effectifB =
      typeof b.effectif === "string" ? parseInt(b.effectif) : b.effectif;

    // Utiliser des valeurs par défaut si null
    const numA = effectifA || 0;
    const numB = effectifB || 0;

    return numA - numB;
  });

  return (
    <>
      <div className="flex justify-between mt-14 mb-2 item-center">
        <div className="border-l border-l-gray-500">
          <h2 className="ml-4 text-xl font-bold">{title}</h2>
        </div>
        <p className="text-sm text-end italic">
          Dernière mise à jour : {lastUpdate}
        </p>
      </div>
      <div className="relative space-y-4">
        {/* Bouton de sauvegarde et indicateur de modifications */}
        <div className="flex justify-between items-center flex-col gap-4 md:flex-row md:gap-0">
          <div>
            {hasUnsavedChanges && (
              <div className="text-sm text-amber-600 font-medium">
                Vous avez des modifications non sauvegardées
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving}
              variant="destructive"
              size="lg"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <Loader className="animate-spin" />
                  <p>...Sauvegarde</p>
                </div>
              ) : (
                "Sauvegarder"
              )}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={!hasUnsavedChanges || saving}
              variant="outline"
              size="lg"
            >
              Annuler
            </Button>
          </div>
        </div>

        {/* Tableau des tarifs */}
        <div className="overflow-hidden border rounded-md">
          <div className="max-h-[550px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead>Effectif</TableHead>
                  <TableHead>Essuie-mains (€ HT/pers/an)*</TableHead>
                  <TableHead>Savon (€ HT/pers/an)*</TableHead>
                  <TableHead>Papier hygiénique (€ HT/pers/an)*</TableHead>
                  <TableHead>Désinfectant (€ HT/pers/an)*</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTarifs.map((tarif, index) => {
                  // Vérifier si ce tarif a été modifié
                  const isModified = isTarifModified(tarif.id);

                  return (
                    <TableRow
                      key={tarif.id}
                      className={`${isModified ? "bg-amber-50" : ""}`}
                    >
                      <TableCell className="font-medium">
                        {tarif.effectif}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={tarif.paParPersonneEmp || ""}
                          onChange={(e) =>
                            handleInputChange(e, tarif.id, "paParPersonneEmp")
                          }
                          className={`w-24 ${isModified ? "border-amber-500" : ""}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={tarif.paParPersonneSavon || ""}
                          onChange={(e) =>
                            handleInputChange(e, tarif.id, "paParPersonneSavon")
                          }
                          className={`w-24 ${isModified ? "border-amber-500" : ""}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={tarif.paParPersonnePh || ""}
                          onChange={(e) =>
                            handleInputChange(e, tarif.id, "paParPersonnePh")
                          }
                          className={`w-24 ${isModified ? "border-amber-500" : ""}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={tarif.paParPersonneDesinfectant || ""}
                          onChange={(e) =>
                            handleInputChange(
                              e,
                              tarif.id,
                              "paParPersonneDesinfectant"
                            )
                          }
                          className={`w-24 ${isModified ? "border-amber-500" : ""}`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
