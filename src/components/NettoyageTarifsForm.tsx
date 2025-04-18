"use client";

import { Tarif, updateTarifAction } from "@/actions/getTarifsFournisseurAction";
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
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import { Loader } from "lucide-react";
import { ChangeEvent, useState } from "react";

// Définition de l'interface Tarif
const mapping = {
  hParPassage: "Heures moyennes par passage",
  tauxHoraire: "Taux horaire tout compris (€/h HT)",
};

export type NettoyageTarif = {
  id: number;
  fournisseurId: number;
  surface: number;
  hParPassage: number;
  tauxHoraire: number;
  gamme: "essentiel" | "confort" | "excellence";
  createdAt: Date;
};

type NettoyageTarifsFormProps = {
  initialTarifs: Tarif[];
  quantites: SelectNettoyageQuantitesType[];
};

export default function NettoyageTarifsForm({
  initialTarifs,
  quantites,
}: NettoyageTarifsFormProps) {
  const [tarifs, setTarifs] = useState<Tarif[]>(initialTarifs);
  const [modifiedTarifs, setModifiedTarifs] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Vérifier s'il y a des modifications non sauvegardées
  const hasUnsavedChanges = modifiedTarifs.size > 0;

  // Fonction pour vérifier si un tarif a été modifié
  const isTarifModified = (id: number) => modifiedTarifs.has(id);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: number,
    field: keyof Tarif
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
      // Si la valeur est revenue à sa valeur initiale, retirer de la liste des modifiés
      const currentTarif = tarifs.find((t) => t.id === id);
      const allFieldsMatch =
        initialTarif &&
        currentTarif &&
        initialTarif.hParPassage === currentTarif.hParPassage &&
        initialTarif.tauxHoraire === currentTarif.tauxHoraire;

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
      const fieldsToUpdate: Array<keyof Tarif> = [];
      if (tarif.hParPassage !== initialTarif.hParPassage) {
        fieldsToUpdate.push("hParPassage");
      }
      if (tarif.tauxHoraire !== initialTarif.tauxHoraire) {
        fieldsToUpdate.push("tauxHoraire");
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
                description: `La valeur de "${mapping[field as "hParPassage" | "tauxHoraire"]}" ne peut être nulle ou mal formatée, entrez une valeur entière ou décimale`,
              });
              setSaving(false);
              return;
            }
            const result = await updateTarifAction(id, field, value * RATIO);
            if (!result.success) {
              success = false;
              errorMessage = result.message;
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
    } else {
      toast({
        variant: "destructive",
        title: "Erreur 😿",
        description:
          errorMessage || "Une erreur est survenue lors de la mise à jour",
      });
    }
  };

  if (tarifs.length === 0) {
    return (
      <div className="text-center p-8">
        Aucun tarif trouvé. Veuillez contacter l&apos;administrateur pour
        configurer vos tarifs.
      </div>
    );
  }
  if (quantites.length === 0) {
    return (
      <div className="text-center p-8">
        Aucune quantité trouvée. Veuillez contacter l&apos;administrateur.
      </div>
    );
  }

  // Définir l'ordre des gammes
  const gammeOrder = {
    essentiel: 1,
    confort: 2,
    excellence: 3,
  };

  // Trier les tarifs par surface puis par gamme
  const sortedTarifs = [...tarifs].sort((a, b) => {
    // D'abord trier par surface
    if (a.surface !== b.surface) {
      return a.surface - b.surface;
    }
    // Ensuite trier par gamme dans l'ordre spécifié
    return (
      gammeOrder[a.gamme as keyof typeof gammeOrder] -
      gammeOrder[b.gamme as keyof typeof gammeOrder]
    );
  });

  const handleCancel = () => {
    // Réinitialiser les tarifs à leur état initial
    setTarifs(initialTarifs);
    setModifiedTarifs(new Set());
  };

  return (
    <div className="relative space-y-4">
      {/* Bouton de sauvegarde et indicateur de modifications */}
      <div className="flex justify-between items-center">
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
                <TableHead>Surface (m²)</TableHead>
                <TableHead>Gamme</TableHead>
                <TableHead>Fréquence de passage (j/an)</TableHead>
                <TableHead>Total Annuel (€ HT)</TableHead>
                <TableHead>Cadence (m2/h)</TableHead>
                <TableHead>Heures moyennes par passage</TableHead>
                <TableHead>Taux horaire tout compris (€/h HT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTarifs.map((tarif, index) => {
                // Vérifier si c'est le dernier élément de cette surface
                const isLastOfSurface =
                  index === sortedTarifs.length - 1 ||
                  sortedTarifs[index + 1].surface !== tarif.surface;

                // Trouver la quantité correspondante
                const quantite = quantites.find(
                  (q) => q.surface === tarif.surface && q.gamme === tarif.gamme
                );

                // Calculer la fréquence annuelle
                const freqAnnuelle = quantite
                  ? Math.round(quantite.freqAnnuelle)
                  : "-";

                // Vérifier si ce tarif a été modifié
                const isModified = isTarifModified(tarif.id);

                return (
                  <TableRow
                    key={tarif.id}
                    className={`${
                      isLastOfSurface ? "border-b-2 border-gray-300" : ""
                    } ${
                      tarif.gamme === "essentiel"
                        ? "bg-fm4allessential/5"
                        : tarif.gamme === "confort"
                          ? "bg-fm4allcomfort/5"
                          : "bg-fm4allexcellence/5"
                    } ${isModified ? "bg-amber-50" : ""} ${
                      !tarif.hParPassage || !tarif.tauxHoraire
                        ? "border-2 border-red-500"
                        : ""
                    }`}
                  >
                    <TableCell className="font-medium">
                      {tarif.surface}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span
                        className={
                          tarif.gamme === "essentiel"
                            ? "text-fm4allessential font-bold"
                            : tarif.gamme === "confort"
                              ? "text-fm4allcomfort font-bold"
                              : "text-fm4allexcellence font-bold"
                        }
                      >
                        {tarif.gamme}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {freqAnnuelle}
                    </TableCell>
                    <TableCell className="font-medium">
                      {typeof freqAnnuelle === "number"
                        ? Math.round(
                            tarif.tauxHoraire * tarif.hParPassage * freqAnnuelle
                          )
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {Math.round(tarif.surface / tarif.hParPassage)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.05"
                        min={0}
                        value={tarif.hParPassage || ""}
                        onChange={(e) =>
                          handleInputChange(e, tarif.id, "hParPassage")
                        }
                        className={`w-24 ${isModified ? "border-amber-500" : ""}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={tarif.tauxHoraire || ""}
                        onChange={(e) =>
                          handleInputChange(e, tarif.id, "tauxHoraire")
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
  );
}
