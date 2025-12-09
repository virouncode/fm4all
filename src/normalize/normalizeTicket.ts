import { capitalize } from "@/lib/utils/capitalize";
import { InsertTicketType, UpdateTicketType } from "@/zod-schemas/ticket";
import { emptyToNull } from "./normalize";
/*eslint-disable @typescript-eslint/no-explicit-any */

export type TicketInput = InsertTicketType | UpdateTicketType;

export function normalizeTicketForDb<T extends TicketInput>(input: T): T {
  const t: any = { ...input };

  if (t.titre) {
    t.titre = capitalize(t.titre.trim());
  }

  // --- DESCRIPTION (optionnelle) ---
  t.description = emptyToNull(t.description);

  // --- CATEGORIE / PRIORITE / STATUS ---
  // (déjà validés par enum Zod → juste trim par sécurité)
  if (t.categorie) t.categorie = t.categorie.trim();
  if (t.priorite) t.priorite = t.priorite.trim();
  if (t.status) t.status = t.status.trim();

  // --- DATE CLOTURE (optionnelle) ---
  if (t.dateCloture != null) {
    const d = t.dateCloture.trim();
    t.dateCloture = d === "" ? null : d;
  }

  // --- COMMENTAIRES / CHAMPS POTENTIELLEMENT FUTURS ---
  // Pas de champs supplémentaires ici, mais on applique la même règle si ajout

  return t as T;
}
