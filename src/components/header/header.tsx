"use client";

import ContactButton from "@/components/buttons/contact-button";
import DevisButton from "@/components/buttons/devis-button";
import LocaleButton from "@/components/buttons/locale-button";
import UserButton from "@/components/buttons/UserButton";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Factory,
  HandPlatter,
  Handshake,
  Home,
  Menu,
  ScrollText,
  Star,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState } from "react";

const Header = () => {
  const locale = useLocale();
  console.log("locale", locale);

  // const tGlobal = useTranslations("Global");
  // const t = useTranslations("header");

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const path = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return path === "/";
    return path.includes(href);
  };

  const handleShowMobileNav = () => {
    setIsMobileNavOpen(true);
  };
  const handleHideMobileNav = () => {
    setIsMobileNavOpen(false);
  };
  return (
    <div className="w-full sticky top-0 h-16 bg-background z-50 shadow">
      <header className="max-w-7xl h-full flex justify-between items-center p-6 mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="relative h-[23px] w-[100px]">
              <Image
                src="/img/logo_full.webp"
                alt="fm4all-Logo"
                fill={true}
                sizes="300px"
                quality={100}
                className="object-contain"
              />
            </div>
          </Link>
          {/***************** Desktop navigation *****************/}
          <nav className="hidden xl:flex items-center gap-4">
            <div
              className={`flex gap-1 items-center ${
                isActive("/services") ? "text-destructive font-bold" : ""
              }`}
            >
              <HandPlatter size={15} />
              <Link href="/services">Services</Link>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("/secteurs") ? "text-destructive font-bold" : ""
              }`}
            >
              <Factory size={15} />
              <Link href="/secteurs">
                {locale === "fr" ? "Secteurs" : "Sectors"}
              </Link>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("/gammes") ? "text-destructive font-bold" : ""
              }`}
            >
              <Star size={15} />
              <Link href="/gammes">{locale === "fr" ? "Gammes" : "Tiers"}</Link>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("/engagements") ? "text-destructive font-bold" : ""
              }`}
            >
              <ScrollText size={15} />
              <Link href="/engagements">
                {locale == "fr" ? "Engagements" : "Commitments"}
              </Link>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("/partenaires") ? "text-destructive font-bold" : ""
              }`}
            >
              <Handshake size={15} />
              <Link href="/partenaires">
                {locale === "fr" ? "Partenaires" : "Partners"}
              </Link>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <DevisButton
            title={locale === "fr" ? "Mon devis en ligne" : "My online quote"}
            text={locale === "fr" ? "Mon devis en ligne" : "My online quote"}
            className="text-sm"
            disabled={path.includes("/mon-devis")}
            setIsMobileNavOpen={setIsMobileNavOpen}
          />
          <Button
            title={
              locale === "fr" ? "Devenir prestataire" : "Become a provider"
            }
            variant="outline"
            className="hidden min-[600px]:flex justify-center items-center"
            size="default"
            asChild
            onClick={() => setIsMobileNavOpen(false)}
          >
            <Link href="/prestataire">
              {locale === "fr" ? "Devenir prestataire" : "Become a provider"}
            </Link>
          </Button>
          <LocaleButton className="hidden md:flex" />
          <ContactButton
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
              className="block xl:hidden"
              onClick={handleHideMobileNav}
            />
          ) : (
            <Menu
              size={30}
              className="block xl:hidden"
              onClick={handleShowMobileNav}
            />
          )}
        </div>
        {/***************** Mobile navigation *****************/}
        <div
          className={`flex items-center justify-center fixed top-16 left-0 right-0 bg-background shadow-lg h-[calc(100vh-4rem)] text-2xl  ${
            isMobileNavOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } transition-all ease-in-out duration-300`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="md:hidden absolute top-4 right-6 flex items-center gap-4">
            <LocaleButton className="flex gap-1" />
            <ContactButton setIsMobileNavOpen={setIsMobileNavOpen} />
            <UserButton setIsMobileNavOpen={setIsMobileNavOpen} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-4 ">
              <div
                className={`flex gap-4 items-center ${
                  isActive("/") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Home size={30} />
                <Link href="/">{locale === "fr" ? "Accueil" : "Home"}</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/services") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/services">Services</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/secteurs") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Factory size={30} />
                <Link href="/secteurs">
                  {locale === "fr" ? "Secteurs" : "Sectors"}
                </Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/gammes") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Star size={30} />
                <Link href="/gammes">
                  {locale === "fr" ? "Gammes" : "Tiers"}
                </Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/engagements") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <ScrollText size={30} />
                <Link href="/engagements">
                  {locale == "fr" ? "Engagements" : "Commitments"}
                </Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/partenaires") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Handshake size={30} />
                <Link href="/partenaires">
                  {locale === "fr" ? "Partenaires" : "Partners"}
                </Link>
              </div>
              <div
                className={`hidden max-[600px]:flex gap-4 items-center ${
                  isActive("/prestataire") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/prestataire">
                  {locale === "fr"
                    ? "Devenir prestataire"
                    : "Become a provider"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
