import { sanitizeText } from "@/lib/utils/sanitizeText";
import { describe, expect, it } from "vitest";

describe("sanitizeText", () => {
  it("remplace les espaces insécables par des espaces normaux", () => {
    const input = "Bonjour\u00A0le\u202Fmonde";
    const output = sanitizeText(input);
    expect(output).toBe("Bonjour le monde");
  });

  it("supprime les accents et diacritiques", () => {
    const input = "Éléphant naïf à l’ombre";
    const output = sanitizeText(input);
    expect(output).toBe("Elephant naif a l’ombre");
  });

  it("gère une combinaison d’espaces spéciaux et d’accents", () => {
    const input = "Société\u00A0Générale – été à l’île";
    const output = sanitizeText(input);
    expect(output).toBe("Societe Generale – ete a l’ile");
  });

  it("ne modifie pas un texte déjà simple", () => {
    const input = "Texte simple sans accent";
    const output = sanitizeText(input);
    expect(output).toBe("Texte simple sans accent");
  });

  it("gère les caractères combinés Unicode", () => {
    const input = "e\u0301galite\u0301"; // égalité avec accents combinés
    const output = sanitizeText(input);
    expect(output).toBe("egalite");
  });
});
