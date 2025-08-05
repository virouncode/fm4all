"use client";

import { usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import ContactButton from "../buttons/contact-button";
import DevisButton from "../buttons/devis-button";
import LinkedinButton from "../buttons/linkedin-button";
import LocaleButton from "../buttons/locale-button";
import UserButton from "../buttons/UserButton";

type HeaderButtonsProps = {
  locale: string;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const HeaderButtons = ({
  locale,
  isMobileNavOpen,
  setIsMobileNavOpen,
}: HeaderButtonsProps) => {
  const path = usePathname();
  console.log("HeaderButtons path:", path);

  const handleShowMobileNav = () => {
    setIsMobileNavOpen(true);
  };
  const handleHideMobileNav = () => {
    setIsMobileNavOpen(false);
  };
  return (
    <div className="flex items-center gap-4">
      <DevisButton
        title={locale === "fr" ? "Mon devis en ligne" : "My online quote"}
        text={locale === "fr" ? "Mon devis en ligne" : "My online quote"}
        className="text-sm"
        setIsMobileNavOpen={setIsMobileNavOpen}
        withIcon={false}
      />
      <LocaleButton className="hidden md:flex" />
      <ContactButton
        setIsMobileNavOpen={setIsMobileNavOpen}
        className="hidden md:flex"
      />
      <LinkedinButton
        setIsMobileNavOpen={setIsMobileNavOpen}
        className="hidden md:flex"
      />
      <UserButton
        setIsMobileNavOpen={setIsMobileNavOpen}
        className="hidden md:flex"
      />
      {isMobileNavOpen ? (
        <X
          size={30}
          className="block lg:hidden"
          onClick={handleHideMobileNav}
        />
      ) : (
        <Menu
          size={30}
          className="block lg:hidden"
          onClick={handleShowMobileNav}
        />
      )}
    </div>
  );
};

export default HeaderButtons;
