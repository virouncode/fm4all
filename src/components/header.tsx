"use client";

import { Button } from "@/components/ui/button";
import { useCurrentLocale, useScopedI18n } from "@/locales/client";
import {
  CircleHelp,
  HandPlatter,
  Handshake,
  Home,
  Menu,
  Phone,
  ScrollText,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RouteKey, routes } from "../lib/routes";
import DevisButton from "./devis-button";
import LocaleButton from "./locale-button";
import LocalizedLink from "./localized-link";

const Header = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const path = usePathname();
  const t = useScopedI18n("nav");
  const locale = useCurrentLocale();

  const isActive = (routeKey: RouteKey) => {
    const localizedPath = routes[routeKey][locale as "fr" | "en"];
    if (localizedPath === "/") return path === "/";
    return path.includes(localizedPath);
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
          <div className="relative h-[23px] w-[100px]">
            <LocalizedLink href="home">
              <Image
                src="/img/logo_full.webp"
                alt="Logo"
                fill={true}
                quality={100}
                className="object-contain"
              />
            </LocalizedLink>
          </div>
          <nav className="hidden xl:flex items-center gap-4">
            {/* <div
              className={`flex gap-1 items-center ${
                isActive("home") ? "text-destructive font-bold" : ""
              }`}
            >
              <Home size={15} />
              <LocalizedLink href="home">{t("maison")}</LocalizedLink>
            </div> */}
            <div
              // className={`flex gap-1 items-center ${
              //   isActive("/nos-services") ? "text-destructive font-bold" : ""
              // }`}
              className={`flex gap-1 items-center`}
            >
              <HandPlatter size={15} />
              <Link href="/nos-services">{t("services")}</Link>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("gammes") ? "text-destructive font-bold" : ""
              }`}
            >
              <Star size={15} />
              <LocalizedLink href="gammes">{t("range")}</LocalizedLink>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("engagements") ? "text-destructive font-bold" : ""
              }`}
            >
              <ScrollText size={15} />
              <LocalizedLink href="engagements">
                {t("commitment")}
              </LocalizedLink>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("partenaires") ? "text-destructive font-bold" : ""
              }`}
            >
              <Handshake size={15} />
              <LocalizedLink href="partenaires">{t("partners")}</LocalizedLink>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("faq") ? "text-destructive font-bold" : ""
              }`}
            >
              <CircleHelp size={15} />
              <LocalizedLink href="faq">{t("faq")}</LocalizedLink>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <DevisButton
            title="Mon devis en ligne"
            text={t("quote")}
            className="text-sm"
            disabled={path.includes("/mon-devis")}
            setIsMobileNavOpen={setIsMobileNavOpen}
          />
          <Button
            title={t("provider")}
            variant="outline"
            className="hidden min-[600px]:flex justify-center items-center"
            size="default"
            asChild
            onClick={() => setIsMobileNavOpen(false)}
          >
            <LocalizedLink href="prestataires">{t("provider")}</LocalizedLink>
          </Button>
          <LocaleButton className="hidden md:flex" />
          <Button
            title={t("contact")}
            variant="outline"
            className="hidden min-[500px]:flex justify-center items-center rounded-full"
            size="icon"
            asChild
            onClick={() => setIsMobileNavOpen(false)}
          >
            <LocalizedLink href="contact">
              <Phone />
            </LocalizedLink>
          </Button>
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
        <div
          className={`flex items-center justify-center fixed top-16 left-0 right-0 bg-background shadow-lg h-[calc(100vh-4rem)] text-2xl  ${
            isMobileNavOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } transition-all ease-in-out duration-300`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <LocaleButton className="absolute top-10 left-6 flex gap-1" />

          <div className="flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-4 ">
              <div
                className={`flex gap-4 items-center ${
                  isActive("home") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Home size={30} />
                <LocalizedLink href="home">{t("home")}</LocalizedLink>
              </div>
              <div
                // className={`flex gap-4 items-center ${
                //   isActive("/nos-services") ? "text-destructive font-bold" : ""
                // }`}
                className={`flex gap-4 items-center`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/nos-services">{t("services")}</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("gammes") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Star size={30} />
                <LocalizedLink href="gammes">{t("range")}</LocalizedLink>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("engagements") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <ScrollText size={30} />
                <LocalizedLink href="engagements">
                  {t("commitment")}
                </LocalizedLink>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("partenaires") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Handshake size={30} />
                <LocalizedLink href="partenaires">
                  {t("partners")}
                </LocalizedLink>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("faq") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <CircleHelp size={30} />
                <LocalizedLink href="faq">{t("faq")}</LocalizedLink>
              </div>
              <div
                className={`hidden max-[600px]:flex gap-4 items-center ${
                  isActive("prestataires") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <LocalizedLink href="prestataires">
                  {t("provider")}
                </LocalizedLink>
              </div>
              <div
                className={`hidden max-[600px]:flex gap-4 items-center ${
                  isActive("contact") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Phone size={30} />
                <LocalizedLink href="contact">{t("contact")}</LocalizedLink>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
