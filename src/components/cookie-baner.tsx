"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { getLocalStorage, setLocalStorage } from "@/lib/storageHelper";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const COOKIE_EXPIRATION_MS = 1000 * 60 * 60 * 24;
// const COOKIE_EXPIRATION_MS = 1000 * 60;

const CookieBanner = () => {
  const t = useTranslations("cookieBanniere");
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    const storedCookieConsent = getLocalStorage("cookie_consent", null);
    const storedConsentDate = getLocalStorage("cookie_consent_date", null);
    if (storedCookieConsent !== null && storedConsentDate !== null) {
      const now = Date.now();
      const isExpired = now - storedConsentDate > COOKIE_EXPIRATION_MS;

      if (isExpired) {
        localStorage.removeItem("cookie_consent");
        localStorage.removeItem("cookie_consent_date");
        setCookieConsent(null);
      } else {
        setCookieConsent(storedCookieConsent);
      }
    }
  }, []);

  useEffect(() => {
    if (cookieConsent === null) return;
    const newValue = cookieConsent ? "granted" : "denied";

    if (window !== undefined && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: newValue,
      });
    }
    setLocalStorage("cookie_consent", cookieConsent);
    setLocalStorage("cookie_consent_date", Date.now());
  }, [cookieConsent]);

  const handleAccept = () => {
    setCookieConsent(true);
  };
  const handleRefuse = () => {
    setCookieConsent(false);
  };
  return (
    <Sheet
      open={cookieConsent === null && pathname !== "/politique-de-cookies"}
    >
      <SheetTrigger asChild></SheetTrigger>
      <SheetContent side="bottom" className="[&>button:first-child]:hidden">
        <SheetHeader>
          <SheetTitle className="sr-only">
            {t("banniere-de-consentement-aux-cookies")}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 justify-between text-sm px-6 lg:px-40 py-4 items-center md:flex-row">
          <div className="flex flex-col gap-2">
            <div className="w-[100px] h-[40px] relative">
              <Image
                src={"/img/logo_full.webp"}
                alt={`logo-de-fm4all`}
                fill={true}
                className="object-contain"
                quality={100}
              />
            </div>
            <div>
              <p>
                {t(
                  "nous-utilisons-des-cookies-et-des-technologies-similaires-necessaires-au-fonctionnement-de-notre-site-web"
                )}
              </p>
              <p>
                {t(
                  "nous-utilisons-egalement-des-cookies-d-analyse-de-fonctionnalite-pour-analyser-le-traffic-de-notre-site"
                )}
              </p>
            </div>

            <div>
              <span>{t("pour-en-savoir-plus-veuillez-consulter-notre")} </span>
              <Link
                href="/cookies"
                className="underline cursor-pointer hover:opacity-80"
                target="_blank"
              >
                {t("politique-relative-aux-cookies")}
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-72">
            <Button
              variant="destructive"
              title={t("jaccepte")}
              size="lg"
              onClick={handleAccept}
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
};

export default CookieBanner;
