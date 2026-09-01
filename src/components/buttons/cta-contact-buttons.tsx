"use client";

import { Button } from "@/components/ui/button";
import { openMailtoWithFallback } from "@/lib/utils/openMailto";
import { Mail, Phone, Video } from "lucide-react";
import { useLocale } from "next-intl";

export const gtag_report_conversion_contact = (
  sendTo: string,
  url?: string,
  newTab: boolean = false,
) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "conversion", {
      send_to: `AW-17528670078/${sendTo}`,
    });
    if (url) {
      setTimeout(() => {
        if (newTab) {
          window.open(url, "_blank");
          return;
        }
        window.location.href = url;
      }, 300);
    }
  }
  return false;
};

const CTAContactButtons = () => {
  const locale = useLocale();
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <Button
        size="lg"
        className="flex w-full items-center justify-center text-base transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3"
        onClick={() =>
          gtag_report_conversion_contact(
            "2epzCPent5cbEP6OqaZB",
            "https://calendly.com/romuald-fm4all/rdv-fm4all",
            true,
          )
        }
      >
        <Video />
        {locale === "fr"
          ? "Je prends un rendez-vous en visio"
          : "Schedule a video call"}
      </Button>
      <Button
        size="lg"
        className="flex w-full items-center justify-center text-base transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3"
        onClick={() =>
          gtag_report_conversion_contact(
            "zv70CMzfu5cbEP6OqaZB",
            "tel:+33970700001",
          )
        }
      >
        <Phone />
        {locale === "fr" ? "09 70 70 00 01" : "+33 9 70 70 00 01"}
      </Button>

      <Button
        size="lg"
        className="flex w-full items-center justify-center text-base transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3"
        onClick={() => {
          // Conversion seule : l'ouverture du mailto est gérée par
          // openMailtoWithFallback (qui copie l'adresse si aucun client email)
          gtag_report_conversion_contact("6oRqCKTAu5cbEP6OqaZB");
          openMailtoWithFallback("contact@fm4all.com", locale);
        }}
      >
        <Mail />
        {locale === "fr" ? "Je contacte par email" : "Contact by e-mail"}
      </Button>
    </div>
  );
};

export default CTAContactButtons;
