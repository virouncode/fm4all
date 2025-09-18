import { NextRequest, NextResponse } from "next/server";

export const protectDevisRoutes = ({
  req,
  pathnameWithoutLocale,
  locale,
  intlMiddleware,
}: {
  req: NextRequest;
  pathnameWithoutLocale: string;
  locale: string;
  intlMiddleware: (req: NextRequest) => NextResponse;
}) => {
  const segments = pathnameWithoutLocale.split("/").filter(Boolean);
  const step = segments[1];

  const cookie = req.cookies.get("devisProgress");

  // Config des étapes
  const stepsByLocale: Record<string, string[]> = {
    fr: [
      "mes-locaux",
      "mes-services",
      "food-and-beverage",
      "pilotage-prestations",
      "sauvegarder-ma-progression",
      "personnaliser-mon-devis",
      "afficher-mon-devis",
    ],
    en: [
      "my-premises",
      "my-services",
      "food-beverage",
      "service-management",
      "save-my-progress",
      "customize-my-quote",
      "view-my-quote",
    ],
  };

  const skipPath =
    locale === "fr"
      ? `/${locale}/mon-devis/etape-non-autorisee`
      : `/${locale}/my-quote/unhautorized-step`;
  const startPath =
    locale === "fr"
      ? `/${locale}/mon-devis/mes-locaux`
      : `/${locale}/my-quote/my-premises`;

  if (!cookie && step !== stepsByLocale[locale][0]) {
    return NextResponse.redirect(new URL(startPath, req.url));
  }

  if (cookie?.value) {
    const { completedSteps } = JSON.parse(decodeURIComponent(cookie.value));

    if (["skip", stepsByLocale[locale][0]].includes(step)) {
      return intlMiddleware(req);
    }

    const currentStepIndex = stepsByLocale[locale].indexOf(step) + 1;
    const isStepValid =
      currentStepIndex >= 1 && completedSteps.includes(currentStepIndex - 1);

    if (currentStepIndex <= 1) {
      return intlMiddleware(req);
    }

    if (!isStepValid) {
      return NextResponse.redirect(new URL(skipPath, req.url));
    }

    return intlMiddleware(req);
  }

  return intlMiddleware(req);
};
