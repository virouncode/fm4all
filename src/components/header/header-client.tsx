"use client";

import LocaleButton from "@/components/buttons/locale-button";
import UserButton from "@/components/buttons/UserButton";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "@/lib/auth/auth-client";
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
import { Suspense, useState } from "react";

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
    <div className="bg-background sticky top-0 z-50 h-16 w-full shadow">
      <header className="mx-auto flex h-full max-w-7xl items-center justify-between p-6">
        <div className="flex items-center gap-6">
          <div className="relative h-[23px] w-[100px]">
            <Link href="/">
              <Image
                src="/img/logo_full.webp"
                alt="fm4all-Logo"
                fill
                className="object-contain"
                sizes="100px"
              />
            </Link>
          </div>
          <nav className="hidden items-center gap-8 xl:flex">
            <div
              className={`flex items-center gap-1 ${
                isActive("/client/[clientId]") ? "text-primary font-bold" : ""
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
          <Suspense
            fallback={
              <div className="flex h-9 w-16 animate-pulse cursor-pointer items-center justify-center gap-1 rounded-md border text-sm hover:opacity-75"></div>
            }
          >
            <LocaleButton className="hidden md:flex" />
          </Suspense>
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
          className={`bg-background fixed top-16 right-0 left-0 flex h-[calc(100vh-4rem)] items-center justify-center text-2xl shadow-lg ${
            isMobileNavOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } transition-all duration-300 ease-in-out`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* <div className="absolute top-4 left-6">
            <ModeToggle />
          </div> */}
          <Suspense
            fallback={
              <div className="flex h-9 w-16 animate-pulse cursor-pointer items-center justify-center gap-1 rounded-md border text-sm hover:opacity-75"></div>
            }
          >
            <LocaleButton className="absolute top-10 left-6 flex gap-1" />
          </Suspense>
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col gap-4">
              <div
                className={`flex items-center gap-4 ${
                  isActive("/") ? "text-primary font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Home size={30} />
                <Link href="/">{t("home")}</Link>
              </div>
              <div
                className={`flex items-center gap-4 ${
                  isActive("/services") ? "text-primary font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/services">{t("nos-services")}</Link>
              </div>
              <div
                className={`flex items-center gap-4 ${
                  isActive("/gammes") ? "text-primary font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Star size={30} />
                <Link href="/gammes">{t("nos-3-gammes")}</Link>
              </div>
              <div
                className={`flex items-center gap-4 ${
                  isActive("/engagements") ? "text-primary font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <ScrollText size={30} />
                <Link href="/engagements">{t("nos-engagements")}</Link>
              </div>
              <div
                className={`flex items-center gap-4 ${
                  isActive("/partenaires") ? "text-primary font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Handshake size={30} />
                <Link href="/partenaires">{t("nos-partenaires")}</Link>
              </div>
              {/* <div
                className={`flex gap-4 items-center ${
                  isActive("/faq") ? "text-primary font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <CircleHelp size={30} />
                <Link href="/faq">FAQ</Link>
              </div> */}
              <div
                className={`hidden items-center gap-4 max-[600px]:flex ${
                  isActive("/prestataire") ? "text-primary font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/prestataire">{t("devenir-prestataire")}</Link>
              </div>
              <div
                className={`hidden items-center gap-4 max-[600px]:flex ${
                  isActive("/contact") ? "text-primary font-bold" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Phone size={30} />
                <Link href="/contact">{t("nous-contacter")}</Link>
              </div>
              <div
                className={`hidden items-center gap-4 max-[600px]:flex ${
                  isActive("/login") ? "text-primary font-bold" : ""
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
