import { LocaleType } from "@/i18n/routing";
import {
  getArticlesSlugEn,
  getArticlesSlugFr,
  getArticlesSubSlugEn,
  getArticlesSubSlugFr,
} from "@/redirects/articlesSlugMappings";

/** Une jumelle telle que Sanity la renvoie (`translation.metadata`). */
export type ArticleJumelleType = {
  locale: string | null;
  slug: string | null;
  subSlug: string | null;
};

export type ArticleSlugsParLocaleType = Record<
  LocaleType,
  { slug: string; subSlug: string }
>;

/**
 * Les slugs d'un article dans les deux langues : Sanity d'abord, la table
 * manuelle en repli pour la langue que Sanity ne connaît pas.
 *
 * Fonction pure : la page la nourrit, le bouton de langue et les hreflang la
 * consomment. Sans ce domicile unique, chacun retraduisait l'URL de son côté
 * (bouton, metadata, sitemap, middleware) avec la même table, et un article
 * absent de la table servait le contenu de l'autre langue (2026-11-02).
 */
export function articleSlugsParLocale(
  locale: LocaleType,
  slug: string,
  subSlug: string,
  jumelles: ArticleJumelleType[] | null | undefined,
): ArticleSlugsParLocaleType {
  const depuisSanity = (l: LocaleType) => {
    const j = jumelles?.find((x) => x.locale === l);
    return j?.slug && j?.subSlug ? { slug: j.slug, subSlug: j.subSlug } : null;
  };
  const courant = { slug, subSlug };
  return {
    fr:
      locale === "fr"
        ? courant
        : (depuisSanity("fr") ?? {
            slug: getArticlesSlugFr(slug),
            subSlug: getArticlesSubSlugFr(subSlug),
          }),
    en:
      locale === "en"
        ? courant
        : (depuisSanity("en") ?? {
            slug: getArticlesSlugEn(slug),
            subSlug: getArticlesSubSlugEn(subSlug),
          }),
  };
}

/** Même chose pour une catégorie d'articles (un seul slug). */
export function categorieSlugsParLocale(
  locale: LocaleType,
  slug: string,
  jumelle: { locale: string | null; slug: string | null } | null | undefined,
): Record<LocaleType, string> {
  const autre: LocaleType = locale === "fr" ? "en" : "fr";
  const depuisSanity =
    jumelle?.locale === autre && jumelle.slug ? jumelle.slug : null;
  const repli = autre === "fr" ? getArticlesSlugFr(slug) : getArticlesSlugEn(slug);
  return {
    [locale]: slug,
    [autre]: depuisSanity ?? repli,
  } as Record<LocaleType, string>;
}
