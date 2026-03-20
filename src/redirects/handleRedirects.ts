import { LocaleType } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import {
  articlesSlugMappingsFrToEn,
  articlesSubSlugMappingsFrToEn,
  getArticlesSlugEn,
  getArticlesSlugFr,
  getArticlesSubSlugEn,
  getArticlesSubSlugFr,
} from "./articlesSlugMappings";
import {
  isEnglishSlug,
  isEnglishSubSlug,
  isFrenchSlug,
  isFrenchSubSlug,
} from "./isEnglishSlug";
import {
  getSecteurSlugEn,
  getSecteurSlugFr,
  secteursSlugMappingsFrToEn,
} from "./secteursSlugMappings";
import {
  getServicesSlugEn,
  getServicesSlugFr,
  getServicesSubSlugEn,
  getServicesSubSlugFr,
  servicesSlugMappingsFrToEn,
  servicesSubSlugMappingsFrToEn,
} from "./servicesSlugMappings";

export const handleArticleRedirects = (
  req: NextRequest,
  pathSegments: string[],
  locale: LocaleType,
): NextResponse | null => {
  if (
    (pathSegments[0] !== "articles" && pathSegments[0] !== "posts") ||
    pathSegments.length < 2
  ) {
    return null;
  }
  const basePath = locale === "fr" ? "/articles/" : "/posts/";
  const slug = pathSegments[1];
  const subSlug = pathSegments.length >= 3 ? pathSegments[2] : null;

  if (subSlug) {
    // /articles/[slug]/[subSlug]
    const isPossibleSlug =
      isEnglishSlug(slug, articlesSlugMappingsFrToEn) ||
      isFrenchSlug(slug, articlesSlugMappingsFrToEn);
    if (!isPossibleSlug) return null; //Le slug principal ne correspond à aucun slug connu, on laisse passer pour gérer le 404 plus tard
    const isPossibleSubSlug =
      isEnglishSubSlug(subSlug, articlesSubSlugMappingsFrToEn) ||
      isFrenchSubSlug(subSlug, articlesSubSlugMappingsFrToEn);
    if (!isPossibleSubSlug) return null; //Le sous-slug ne correspond à aucun slug connu, on laisse passer pour gérer le 404 plus tard
    const isCorrectSlug =
      locale === "fr"
        ? !isEnglishSlug(slug, articlesSlugMappingsFrToEn)
        : isEnglishSlug(slug, articlesSlugMappingsFrToEn);
    const isCorrectSubSlug =
      locale === "fr"
        ? !isEnglishSubSlug(subSlug, articlesSubSlugMappingsFrToEn)
        : isEnglishSubSlug(subSlug, articlesSubSlugMappingsFrToEn);
    if (isCorrectSlug && isCorrectSubSlug) return null; //Tout est correct, on ne fait pas de redirection
    //Soit le slug principal est incorrect, soit le sous-slug est incorrect, soit les deux sont incorrects
    const correctSlug =
      locale === "fr" ? getArticlesSlugFr(slug) : getArticlesSlugEn(slug);
    const correctSubSlug =
      locale === "fr"
        ? getArticlesSubSlugFr(subSlug)
        : getArticlesSubSlugEn(subSlug);
    const newPath = `/${locale}${basePath}${correctSlug}/${correctSubSlug}`;
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  } // /articles/[slug]
  else {
    const isPossibleSlug =
      isEnglishSlug(slug, articlesSlugMappingsFrToEn) ||
      isFrenchSlug(slug, articlesSlugMappingsFrToEn);
    if (!isPossibleSlug) return null; //Le slug principal ne correspond à aucun slug connu, on laisse passer pour gérer le 404 plus tard
    const isCorrectSlug =
      locale === "fr"
        ? !isEnglishSlug(slug, articlesSlugMappingsFrToEn)
        : isEnglishSlug(slug, articlesSlugMappingsFrToEn);
    if (isCorrectSlug) return null; //Tout est correct, on ne fait pas de redirection
    //Le slug principal est incorrect, on redirige vers le bon slug
    const correctSlug =
      locale === "fr" ? getArticlesSlugFr(slug) : getArticlesSlugEn(slug);
    const newPath = `/${locale}${basePath}${correctSlug}`;
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }
};

export const handleServiceRedirects = (
  req: NextRequest,
  pathSegments: string[],
  locale: LocaleType,
): NextResponse | null => {
  if (pathSegments[0] !== "services" || pathSegments.length < 2) {
    return null; // Pas un service, on ne fait rien
  }

  const basePath = "/services/";
  const slug = pathSegments[1];
  const subSlug = pathSegments.length >= 3 ? pathSegments[2] : null;

  ///services/[slug]/[subSlug]
  if (subSlug) {
    const isPossibleSlug =
      isEnglishSlug(slug, servicesSlugMappingsFrToEn) ||
      isFrenchSlug(slug, servicesSlugMappingsFrToEn);
    if (!isPossibleSlug) return null; //Le slug principal ne correspond à aucun slug connu, on laisse passer pour gérer le 404 plus tard
    const isPossibleSubSlug =
      isEnglishSubSlug(subSlug, servicesSubSlugMappingsFrToEn) ||
      isFrenchSubSlug(subSlug, servicesSubSlugMappingsFrToEn);
    if (!isPossibleSubSlug) return null; //Le sous-slug ne correspond à aucun slug connu, on laisse passer pour gérer le 404 plus tard
    const isCorrectSlug =
      locale === "fr"
        ? !isEnglishSlug(slug, servicesSlugMappingsFrToEn)
        : isEnglishSlug(slug, servicesSlugMappingsFrToEn);
    const isCorrectSubSlug =
      locale === "fr"
        ? !isEnglishSubSlug(subSlug, servicesSubSlugMappingsFrToEn)
        : isEnglishSubSlug(subSlug, servicesSubSlugMappingsFrToEn);
    if (isCorrectSlug && isCorrectSubSlug) return null; //Tout est correct, on ne fait pas de redirection
    //Soit le slug principal est incorrect, soit le sous-slug est incorrect, soit les deux sont incorrects
    const correctSlug =
      locale === "fr" ? getServicesSlugFr(slug) : getServicesSlugEn(slug);
    const correctSubSlug =
      locale === "fr"
        ? getServicesSubSlugFr(subSlug)
        : getServicesSubSlugEn(subSlug);
    const newPath = `/${locale}${basePath}${correctSlug}/${correctSubSlug}`;
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  } //services/[slug]
  else {
    const isPossibleSlug =
      isEnglishSlug(slug, servicesSlugMappingsFrToEn) ||
      isFrenchSlug(slug, servicesSlugMappingsFrToEn);
    if (!isPossibleSlug) return null; //Le slug principal ne correspond à aucun slug connu, on laisse passer pour gérer le 404 plus tard
    const isCorrectSlug =
      locale === "fr"
        ? !isEnglishSlug(slug, servicesSlugMappingsFrToEn)
        : isEnglishSlug(slug, servicesSlugMappingsFrToEn);
    if (isCorrectSlug) return null; //Tout est correct, on ne fait pas de redirection
    //Le slug principal est incorrect, on redirige vers le bon slug
    const correctSlug =
      locale === "fr" ? getServicesSlugFr(slug) : getServicesSlugEn(slug);
    const newPath = `/${locale}${basePath}${correctSlug}`;
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }
};

export const handleSecteurRedirects = (
  req: NextRequest,
  pathSegments: string[],
  locale: LocaleType,
): NextResponse | null => {
  if (
    (pathSegments[0] !== "secteurs" && pathSegments[0] !== "sectors") ||
    pathSegments.length < 2
  ) {
    return null;
  }

  const slug = pathSegments[1];
  const basePath = locale === "fr" ? "/secteurs/" : "/sectors/";

  const isPossibleSlug =
    isEnglishSlug(slug, secteursSlugMappingsFrToEn) ||
    isFrenchSlug(slug, secteursSlugMappingsFrToEn);

  if (!isPossibleSlug) return null;

  const isCorrectSlug =
    locale === "fr"
      ? !isEnglishSlug(slug, secteursSlugMappingsFrToEn)
      : isEnglishSlug(slug, secteursSlugMappingsFrToEn);

  if (isCorrectSlug) return null; //Tout est correct, on ne fait pas de redirection

  const correctSlug =
    locale === "fr" ? getSecteurSlugFr(slug) : getSecteurSlugEn(slug);
  const newPath = `/${locale}${basePath}${correctSlug}`;
  return NextResponse.redirect(new URL(newPath, req.url), 301);
};
