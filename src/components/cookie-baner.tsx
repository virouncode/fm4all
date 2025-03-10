"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getLocalStorage, setLocalStorage } from "@/lib/storageHelper";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const COOKIE_EXPIRATION_MS = 1000 * 60 * 60 * 24;
// const COOKIE_EXPIRATION_MS = 1000 * 60;

const CookieBanner = () => {
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
          <SheetTitle></SheetTitle>
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
                Nous utilisons des cookies et des technologies similaires
                nécessaires au fonctionnement de notre site Web.
              </p>
              <p>
                Nous utilisons également des cookies d&apos;analyse, de
                fonctionnalité pour analyser le traffic de notre site.
              </p>
            </div>

            <div>
              <span>Pour en savoir plus, veuillez consulter notre </span>
              <Link
                href="/politique-de-cookies"
                className="text-fm4allsecondary cursor-pointer hover:opacity-80"
                target="_blank"
              >
                Politique relative aux cookies
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-72">
            <Button
              variant="destructive"
              title="J'accepte"
              size="lg"
              onClick={handleAccept}
            >
              J&apos;accepte
            </Button>
            <Button
              variant="outline"
              title="Je refuse"
              size="lg"
              onClick={handleRefuse}
            >
              Je refuse
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CookieBanner;
