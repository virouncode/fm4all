export const sanitizeText = (text: string) => {
  // Remplacer les espaces insécables par des espaces normaux
  return text
    .replace(/\u202F/g, " ")
    .replace(/\u00A0/g, " ") // Remplace aussi les espaces insécables HTML
    .normalize("NFKD") // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, ""); // Supprime les diacritiques
};
