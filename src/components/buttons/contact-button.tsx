"use client";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

type ContactButtonProps = {
  setIsMobileNavOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
};
const ContactButton = ({
  setIsMobileNavOpen,
  className,
}: ContactButtonProps) => {
  const t = useTranslations("header");
  return (
    <Button
      title={t("nous-contacter")}
      variant="outline"
      className={`rounded-full ${className}`}
      size="icon"
      asChild
      onClick={() => setIsMobileNavOpen(false)}
    >
      <Link href="/contact">
        <Phone />
      </Link>
    </Button>
  );
};

export default ContactButton;
