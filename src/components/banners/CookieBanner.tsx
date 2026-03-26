"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { getLocalStorage, setLocalStorage } from "@/lib/utils/storageHelper";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ConsentState, ConsentUpdateParams } from "../analytics/GoogleTags";

const CONSENT_KEY = "cookie_consent";
const CONSENT_DATE_KEY = "cookie_consent_date";

const CONSENT_ACCEPTED_EXPIRATION_MS = 1000 * 60 * 60 * 24 * 180; // 6 mois
const CONSENT_REFUSED_EXPIRATION_MS = 1000 * 60 * 60 * 24 * 30; // 1 mois

type StoredConsentType = boolean | null;
type StoredConsentDateType = number | null;

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

export default function CookieBanner() {
  const t = useTranslations("cookieBanniere");
  const pathname = usePathname();

  const [consent, setConsent] = useState<StoredConsentType>(null);

  const shouldOpen = useMemo(
    () => consent === null && pathname !== "/cookies",
    [consent, pathname],
  );

  // 1) Lire la décision stockée + expiration
  useEffect(() => {
    const storedConsent = getLocalStorage(CONSENT_KEY, null) as StoredConsentType;
    const storedDate = getLocalStorage(
      CONSENT_DATE_KEY,
      null,
    ) as StoredConsentDateType;

    if (storedConsent === null || storedDate === null) {
      setConsent(null);
      return;
    }

    const expirationMs =
      storedConsent === true
        ? CONSENT_ACCEPTED_EXPIRATION_MS
        : CONSENT_REFUSED_EXPIRATION_MS;
    const expired = Date.now() - storedDate > expirationMs;

    if (expired) {
      safeRemove(CONSENT_KEY);
      safeRemove(CONSENT_DATE_KEY);
      setConsent(null);
      return;
    }

    setConsent(storedConsent);
  }, []);

  // 2) Appliquer Consent Mode quand l’utilisateur choisit
  useEffect(() => {
    if (consent === null) return;

    const mode: ConsentState = consent ? "granted" : "denied";

    const params: ConsentUpdateParams = {
      analytics_storage: mode,
      ad_storage: mode,
      ad_user_data: mode,
      ad_personalization: mode,
      // wait_for_update: 500, // optionnel si tu veux
    };

    window.gtag?.("consent", "update", params);

    setLocalStorage(CONSENT_KEY, consent);
    setLocalStorage(CONSENT_DATE_KEY, Date.now());

    // Notifier ConsentBasedGoogleTags dans le même onglet
    window.dispatchEvent(
      new CustomEvent("cookieConsentChanged", { detail: { consent } }),
    );
  }, [consent]);

  const handleAccept = () => setConsent(true);
  const handleRefuse = () => setConsent(false);

  return (
    <Sheet open={shouldOpen}>
      <SheetContent
        side="bottom"
        className="gap-0 [&>button:first-child]:hidden"
      >
        <SheetHeader>
          <SheetTitle className="sr-only">
            {t("banniere-de-consentement-aux-cookies")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col items-center justify-between gap-6 px-6 pt-4 pb-10 text-sm md:flex-row lg:px-40">
          <div className="flex flex-col gap-2">
            <div className="relative h-[40px] w-[100px]">
              <Image
                src="/img/logo_full.webp"
                alt="logo-de-fm4all"
                fill
                className="object-contain dark:hidden"
                sizes="100px"
              />
              <Image
                src="/img/logo_full_dark_mode.webp"
                alt="logo-de-fm4all"
                fill
                className="hidden object-contain dark:block"
                sizes="100px"
              />
            </div>

            <div>
              <p>
                {t(
                  "nous-utilisons-des-cookies-et-des-technologies-similaires-necessaires-au-fonctionnement-de-notre-site-web",
                )}
              </p>
              <p>
                {t(
                  "nous-utilisons-egalement-des-cookies-d-analyse-de-fonctionnalite-pour-analyser-le-traffic-de-notre-site",
                )}
              </p>
            </div>

            <div>
              <span>{t("pour-en-savoir-plus-veuillez-consulter-notre")} </span>
              <Link
                href="/cookies"
                className="cursor-pointer underline hover:opacity-80"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("politique-relative-aux-cookies")}
              </Link>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-72">
            <Button
              title={t("jaccepte")}
              size="lg"
              onClick={handleAccept}
              data-testid="cookie-accept-button"
            >
              {t("jaccepte")}
            </Button>

            <Button
              variant="outline"
              title={t("je-refuse")}
              size="lg"
              onClick={handleRefuse}
            >
              {t("je-refuse")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
