"use client";

import { Button } from "@/components/ui/button";
import { Mail, Phone, Video } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";

const CTAContactButtons = () => {
  const locale = useLocale();
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <Link
        href="https://calendly.com/romuald-fm4all/rdv-fm4all"
        target="_blank"
        className="w-full sm:w-2/3 lg:w-1/3"
      >
        <Button
          variant="destructive"
          size="lg"
          className="w-full text-base flex items-center justify-center"
        >
          <Video />
          {locale === "fr"
            ? "Je prends un rendez-vous en visio"
            : "Schedule a video call"}
        </Button>
      </Link>
      <Link href="tel:+33669311046" className="w-full sm:w-2/3 lg:w-1/3">
        <Button
          variant="destructive"
          size="lg"
          className="w-full text-base flex items-center justify-center"
        >
          <Phone />
          +33 6 69 31 10 46
        </Button>
      </Link>
      <Link
        href="mailto:contact@fm4all.com"
        className="w-full sm:w-2/3 lg:w-1/3"
      >
        <Button
          variant="destructive"
          size="lg"
          className="w-full text-base flex items-center justify-center"
        >
          <Mail />
          {locale === "fr" ? "Je contacte par email" : "Contact by e-mail"}
        </Button>
      </Link>
    </div>
  );
};

export default CTAContactButtons;
