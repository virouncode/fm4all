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

// ============================================================================
// Config : logs activés uniquement en dev
// ============================================================================
const devLogging = process.env.NODE_ENV === "development";

const log = (...args: any[]) => {
  if (devLogging) console.log("[middleware]", ...args);
};

// next-intl middleware
const intlMiddleware = createMiddleware(routing);

// ============================================================================
// Helpers internes
// ============================================================================

// Détermine si la route est dans un espace protégé (admin/client/fournisseur)
function getPortalArea(
  pathname: string,
): "admin" | "client" | "fournisseur" | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/client")) return "client";
  if (pathname.startsWith("/fournisseur")) return "fournisseur";
  return null;
}

// Vérifie si l’utilisateur a accès à la zone
function isAuthorizedRoute(
  role: "admin" | "client" | "fournisseur",
  area: string | null,
  pathnameWithoutLocale: string,
  user: SelectUserType,
): { authorized: boolean; type?: string } {
  // Si route publique → autorisation automatique
  if (!area) return { authorized: true };

  const segments = pathnameWithoutLocale.split("/").filter(Boolean);
  const requestedId = segments[1];

  // Zones autorisées par rôle
  const ROLE_ACCESS: Record<string, string[]> = {
    admin: ["admin"],
    client: ["client"],
    fournisseur: ["fournisseur"],
  };

  // Si la zone ne fait pas partie des zones autorisées pour ce rôle
  if (!ROLE_ACCESS[role].includes(area)) {
    return { authorized: false, type: area };
  }

  // Vérification de l’ID utilisateur dans l’URL
  if (area === "admin" && requestedId !== user.id) {
    return { authorized: false, type: "admin" };
  }

  if (
    area === "client" &&
    requestedId &&
    parseInt(requestedId) !== user.clientId
  ) {
    return { authorized: false, type: "client" };
  }

  if (
    area === "fournisseur" &&
    requestedId &&
    parseInt(requestedId) !== user.fournisseurId
  ) {
    return { authorized: false, type: "fournisseur" };
  }

  return { authorized: true };
}

// Récupération session (cookie → fallback API)
async function resolveSession(req: NextRequest) {
  // 1. Lecture du cookie Better-auth (rapide)
  const cookieData = await getCookieCache(req);
  if (cookieData?.session && cookieData?.user) {
    log("Session trouvée dans le cookie");
    return { session: cookieData.session, user: cookieData.user };
  }

  log("Pas de session dans cookie → fallback API");

  // 2. Fallback API vers /api/auth/get-session
  try {
    const response = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: req.headers.get("cookie") || "" },
    });

    if (!response.ok) {
      log("API session → pas ok :", response.status);
      return null;
    }

    const data = await response.json();
    if (data.session && data.user) {
      log("Session trouvée via API");
      return { session: data.session, user: data.user };
    }

    log("API session renvoie vide");
    return null;
  } catch (err) {
    log("Erreur API get-session :", err);
    return null;
  }
}

// ============================================================================
// MIDDLEWARE PRINCIPAL OPTIMISÉ
// ============================================================================
export async function middleware(req: NextRequest) {
  const fullUrl = req.nextUrl.href;
  const pathname = req.nextUrl.pathname;
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const locale = getLocaleFromPathname(pathname);
  const hostname = req.headers.get("host") || "";

  log("URL :", fullUrl);
  log("Locale :", locale);
  log("Sans locale :", pathnameWithoutLocale);

  // ============================================================================
  // 0. TEMP : désactiver la protection pour /client
  // ============================================================================
  // if (pathnameWithoutLocale.startsWith("/client")) {
  //   log("TEMP: bypass auth pour /client");
  //   // on laisse juste next-intl gérer la locale
  //   if (!locale) return intlMiddleware(req);
  //   return intlMiddleware(req);
  // }
  // ============================================================================
  // 1. Redirections SEO / legacy
  // ============================================================================
  if (pathname === "/" && hostname.includes("fm4all.com")) {
    return NextResponse.redirect(new URL("/fr", req.url), 301);
  }

  if (pathname === "/fr/" || pathname === "/en/") {
    return NextResponse.redirect(new URL(pathname.slice(0, -1), req.url), 301);
  }

  if (goneUrls.includes(fullUrl) || goneUrls.includes(pathname)) {
    return new NextResponse(null, { status: 410 });
  }

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
      301,
    );
  }

  if (!locale) return intlMiddleware(req);

  // ============================================================================
  // 2. Routes publiques
  // ============================================================================

  const area = getPortalArea(pathnameWithoutLocale);
  const isProtected = area !== null;

  if (!isProtected) {
    const parts = pathnameWithoutLocale.split("/").filter(Boolean);

    const r1 = handleArticleRedirects(req, parts, locale);
    if (r1) return r1;

    const r2 = handleServiceRedirects(req, parts, locale);
    if (r2) return r2;

    const r3 = handleSecteurRedirects(req, parts, locale);
    if (r3) return r3;

    return intlMiddleware(req);
  }

  // ============================================================================
  // 3. Route protégée → Résolution session
  // ============================================================================
  const sessionData = await resolveSession(req);

  if (!sessionData) {
    log("Aucune session valide → redirection signin");
    return NextResponse.redirect(new URL(`/${locale}/auth/signin`, req.url));
  }

  const { user } = sessionData;

  // ============================================================================
  // 4. Vérification des permissions
  // ============================================================================
  const userRole = user.role.startsWith("admin")
    ? "admin"
    : user.role.startsWith("client")
      ? "client"
      : user.role.startsWith("fournisseur")
        ? "fournisseur"
        : "unknown";
  const check = isAuthorizedRoute(
    userRole as "admin" | "client" | "fournisseur",
    area,
    pathnameWithoutLocale,
    user as SelectUserType,
  );

  if (!check.authorized) {
    log("Accès refusé :", check.type);
    return NextResponse.redirect(
      new URL(`/${locale}/auth/unauthorized?type=${check.type}`, req.url),
    );
  }

  log("Accès autorisé pour :", user.role);

  // ============================================================================
  // 5. Accès OK → next-intl rend la page
  // ============================================================================
  return intlMiddleware(req);
}

// ============================================================================
// Matcher
// ============================================================================
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
