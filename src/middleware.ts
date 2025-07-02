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
import { SelectUserType } from "./zod-schemas/user";

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
    // if (
    //   pathnameWithoutLocale.startsWith("/mon-devis") ||
    //   pathnameWithoutLocale.startsWith("/my-quote")
    // ) {
    //   return protectDevisRoutes({
    //     req,
    //     pathnameWithoutLocale,
    //     locale,
    //     intlMiddleware,
    //   });
    // }

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
  const sessionInCookie = sessionCookie?.session;
  const userInCookie = sessionCookie?.user;

  //L'utilisateur et la session sont dans le cookie
  if (sessionInCookie && userInCookie) {
    const checked = isAuthorizedRoute(
      userInCookie.role,
      pathnameWithoutLocale,
      userInCookie as SelectUserType
    );
    if (!checked.authorized) {
      //route non autorisée
      return NextResponse.redirect(
        new URL(`/${locale}/auth/unauthorized?type=${checked.type}`, req.url)
      );
    } else {
      //route autorisée
      return intlMiddleware(req);
    }
  }

  //L'utilisateur et la session ne sont pas dans le cookie
  try {
    //On va récupérer la session depuis l'API
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
      return NextResponse.redirect(new URL(`/${locale}/auth/signin`, req.url));
    }
    const sessionData = await sessionResponse.json();
    const session = sessionData?.session;
    const user = sessionData?.user;

    if (session && user) {
      // Si la session et l'utilisateur existent
      const checked = isAuthorizedRoute(
        user.role,
        pathnameWithoutLocale,
        user as SelectUserType
      );
      if (!checked.authorized) {
        //route non autorisée
        return NextResponse.redirect(
          new URL(`/${locale}/auth/unauthorized?type=${checked.type}`, req.url)
        );
      } else {
        //route autorisée
        return intlMiddleware(req);
      }
    } else {
      // Si la session ou l'utilisateur n'existe pas
      return NextResponse.redirect(new URL(`/${locale}/auth/signin`, req.url));
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de la session:", err);
    return NextResponse.redirect(new URL(`/${locale}/auth/signin`, req.url));
  }
}

//============================================================================//

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};

type Role = "admin" | "client" | "fournisseur";

function isAuthorizedRoute(
  role: Role,
  pathnameWithoutLocale: string,
  user: SelectUserType // Tu peux typer mieux selon ta structure
): { authorized: boolean; type?: string } {
  const segments = pathnameWithoutLocale.split("/").filter(Boolean);
  const userId = segments[1];

  // console.log("Checking authorization for role:", role);
  // console.log("Pathname without locale:", pathnameWithoutLocale);
  // console.log("User ID from path:", userId);

  if (role === "admin") {
    if (pathnameWithoutLocale.startsWith("/client"))
      return { authorized: false, type: "client" };
    if (pathnameWithoutLocale.startsWith("/fournisseur"))
      return { authorized: false, type: "fournisseur" };
    if (userId && userId !== user.id)
      return { authorized: false, type: "admin" };
  }

  if (role === "client") {
    if (pathnameWithoutLocale.startsWith("/admin"))
      return { authorized: false, type: "admin" };
    if (pathnameWithoutLocale.startsWith("/fournisseur"))
      return { authorized: false, type: "fournisseur" };
    if (userId && parseInt(userId) !== user.clientId)
      return { authorized: false, type: "client" };
  }

  if (role === "fournisseur") {
    if (pathnameWithoutLocale.startsWith("/admin"))
      return { authorized: false, type: "admin" };
    if (pathnameWithoutLocale.startsWith("/client"))
      return { authorized: false, type: "client" };
    if (userId && parseInt(userId) !== user.fournisseurId)
      return { authorized: false, type: "fournisseur" };
  }

  return { authorized: true };
}
