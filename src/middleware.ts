import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { LocaleType, routing } from "./i18n/routing";

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

// next-intl middleware
const intlMiddleware = createMiddleware(routing);

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================
export async function middleware(req: NextRequest) {
  const fullUrl = req.nextUrl.href;
  const pathname = req.nextUrl.pathname;
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const locale = getLocaleFromPathname(pathname);
  const hostname = req.headers.get("host") || "";

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
    (pathname.includes("[") && !pathname.startsWith("/_next")) ||
    (pathname.includes("]") && !pathname.startsWith("/_next"))
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
  // 2. Redirections SEO articles/services/secteurs
  // ============================================================================
  const parts = pathnameWithoutLocale.split("/").filter(Boolean);
  const typedLocale = locale as LocaleType;

  const r1 = handleArticleRedirects(req, parts, typedLocale);
  if (r1) return r1;

  const r2 = handleServiceRedirects(req, parts, typedLocale);
  if (r2) return r2;

  const r3 = handleSecteurRedirects(req, parts, typedLocale);
  if (r3) return r3;

  return intlMiddleware(req);
}

// ============================================================================
// Matcher
// ============================================================================
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
