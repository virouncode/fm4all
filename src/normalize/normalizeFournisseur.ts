import { formatSIRET } from "@/lib/utils/isValidSIRET";
import {
  InsertFournisseurType,
  UpdateFournisseurType,
} from "@/zod-schemas/fournisseur";
import {
  emptyToNull,
  normalizeCapitalized,
  normalizeEmail,
  normalizeUpper,
  toIntOrNull,
} from "./normalize";

type FournisseurInput = InsertFournisseurType | UpdateFournisseurType;

export function normalizeFournisseur<T extends FournisseurInput>(input: T): T {
  const clone: any = { ...input };

  // --- Champs obligatoires ---
  if (clone.nomFournisseur) {
    clone.nomFournisseur = normalizeUpper(clone.nomFournisseur);
  }

  if (clone.prenomContact) {
    clone.prenomContact = normalizeCapitalized(clone.prenomContact);
  }

  if (clone.nomContact) {
    clone.nomContact = normalizeCapitalized(clone.nomContact);
  }

  if (clone.emailContact) {
    clone.emailContact = normalizeEmail(clone.emailContact);
  }

  if (clone.phoneContact) {
    // déjà normalisé par phoneNumberSchema en E.164
    clone.phoneContact = clone.phoneContact.trim();
  }

  // --- SIRET (NOT NULL en DB) ---
  if (clone.siret) {
    clone.siret = formatSIRET(clone.siret);
  }

  // --- Champs optionnels texte ---
  clone.slogan = emptyToNull(clone.slogan);
  clone.presentation = emptyToNull(clone.presentation);
  clone.logoUrl = emptyToNull(clone.logoUrl);
  clone.locationUrl = emptyToNull(clone.locationUrl);

  // --- Note Google (varchar en DB) ---
  // string/""/null → string normalisée ou null
  if (clone.noteGoogle != null) {
    const raw = clone.noteGoogle.trim();
    if (raw === "") {
      clone.noteGoogle = null;
    } else {
      // remplacer virgule par point pour homogénéiser
      clone.noteGoogle = raw.replace(",", ".");
    }
  }
  clone.anneeCreation = toIntOrNull(clone.anneeCreation);
  clone.nbClients = toIntOrNull(clone.nbClients);
  clone.nbAvis = toIntOrNull(clone.nbAvis);

  return clone as T;
}
