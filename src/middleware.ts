import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  getLocaleFromPathname,
  getPathnameWithoutLocale,
} from "./lib/metadata-helpers";

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const locale = getLocaleFromPathname(pathname);
  //SESSION
  let session;
  let user;
  //Si pas de locale
  if (!locale) return intlMiddleware(req);
  //Si locale mais route publique
  if (
    !pathnameWithoutLocale.startsWith("/admin") &&
    !pathnameWithoutLocale.startsWith("/client") &&
    !pathnameWithoutLocale.startsWith("/fournisseur")
  ) {
    return intlMiddleware(req);
  }

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
