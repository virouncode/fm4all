import { getCookieCache } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  getLocaleFromPathname,
  getPathnameWithoutLocale,
} from "./lib/metadata/metadata-helpers";
import {
  handleArticleRedirects,
  handleSecteurRedirects,
  handleServiceRedirects,
} from "./redirects/handleRedirects";
import { goneUrls, legacyRedirects } from "./redirects/urls";

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const fullUrl = req.nextUrl.href;
  const pathname = req.nextUrl.pathname;
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const locale = getLocaleFromPathname(pathname);
  const hostname = req.headers.get("host") || "";

  // Log the request details for debugging
  console.log("Middleware triggered for URL:", fullUrl);
  console.log("Locale detected:", locale);
  console.log("Pathname without locale:", pathnameWithoutLocale);
  console.log("Hostname:", hostname);

  //================== REDIRECTS 301 et 410 ==================//

  //REDIRECTIONS DE LA LANDING PAGE
  // Rediriger www.fm4all.com/ vers www.fm4all.com/fr
  if (pathname === "/" && hostname.includes("fm4all.com")) {
    return NextResponse.redirect(new URL("/fr", req.url), 301);
  }
  //REDIRECTION DES TRAILING SLASH
  if (pathname === "/fr/" || pathname === "/en/") {
    return NextResponse.redirect(new URL(pathname.slice(0, -1), req.url), 301);
  }
  //REDIRECTIONS DES URLS KO
  if (goneUrls.includes(fullUrl) || goneUrls.includes(pathname)) {
    return new NextResponse(null, { status: 410 });
  }
  //REDIRECTIONS DES URLS dynamiques non résolues et des anciennes urls
  if (
    pathname.match(/^\/(fr|en)\/tag\b/) ||
    pathname.includes("[") ||
    pathname.includes("]")
  ) {
    return new NextResponse(null, { status: 410 });
  }
  if (legacyRedirects[pathname]) {
    return NextResponse.redirect(
      new URL(legacyRedirects[pathname], req.url),
      301
    );
  }
  //Pas de locale
  if (!locale) return intlMiddleware(req);

  //============================== ROUTE PUBLIQUE ==============================//
  if (
    !pathnameWithoutLocale.startsWith("/admin") &&
    !pathnameWithoutLocale.startsWith("/client") &&
    !pathnameWithoutLocale.startsWith("/fournisseur")
  ) {
    //****** REDIRECTION 301 si route hybride fr/en *****//
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
    //******* ROUTE CORRECTE *******//
    return intlMiddleware(req);
  }
  //============================================================================//

  // //=============================== ROUTE PROTEGEE =============================//
  const sessionCookie = await getCookieCache(req);
  const session = sessionCookie?.session;
  const user = sessionCookie?.user;

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
        if (adminId && adminId !== user.id) {
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
  //============================================================================//
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
