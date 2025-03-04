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
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const CookieBanner = () => {
  const [cookieConsent, setCookieConsent] = useState(false);
  useEffect(() => {
    const storedCookieConsent = getLocalStorage("cookie_consent", false);

    setCookieConsent(storedCookieConsent);
  }, [setCookieConsent]);

  useEffect(() => {
    const newValue = cookieConsent ? "granted" : "denied";

    window.gtag("consent", "update", {
      analytics_storage: newValue,
    });

    setLocalStorage("cookie_consent", cookieConsent);

    //For Testing
    console.log("Cookie Consent: ", cookieConsent);
  }, [cookieConsent]);
  const handleAccept = () => {
    setCookieConsent(true);
  };
  const handleRefuse = () => {
    setCookieConsent(false);
  };
  return (
    <Sheet open={!cookieConsent}>
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
