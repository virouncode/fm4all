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
  locale: string,
): NextResponse | null => {
  if (
    (pathSegments[0] !== "articles" && pathSegments[0] !== "posts") ||
    pathSegments.length < 2
  ) {
    return null;
  }
  const slug = pathSegments[1];
  const basePath = locale === "fr" ? "/articles/" : "/posts/";
  const subSlug = pathSegments.length >= 3 ? pathSegments[2] : null;

  const isPossibleSlug =
    isEnglishSlug(slug, articlesSlugMappingsFrToEn) ||
    isFrenchSlug(slug, articlesSlugMappingsFrToEn);

  const isPossibleSubSlug = subSlug
    ? isEnglishSubSlug(subSlug, articlesSubSlugMappingsFrToEn) ||
      isFrenchSubSlug(subSlug, articlesSubSlugMappingsFrToEn)
    : true;

  if (!isPossibleSlug && !isPossibleSubSlug) return null;

  // Vérifier si le slug principal est correct pour la locale
  const isCorrectSlug =
    locale === "fr"
      ? !isEnglishSlug(slug, articlesSlugMappingsFrToEn)
      : isEnglishSlug(slug, articlesSlugMappingsFrToEn);

  // Si le slug principal est incorrect, rediriger
  if (!isCorrectSlug) {
    const correctSlug =
      locale === "fr" ? getArticlesSlugFr(slug) : getArticlesSlugEn(slug);
    const newPath = `/${locale}${basePath}${correctSlug}`;
    if (subSlug) {
      const isCorrectSubSlug =
        locale === "fr"
          ? !isEnglishSubSlug(subSlug, articlesSubSlugMappingsFrToEn)
          : isEnglishSubSlug(subSlug, articlesSubSlugMappingsFrToEn);
      const correctSubSlug = isCorrectSubSlug
        ? subSlug
        : locale === "fr"
          ? getArticlesSubSlugFr(subSlug)
          : getArticlesSubSlugEn(subSlug);

      return NextResponse.redirect(
        new URL(`${newPath}/${correctSubSlug}`, req.url),
        301,
      );
    }
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }

  // Si le slug principal est correct mais qu'on a un sous-slug incorrect
  if (isCorrectSlug && subSlug) {
    const isCorrectSubSlug =
      locale === "fr"
        ? !isEnglishSubSlug(subSlug, articlesSubSlugMappingsFrToEn)
        : isEnglishSubSlug(subSlug, articlesSubSlugMappingsFrToEn);

    if (!isCorrectSubSlug) {
      const correctSubSlug =
        locale === "fr"
          ? getArticlesSubSlugFr(subSlug)
          : getArticlesSubSlugEn(subSlug);

      return NextResponse.redirect(
        new URL(`/${locale}${basePath}${slug}/${correctSubSlug}`, req.url),
        301,
      );
    }
  }
  // Tout est correct, on ne fait pas de redirection
  return null;
};

export const handleServiceRedirects = (
  req: NextRequest,
  pathSegments: string[],
  locale: string,
): NextResponse | null => {
  if (pathSegments[0] !== "services" || pathSegments.length < 2) {
    return null; // Pas un service, on ne fait rien
  }

  const slug = pathSegments[1];
  const basePath = "/services/";
  const subSlug = pathSegments.length >= 3 ? pathSegments[2] : null;

  const isPossibleSlug =
    isEnglishSlug(slug, servicesSlugMappingsFrToEn) ||
    isFrenchSlug(slug, servicesSlugMappingsFrToEn);
  if (!isPossibleSlug) return null;

  const isPossibleSubSlug = subSlug
    ? isEnglishSubSlug(subSlug, servicesSubSlugMappingsFrToEn) ||
      isFrenchSubSlug(subSlug, servicesSubSlugMappingsFrToEn)
    : true;

  if (!isPossibleSlug && !isPossibleSubSlug) return null;

  const isCorrectSlug =
    locale === "fr"
      ? !isEnglishSlug(slug, servicesSlugMappingsFrToEn)
      : isEnglishSlug(slug, servicesSlugMappingsFrToEn);
  if (!isCorrectSlug) {
    const correctSlug =
      locale === "fr" ? getServicesSlugFr(slug) : getServicesSlugEn(slug);
    const newPath = `/${locale}${basePath}${correctSlug}`;
    if (subSlug) {
      const isCorrectSubSlug =
        locale === "fr"
          ? !isEnglishSubSlug(subSlug, servicesSubSlugMappingsFrToEn)
          : isEnglishSubSlug(subSlug, servicesSubSlugMappingsFrToEn);
      const correctSubSlug = isCorrectSubSlug
        ? subSlug
        : locale === "fr"
          ? getServicesSubSlugFr(subSlug)
          : getServicesSubSlugEn(subSlug);

      return NextResponse.redirect(
        new URL(`${newPath}/${correctSubSlug}`, req.url),
        301,
      );
    }

    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }
  // Si le slug principal est correct mais qu'on a un sous-slug incorrect
  if (isCorrectSlug && subSlug) {
    const isCorrectSubSlug =
      locale === "fr"
        ? !isEnglishSubSlug(subSlug, servicesSubSlugMappingsFrToEn)
        : isEnglishSubSlug(subSlug, servicesSubSlugMappingsFrToEn);
    if (!isCorrectSubSlug) {
      const correctSubSlug =
        locale === "fr"
          ? getServicesSubSlugFr(subSlug)
          : getServicesSubSlugEn(subSlug);
      return NextResponse.redirect(
        new URL(`/${locale}${basePath}${slug}/${correctSubSlug}`, req.url),
        301,
      );
    }
  }
  // Tout est correct, on ne fait pas de redirection
  return null;
};

export const handleSecteurRedirects = (
  req: NextRequest,
  pathSegments: string[],
  locale: string,
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

  if (!isCorrectSlug) {
    const correctSlug =
      locale === "fr" ? getSecteurSlugFr(slug) : getSecteurSlugEn(slug);
    const newPath = `/${locale}${basePath}${correctSlug}`;
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }
  return null;
};
