import { formatSIRET } from "@/lib/utils/isValidSIRET";
import {
  InsertClientType,
  UpdateClientType,
} from "@/zod-schemas/client.schema";
import {
  emptyToNull,
  normalizeCapitalized,
  normalizeEmail,
  normalizeUpper,
} from "./normalize";

/*eslint-disable @typescript-eslint/no-explicit-any */

type ClientInputType = InsertClientType | UpdateClientType;
export function normalizeClient<T extends ClientInputType>(input: T): T {
  const clone: any = { ...input };

  // --- Champs obligatoires / non-nullables ---

  if (clone.nomEntreprise) {
    clone.nomEntreprise = normalizeUpper(clone.nomEntreprise);
  }

  if (clone.prenomContact) {
    clone.prenomContact = normalizeCapitalized(clone.prenomContact);
  }

  if (clone.nomContact) {
    clone.nomContact = normalizeCapitalized(clone.nomContact);
  }

  if (clone.posteContact) {
    clone.posteContact = normalizeCapitalized(clone.posteContact);
  }

  if (clone.emailContact) {
    clone.emailContact = normalizeEmail(clone.emailContact);
  }

  if (clone.phoneContact) {
    // phoneNumberSchema normalise déjà en E.164, on fait juste un trim sécurité
    clone.phoneContact = clone.phoneContact.trim();
  }

  // --- SIRET (nullable) ---
  clone.siret = emptyToNull(clone.siret);
  if (clone.siret) {
    clone.siret = formatSIRET(clone.siret);
  }

  // --- Signataire (tous nullable en DB) ---
  clone.prenomSignataire = normalizeCapitalized(clone.prenomSignataire);
  clone.nomSignataire = normalizeCapitalized(clone.nomSignataire);
  clone.posteSignataire = normalizeCapitalized(clone.posteSignataire);
  clone.emailSignataire = normalizeEmail(clone.emailSignataire);

  // --- Adresse & ville (nullable sauf ville) ---
  clone.adresseLigne1 = normalizeCapitalized(clone.adresseLigne1);
  clone.adresseLigne2 = normalizeCapitalized(clone.adresseLigne2);
  if (clone.ville) {
    clone.ville = normalizeCapitalized(clone.ville);
  }

  // --- Commentaires (nullable) ---
  clone.commentaires = emptyToNull(clone.commentaires);

  // --- Code postal ---
  // Déjà normalisé par codePostalSchema (trim + remove spaces/dashes), on ne touche pas

  // --- Date de démarrage (nullable) ---
  // Si jamais tu la passes via un input texte, on peut sécuriser le empty string -> null
  if (typeof clone.dateDeDemarrage === "string") {
    clone.dateDeDemarrage =
      clone.dateDeDemarrage.trim() === "" ? null : clone.dateDeDemarrage;
  }

  return clone as T;
}
