"use client";

import { Menu, X } from "lucide-react";
import { useLocale } from "next-intl";
import { Suspense } from "react";
import ContactButton from "../buttons/contact-button";
import DevisButton from "../buttons/devis-button";
import LinkedinButton from "../buttons/linkedin-button";
import LocaleButton from "../buttons/locale-button";
import { ModeToggle } from "../theme/mode-toggle";

type HeaderButtonsProps = {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const HeaderButtons = ({
  isMobileNavOpen,
  setIsMobileNavOpen,
}: HeaderButtonsProps) => {
  const locale = useLocale();
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
      <Suspense
        fallback={
          <div className="flex h-9 w-16 animate-pulse cursor-pointer items-center justify-center gap-1 rounded-md border text-sm hover:opacity-75"></div>
        }
      >
        <LocaleButton className="hidden md:flex" />
      </Suspense>
      <div className="hidden md:flex">
        <ModeToggle />
      </div>
      <ContactButton
        setIsMobileNavOpen={setIsMobileNavOpen}
        className="hidden md:flex"
      />
      <LinkedinButton
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
