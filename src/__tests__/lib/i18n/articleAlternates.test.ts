import { describe, expect, it } from "vitest";

import { localeParams } from "@/i18n/routing";
import {
  articleSlugsParLocale,
  categorieSlugsParLocale,
} from "@/lib/i18n/articleAlternates";

/**
 * Les slugs d'un article dans les deux langues : Sanity d'abord, la table
 * manuelle en repli. Régression : « Fire Safety », 2026-11-02 — l'article
 * manquait dans la table, le bouton de langue gardait le slug anglais sous
 * /fr/ et la page servait le contenu anglais habillé en français.
 */
describe("articleSlugsParLocale", () => {
  const jumelles = [
    {
      locale: "fr",
      slug: "securite-incendie",
      subSlug: "securite-incendie-erp-conformite-ia",
    },
    {
      locale: "en",
      slug: "fire-safety",
      subSlug: "fire-safety-erp-compliance-ai",
    },
  ];

  it("prend la jumelle Sanity pour l'autre langue, et l'URL courante telle quelle", () => {
    expect(
      articleSlugsParLocale(
        "en",
        "fire-safety",
        "fire-safety-erp-compliance-ai",
        jumelles,
      ),
    ).toEqual({
      en: { slug: "fire-safety", subSlug: "fire-safety-erp-compliance-ai" },
      fr: {
        slug: "securite-incendie",
        subSlug: "securite-incendie-erp-conformite-ia",
      },
    });
  });

  it("Sanity l'emporte sur la table quand les deux répondent", () => {
    // « nettoyage » est dans la table (→ cleaning-services) ; une jumelle
    // Sanity différente doit gagner, c'est elle la source de vérité.
    const result = articleSlugsParLocale("fr", "nettoyage", "x", [
      { locale: "en", slug: "office-cleaning", subSlug: "y" },
    ]);
    expect(result.en).toEqual({ slug: "office-cleaning", subSlug: "y" });
  });

  it("retombe sur la table manuelle sans jumelle Sanity", () => {
    const result = articleSlugsParLocale(
      "fr",
      "nettoyage",
      "histoire-du-nettoyage-des-bureaux",
      null,
    );
    expect(result.en).toEqual({
      slug: "cleaning-services",
      subSlug: "history-of-office-cleaning",
    });
  });

  it("sans Sanity ni table, garde le slug tel quel plutôt que d'inventer", () => {
    const result = articleSlugsParLocale("fr", "inconnu", "article-inconnu", []);
    expect(result.en).toEqual({ slug: "inconnu", subSlug: "article-inconnu" });
  });

  it("ignore une jumelle incomplète (slug sans sous-slug)", () => {
    const result = articleSlugsParLocale("en", "fire-safety", "x", [
      { locale: "fr", slug: "securite-incendie", subSlug: null },
    ]);
    // repli table : « fire-safety » y est, « x » non
    expect(result.fr).toEqual({ slug: "securite-incendie", subSlug: "x" });
  });
});

describe("categorieSlugsParLocale", () => {
  it("prend la jumelle Sanity quand elle est dans l'autre langue", () => {
    expect(
      categorieSlugsParLocale("en", "fire-safety", {
        locale: "fr",
        slug: "securite-incendie",
      }),
    ).toEqual({ en: "fire-safety", fr: "securite-incendie" });
  });

  it("ignore une jumelle de la même langue et retombe sur la table", () => {
    expect(
      categorieSlugsParLocale("fr", "nettoyage", {
        locale: "fr",
        slug: "nettoyage",
      }),
    ).toEqual({ fr: "nettoyage", en: "cleaning-services" });
  });
});

describe("localeParams", () => {
  it("rend les mêmes params, locale rétrécie", async () => {
    const params = Promise.resolve({ slug: "a", subSlug: "b", locale: "en" });
    await expect(localeParams(params)).resolves.toEqual({
      slug: "a",
      subSlug: "b",
      locale: "en",
    });
  });
});
