"use client";

import { Button } from "@/components/ui/button";
import { openMailtoWithFallback } from "@/lib/utils/openMailto";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";
import { useLocale } from "next-intl";

type MailtoButtonProps = {
  email: string;
  className?: string;
};

/**
 * Bouton "Je contacte par email".
 * Ouvre le client email et, si l'utilisateur n'en a pas,
 * copie l'adresse dans le presse-papier avec un toast de succès.
 */
const MailtoButton = ({ email, className }: MailtoButtonProps) => {
  const locale = useLocale();
  return (
    <Button
      size="lg"
      className={cn(
        "flex w-full items-center justify-center text-base transition-all hover:scale-[101%] sm:w-2/3 lg:w-1/3",
        className,
      )}
      asChild
    >
      <a
        href={`mailto:${email}`}
        onClick={(e) => {
          e.preventDefault();
          openMailtoWithFallback(email, locale);
        }}
        className="flex items-center justify-center gap-2"
        title={locale === "fr" ? "Contacter par email" : "Contact by email"}
      >
        <Mail />
        {locale === "fr" ? "Je contacte par email" : "Contact by e-mail"}
      </a>
    </Button>
  );
};

export default MailtoButton;
