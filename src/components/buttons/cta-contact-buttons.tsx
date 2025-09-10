"use client";

import { Button } from "@/components/ui/button";
import { Mail, Phone, Video } from "lucide-react";
import { useLocale } from "next-intl";

export const gtag_report_conversion_contact = (
  sendTo: string,
  url?: string,
) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "conversion", {
      send_to: `AW-17528670078/${sendTo}`,
      value: 1.0,
      event_callback: () => {
        if (url) window.location.href = url;
      },
    });
  }
  return false;
};

export const gtag_report_conversion_tel = () => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "conversion", {
      send_to: "AW-17528670078/zv70CMzfu5cbEP6OqaZB",
      value: 1.0,
    });
  }

  return false;
};

export const gtag_report_conversion_email = () => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "conversion", {
      send_to: "AW-17528670078/6oRqCKTAu5cbEP6OqaZB",
      value: 1.0,
    });
  }

  return false;
};

export const gtag_report_conversion_rdv = () => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "conversion", {
      send_to: "AW-17528670078/2epzCPent5cbEP6OqaZB",
      value: 1.0,
    });
  }
};

const CTAContactButtons = () => {
  const locale = useLocale();
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      {/* <Link
        href="https://calendly.com/romuald-fm4all/rdv-fm4all"
        target="_blank"
        className="w-full sm:w-2/3 lg:w-1/3"
      > */}
      <Button
        variant="destructive"
        size="lg"
        className="ring-destructive flex w-full items-center justify-center text-base ring-2 ring-offset-2 transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3"
        onClick={() =>
          gtag_report_conversion_contact(
            "2epzCPent5cbEP6OqaZB",
            "https://calendly.com/romuald-fm4all/rdv-fm4all",
          )
        }
      >
        <Video />
        {locale === "fr"
          ? "Je prends un rendez-vous en visio"
          : "Schedule a video call"}
      </Button>
      {/* </Link> */}
      {/* <Link href="tel:+33669311046" className="w-full sm:w-2/3 lg:w-1/3"> */}
      <Button
        variant="destructive"
        size="lg"
        className="ring-destructive flex w-full items-center justify-center text-base ring-2 ring-offset-2 transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3"
        onClick={() =>
          gtag_report_conversion_contact(
            "zv70CMzfu5cbEP6OqaZB",
            "tel:+33669311046",
          )
        }
      >
        <Phone />
        +33 6 69 31 10 46
      </Button>
      {/* </Link> */}
      {/* <Link
        href="mailto:contact@fm4all.com"
        className="w-full sm:w-2/3 lg:w-1/3"
      > */}
      <Button
        variant="destructive"
        size="lg"
        className="ring-destructive flex w-full items-center justify-center text-base ring-2 ring-offset-2 transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3"
        onClick={() =>
          gtag_report_conversion_contact(
            "6oRqCKTAu5cbEP6OqaZB",
            "mailto:contact@fm4all.com",
          )
        }
      >
        <Mail />
        {locale === "fr" ? "Je contacte par email" : "Contact by e-mail"}
      </Button>
      {/* </Link> */}
    </div>
  );
};

export default CTAContactButtons;
