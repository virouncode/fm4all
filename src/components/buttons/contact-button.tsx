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
    <Link href="/contact">
      <Button
        title={t("nous-contacter")}
        variant="outline"
        className={`rounded-full ${className}`}
        size="icon"
        onClick={() => setIsMobileNavOpen(false)}
      >
        <Phone />
      </Button>
    </Link>
  );
};

export default ContactButton;
