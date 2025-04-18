"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
import { User } from "better-auth";
import {
  CircleGauge,
  HandPlatter,
  Handshake,
  Home,
  Menu,
  Phone,
  ScrollText,
  Star,
  User as UserIcon,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import LocaleButton from "./locale-button";
import UserButton from "./portal/UserButton";

const HeaderClient = () => {
  const t = useTranslations("header");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const path = usePathname();
  const { data: session } = useSession();
  const user = session?.user as User & {
    role: string;
    fournisseurId?: number;
    clientId?: number;
  };
  const clientId = user?.clientId;

  const isActive = (href: string) => {
    if (href === "/") return path === "/";
    return path === href;
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
            <Link href="/">
              <Image
                src="/img/logo_full.webp"
                alt="fm4all-Logo"
                fill={true}
                quality={100}
                className="object-contain"
              />
            </Link>
          </div>
          <nav className="hidden xl:flex items-center gap-8">
            <div
              className={`flex gap-1 items-center ${
                isActive("/client/[clientId]")
                  ? "text-destructive font-bold"
                  : ""
              }`}
            >
              <CircleGauge size={15} />
              <Link
                href={{
                  pathname: "/client/[clientId]",
                  params: { clientId: clientId ?? 0 },
                }}
              >
                Dashboard
              </Link>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LocaleButton className="hidden md:flex" />
          <UserButton setIsMobileNavOpen={setIsMobileNavOpen} />
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
          {/* <div className="absolute top-4 left-6">
            <ModeToggle />
          </div> */}
          <LocaleButton className="absolute top-10 left-6 flex gap-1" />
          <div className="flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-4 ">
              <div
                className={`flex gap-4 items-center ${
                  isActive("/") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Home size={30} />
                <Link href="/">{t("home")}</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/services") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/services">{t("nos-services")}</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/gammes") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Star size={30} />
                <Link href="/gammes">{t("nos-3-gammes")}</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/engagements") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <ScrollText size={30} />
                <Link href="/engagements">{t("nos-engagements")}</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/partenaires") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Handshake size={30} />
                <Link href="/partenaires">{t("nos-partenaires")}</Link>
              </div>
              {/* <div
                className={`flex gap-4 items-center ${
                  isActive("/faq") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <CircleHelp size={30} />
                <Link href="/faq">FAQ</Link>
              </div> */}
              <div
                className={`hidden max-[600px]:flex gap-4 items-center ${
                  isActive("/prestataire") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/prestataire">{t("devenir-prestataire")}</Link>
              </div>
              <div
                className={`hidden max-[600px]:flex gap-4 items-center ${
                  isActive("/contact") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Phone size={30} />
                <Link href="/contact">{t("nous-contacter")}</Link>
              </div>
              <div
                className={`hidden max-[600px]:flex gap-4 items-center ${
                  isActive("/login") ? "text-destructive font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <UserIcon size={30} />
                <Link href="/auth/signin">{t("connexion")}</Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default HeaderClient;
