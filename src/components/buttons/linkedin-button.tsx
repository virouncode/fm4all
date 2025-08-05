"use client";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

type LinkedinButtonProps = {
  setIsMobileNavOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
};
const LinkedinButton = ({
  setIsMobileNavOpen,
  className,
}: LinkedinButtonProps) => {
  const t = useTranslations("header");
  return (
    <a
      href="https://www.linkedin.com/company/fm4all/"
      title={t("notre-profil-linkedin")}
      aria-label={t("notre-profil-linkedin")}
      target="_blank"
      rel="noopener"
    >
      <Button
        title={t("notre-profil-linkedin")}
        variant="outline"
        className={`rounded-full ${className}`}
        size="icon"
        onClick={() => setIsMobileNavOpen(false)}
        data-testid="linkedin-link-button"
      >
        <Linkedin />
      </Button>
    </a>
  );
};

export default LinkedinButton;
