"use client";

import { Button } from "@/components/ui/button";
import { Mail, Phone, Video } from "lucide-react";
import { useLocale } from "next-intl";

type CTAContactButtonsNoConversionProps = {
  withVisio?: boolean;
  orientation?: "vertical" | "horizontal";
  withPhone?: boolean;
  email?: string;
};
const CTAContactButtonsNoConversion = ({
  withVisio = true,
  orientation = "vertical",
  withPhone = true,
  email = "contact@fm4all.com",
}: CTAContactButtonsNoConversionProps) => {
  const locale = useLocale();
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-4 ${orientation === "horizontal" ? "flex-row" : "flex-col"}`}
    >
      {withVisio && (
        <Button
          size="lg"
          className="flex w-full items-center justify-center text-base transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3"
          asChild
        >
          <a
            href="https://calendly.com/romuald-fm4all/rdv-fm4all"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
            title={
              locale === "fr"
                ? "Prendre un rendez-vous en visio"
                : "Schedule a video call"
            }
          >
            <Video />
            {locale === "fr"
              ? "Je prends un rendez-vous en visio"
              : "Schedule a video call"}
          </a>
        </Button>
      )}
      {withPhone && (
        <Button
          size="lg"
          className="flex w-full items-center justify-center text-base transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3"
          asChild
        >
          <a
            href="tel:+33669311046"
            className="flex items-center justify-center gap-2"
            title={locale === "fr" ? "Appeler par téléphone" : "Call by phone"}
          >
            <Phone />
            +33 6 69 31 10 46
          </a>
        </Button>
      )}

      <Button
        size="lg"
        className="flex w-full items-center justify-center text-base transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3"
        asChild
      >
        <a
          href={`mailto:${email}`}
          className="flex items-center justify-center gap-2"
          title={locale === "fr" ? "Contacter par email" : "Contact by email"}
        >
          <Mail />
          {locale === "fr" ? "Je contacte par email" : "Contact by e-mail"}
        </a>
      </Button>
    </div>
  );
};

export default CTAContactButtonsNoConversion;
