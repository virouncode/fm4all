"use client";

import { getLocalStorage } from "@/lib/utils/storageHelper";
import { useEffect, useState } from "react";
import GoogleTags from "./GoogleTags";

const CONSENT_KEY = "cookie_consent";

export default function ConsentBasedGoogleTags({
  GA_MEASUREMENT_ID,
}: {
  GA_MEASUREMENT_ID: string;
}) {
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    // Lecture initiale
    const stored = getLocalStorage(CONSENT_KEY, null) as boolean | null;
    if (stored === true) setConsentGranted(true);

    // Écouter les changements dans le même onglet (custom event de CookieBanner)
    const handleCustom = (e: Event) => {
      const detail = (e as CustomEvent<{ consent: boolean }>).detail;
      setConsentGranted(detail.consent === true);
    };
    window.addEventListener("cookieConsentChanged", handleCustom);

    // Écouter les changements depuis d'autres onglets (StorageEvent)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY) {
        setConsentGranted(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cookieConsentChanged", handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (!consentGranted) return null;

  return <GoogleTags GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />;
}
