import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  articlesSlugMappingsFrToEn,
  articlesSubSlugMappingsFrToEn,
  getArticlesSlugEn,
  getArticlesSlugFr,
  getArticlesSubSlugEn,
  getArticlesSubSlugFr,
} from "./i18n/articlesSlugMappings";
import { routing } from "./i18n/routing";
import {
  getSecteurSlugEn,
  getSecteurSlugFr,
  secteursSlugMappingsFrToEn,
} from "./i18n/secteursSlugMappings";
import {
  getServicesSlugEn,
  getServicesSlugFr,
  servicesSlugMappingsFrToEn,
} from "./i18n/servicesSlugMappings";
import {
  getTagSlugEn,
  getTagSlugFr,
  tagsSlugMappingsFrToEn,
} from "./i18n/tagsSlugMappings";
import {
  getLocaleFromPathname,
  getPathnameWithoutLocale,
} from "./lib/metadata/metadata-helpers";

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const fullUrl = req.nextUrl.href;
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const locale = getLocaleFromPathname(pathname);

  console.log("pathname:", pathname);
  console.log("fullUrl:", fullUrl);
  console.log("pathnameWithoutLocale:", pathnameWithoutLocale);
  console.log("locale:", locale);

  //REDIRECTIONS DES ANCIENNES URLS
  if (goneUrls.includes(fullUrl) || goneUrls.includes(pathname)) {
    return new NextResponse(null, { status: 410 });
  }
  if (pathname.match(/\/(fr|en)\/tag\/\[tag\]$/)) {
    return new NextResponse(null, { status: 410 });
  }
  if (legacyRedirects[pathname]) {
    return NextResponse.redirect(
      new URL(legacyRedirects[pathname], req.url),
      301
    );
  }

  //Si pas de locale
  if (!locale) return intlMiddleware(req);
  //Si locale mais route publique
  if (
    !pathnameWithoutLocale.startsWith("/admin") &&
    !pathnameWithoutLocale.startsWith("/client") &&
    !pathnameWithoutLocale.startsWith("/fournisseur")
  ) {
    //REDIRECTION 301 si route hybride
    const pathSegments = pathnameWithoutLocale.split("/").filter(Boolean);
    //BLOG
    const articleRedirect = handleArticleRedirects(req, pathSegments, locale);
    if (articleRedirect) return articleRedirect;
    //SERVICES
    const serviceRedirect = handleServiceRedirects(req, pathSegments, locale);
    if (serviceRedirect) return serviceRedirect;
    //SECTEURS
    const secteurRedirect = handleSecteurRedirects(req, pathSegments, locale);
    if (secteurRedirect) return secteurRedirect;
    //TAGS
    const tagRedirect = handleTagRedirects(req, pathSegments, locale);
    if (tagRedirect) return tagRedirect;
    //SINON, on continue avec le middleware intl
    return intlMiddleware(req);
  }

  //SESSION
  let session;
  let user;

  try {
    const sessionResponse = await fetch(
      `${req.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      }
    );

    if (!sessionResponse.ok) {
      console.error(
        "Erreur lors de la récupération de la session:",
        sessionResponse.status
      );
      // Continuer sans session
    } else {
      const sessionData = await sessionResponse.json();
      session = sessionData?.session;
      user = sessionData?.user;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la session:", error);
    // Continuer sans session
  }

  //Si pas de session
  if (!session) {
    return NextResponse.redirect(new URL(`/${locale}/auth/signin`, req.url));
  }
  //Si session et role invalide
  if (session && user) {
    switch (user.role) {
      case "admin":
        if (pathnameWithoutLocale.startsWith("/client"))
          return NextResponse.redirect(
            new URL(`/${locale}/auth/unauthorized?type=client`, req.url)
          );
        if (pathnameWithoutLocale.startsWith("/fournisseur")) {
          return NextResponse.redirect(
            new URL(`/${locale}/auth/unauthorized?type=fournisseur`, req.url)
          );
        }
        //Récupérer le adminId dans les params
        const adminId = pathnameWithoutLocale.split("/")[2];
        if (adminId && parseInt(adminId) !== user.id) {
          return NextResponse.redirect(
            new URL(`/${locale}/auth/unauthorized?type=admin`, req.url)
          );
        }
        break;
      case "client":
        if (pathnameWithoutLocale.startsWith("/admin"))
          return NextResponse.redirect(
            new URL(`/${locale}/auth/unauthorized?type=admin`, req.url)
          );
        if (pathnameWithoutLocale.startsWith("/fournisseur"))
          return NextResponse.redirect(
            new URL(`/${locale}/auth/unauthorized?type=fournisseur`, req.url)
          );
        const clientId = pathnameWithoutLocale.split("/")[2];
        if (clientId && parseInt(clientId) !== user.clientId) {
          return NextResponse.redirect(
            new URL(`/${locale}/auth/unauthorized?type=client`, req.url)
          );
        }
        break;

      case "fournisseur":
        if (pathnameWithoutLocale.startsWith("/admin"))
          return NextResponse.redirect(
            new URL(`/${locale}/auth/unauthorized?type=admin`, req.url)
          );
        if (pathnameWithoutLocale.startsWith("/client"))
          return NextResponse.redirect(
            new URL(`/${locale}/auth/unauthorized?type=client`, req.url)
          );
        const fournisseurId = pathnameWithoutLocale.split("/")[2];

        if (fournisseurId && parseInt(fournisseurId) !== user.fournisseurId) {
          return NextResponse.redirect(
            new URL(`/${locale}/auth/unauthorized?type=fournisseur`, req.url)
          );
        }
        break;
      default:
        return NextResponse.redirect(
          new URL(`/${locale}/auth/unauthorized`, req.url)
        );
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};

//CORS

// const allowedOrigins =
//   process.env.NODE_ENV === "production"
//     ? [process.env.APP_URL]
//     : ["http://localhost:3000"];
// const origin = req.headers.get("origin");
// console.log("headers:", req.headers);
// console.log("origin:", origin);

// //Pour mes calls à mes APIs
// if (origin && allowedOrigins.includes(origin)) {
//   console.log("allowed origin");
//   const response = NextResponse.next(); //
//   response.headers.set("Access-Control-Allow-Origin", origin);
//   response.headers.set("Content-Type", "application/json");
//   response.headers.set("Access-Control-Allow-Methods", "GET");
//   return response;
// }

function isEnglishArticleSlug(slug: string): boolean {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug anglais, false sinon
  const frenchSlugs = Object.keys(articlesSlugMappingsFrToEn);
  const englishSlugs = Object.values(articlesSlugMappingsFrToEn);
  return englishSlugs.includes(slug) && !frenchSlugs.includes(slug);
}

function isEnglishArticleSubSlug(subSlug: string): boolean {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug anglais, false sinon
  const frenchSubSlugs = Object.keys(articlesSubSlugMappingsFrToEn);
  const englishSubSlugs = Object.values(articlesSubSlugMappingsFrToEn);
  return englishSubSlugs.includes(subSlug) && !frenchSubSlugs.includes(subSlug);
}

function handleArticleRedirects(
  req: NextRequest,
  pathSegments: string[],
  locale: string
): NextResponse | null {
  if (
    (pathSegments[0] !== "articles" && pathSegments[0] !== "posts") ||
    pathSegments.length < 2
  ) {
    return null; // Pas un article, on ne fait rien
  }

  const slug = pathSegments[1];
  const basePath = locale === "fr" ? "/articles/" : "/posts/";
  const subSlug = pathSegments.length >= 3 ? pathSegments[2] : null;

  // Vérifier si le slug principal est correct pour la locale
  const isCorrectSlug =
    locale === "fr" ? !isEnglishArticleSlug(slug) : isEnglishArticleSlug(slug);

  // Si le slug principal est incorrect, rediriger
  if (!isCorrectSlug) {
    const correctSlug =
      locale === "fr" ? getArticlesSlugFr(slug) : getArticlesSlugEn(slug);
    const newPath = `/${locale}${basePath}${correctSlug}`;

    // Si on a un sous-slug, vérifier s'il est correct et l'ajouter au chemin
    if (subSlug) {
      const isCorrectSubSlug =
        locale === "fr"
          ? !isEnglishArticleSubSlug(subSlug)
          : isEnglishArticleSubSlug(subSlug);

      const correctSubSlug = isCorrectSubSlug
        ? subSlug
        : locale === "fr"
          ? getArticlesSubSlugFr(subSlug)
          : getArticlesSubSlugEn(subSlug);

      return NextResponse.redirect(
        new URL(`${newPath}/${correctSubSlug}`, req.url),
        301
      );
    }

    // Sinon, rediriger juste avec le slug principal corrigé
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }

  // Si le slug principal est correct mais qu'on a un sous-slug incorrect
  if (isCorrectSlug && subSlug) {
    const isCorrectSubSlug =
      locale === "fr"
        ? !isEnglishArticleSubSlug(subSlug)
        : isEnglishArticleSubSlug(subSlug);

    if (!isCorrectSubSlug) {
      const correctSubSlug =
        locale === "fr"
          ? getArticlesSubSlugFr(subSlug)
          : getArticlesSubSlugEn(subSlug);

      return NextResponse.redirect(
        new URL(`/${locale}${basePath}${slug}/${correctSubSlug}`, req.url),
        301
      );
    }
  }

  // Tout est correct, on ne fait pas de redirection
  return null;
}

function isEnglishServiceSlug(slug: string): boolean {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug anglais, false sinon
  const frenchSlugs = Object.keys(servicesSlugMappingsFrToEn);
  const englishSlugs = Object.values(servicesSlugMappingsFrToEn);
  return englishSlugs.includes(slug) && !frenchSlugs.includes(slug);
}

function handleServiceRedirects(
  req: NextRequest,
  pathSegments: string[],
  locale: string
): NextResponse | null {
  if (pathSegments[0] !== "services" || pathSegments.length < 2) {
    return null; // Pas un service, on ne fait rien
  }

  const slug = pathSegments[1];
  const basePath = "/services/";

  // Vérifier si le slug principal est correct pour la locale
  const isCorrectSlug =
    locale === "fr" ? !isEnglishServiceSlug(slug) : isEnglishServiceSlug(slug);

  // Si le slug principal est incorrect, rediriger
  if (!isCorrectSlug) {
    const correctSlug =
      locale === "fr" ? getServicesSlugFr(slug) : getServicesSlugEn(slug);
    const newPath = `/${locale}${basePath}${correctSlug}`; // Sinon, rediriger juste avec le slug principal corrigé
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }
  // Tout est correct, on ne fait pas de redirection
  return null;
}

function isEnglishSecteurSlug(slug: string): boolean {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug anglais, false sinon
  const frenchSlugs = Object.keys(secteursSlugMappingsFrToEn);
  const englishSlugs = Object.values(secteursSlugMappingsFrToEn);
  return englishSlugs.includes(slug) && !frenchSlugs.includes(slug);
}

function handleSecteurRedirects(
  req: NextRequest,
  pathSegments: string[],
  locale: string
): NextResponse | null {
  if (
    (pathSegments[0] !== "secteurs" && pathSegments[0] !== "sectors") ||
    pathSegments.length < 2
  ) {
    return null; // Pas un secteur, on ne fait rien
  }

  const slug = pathSegments[1];
  const basePath = locale === "fr" ? "/secteurs/" : "/sectors/";

  // Vérifier si le slug principal est correct pour la locale
  const isCorrectSlug =
    locale === "fr" ? !isEnglishSecteurSlug(slug) : isEnglishSecteurSlug(slug);

  // Si le slug principal est incorrect, rediriger
  if (!isCorrectSlug) {
    const correctSlug =
      locale === "fr" ? getSecteurSlugFr(slug) : getSecteurSlugEn(slug);
    const newPath = `/${locale}${basePath}${correctSlug}`; // Sinon, rediriger juste avec le slug principal corrigé
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }
  // Tout est correct, on ne fait pas de redirection
  return null;
}

function isEnglishTagSlug(slug: string): boolean {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug anglais, false sinon
  const frenchSlugs = Object.keys(tagsSlugMappingsFrToEn);
  const englishSlugs = Object.values(tagsSlugMappingsFrToEn);
  return englishSlugs.includes(slug) && !frenchSlugs.includes(slug);
}

function handleTagRedirects(
  req: NextRequest,
  pathSegments: string[],
  locale: string
): NextResponse | null {
  if (pathSegments[0] !== "tag" || pathSegments.length < 2) {
    return null; // Pas un secteur, on ne fait rien
  }

  const slug = pathSegments[1];
  const basePath = "/tag/";

  // Vérifier si le slug principal est correct pour la locale
  const isCorrectSlug =
    locale === "fr" ? !isEnglishTagSlug(slug) : isEnglishTagSlug(slug);

  // Si le slug principal est incorrect, rediriger
  if (!isCorrectSlug) {
    const correctSlug =
      locale === "fr" ? getTagSlugFr(slug) : getTagSlugEn(slug);
    const newPath = `/${locale}${basePath}${correctSlug}`; // Sinon, rediriger juste avec le slug principal corrigé
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }
  // Tout est correct, on ne fait pas de redirection
  return null;
}

export const legacyRedirects: Record<string, string> = {
  // URLs sans préfixe de locale
  "/nos-services": "/fr/services",
  "/nous-contacter": "/fr/contactez-nous",
  "/nos-3-engagements": "/fr/nos-engagements",

  // Anciennes structures d'URL
  "/articles/nos-3-gammes": "/fr/nos-3-gammes",
  "/articles/nos-services": "/fr/services",
  "/articles/histoire-nettoyage":
    "/fr/articles/nettoyage/histoire-du-nettoyage-des-bureaux", // à adapter
  "/articles/devenir-prestataire": "/fr/devenir-prestataire",

  // URLs avec structure correcte mais contenu déplacé
  "/fr/conditions-generales-d-utilisation":
    "/fr/conditions-generales-dutilisation",
  "/en/legal-notices": "/en/legal-notice",
  "/en/our-services": "/en/services",
};

export const goneUrls: string[] = ["https://e99e300d.fm4all.com/"];
