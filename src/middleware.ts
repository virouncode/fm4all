import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const authRoutes = ["/auth/signin", "/admin/signup"];
const passwordRoutes = ["/auth/forgot-password", "/auth/reset-password"];

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  // const { data: session } = await betterFetch("/api/auth/get-session", {
  //   baseURL: req.nextUrl.origin,
  //   headers: {
  //     cookie: req.headers.get("cookie") || "",
  //   },
  // });
  // console.log("Session data:", session);
  const sessionResponse = await fetch(
    `${req.nextUrl.origin}/api/auth/get-session`,
    {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    }
  );

  const sessionData = await sessionResponse.json();
  console.log("Session data:", sessionData);

  const session = sessionData?.session;

  if (!session) {
    //Rediriger vers la page de connexion pour les routes /admin, /client et /fournisseur
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/client") ||
      pathname.startsWith("/fournisseur")
    ) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  const origin = req.headers.get("origin");
  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? ["https://www.fm4all.com", "https://fm4all.com"]
      : ["http://localhost:3000"];

  if (origin && allowedOrigins.includes(origin)) {
    const response = NextResponse.next(); //
    // Set CORS headers for the response
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Content-Type", "application/json");
    response.headers.set("Access-Control-Allow-Methods", "GET");
    return response;
  }
  // Si pas d'origine ou origine non autorisée, appliquer simplement le middleware d'internationalisation
  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
