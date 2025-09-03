export const isValidLuhn = (input: string) => {
  let sum = 0;
  let alt = false;
  for (let i = input.length - 1; i >= 0; i--) {
    let n = parseInt(input[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

export const isValidSIRET = (input: string) => {
  // Autoriser uniquement chiffres + espaces
  if (!/^[\d\s]+$/.test(input)) return false;

  const digits = input.replace(/\s/g, "");
  if (digits.length !== 14) return false;

  // Vérifie que le numéro passe le test de Luhn
  return isValidLuhn(digits);
};

export const formatSIRET = (input: string) => {
  // Nettoyer les espaces en début/fin
  const cleaned = input.trim();

  // Vérifier qu'on a bien 14 chiffres et rien d'autre
  if (!/^\d{14}$/.test(cleaned)) {
    return cleaned;
  }

  // Formater le SIRET : xxx xxx xxx xxxxx
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
};
