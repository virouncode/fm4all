"use client";

import LocaleButton from "@/components/buttons/locale-button";
import UserButton from "@/components/buttons/UserButton";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
import { User } from "better-auth";
import {
  Barcode,
  CircleGauge,
  Euro,
  FileUser,
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

const HeaderFournisseur = () => {
  const t = useTranslations("header");
  const { data: session } = useSession();
  const user = session?.user as User & {
    role: string;
    fournisseurId?: number;
    clientId?: number;
  };
  const fournisseurId = user?.fournisseurId;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const path = usePathname();

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
    <div className="sticky top-0 z-50 h-16 w-full bg-background shadow">
      <header className="mx-auto flex h-full max-w-7xl items-center justify-between p-6">
        <div className="flex flex-1 items-center gap-6">
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
          <nav className="hidden flex-1 items-center justify-center gap-14 xl:flex">
            <div
              className={`flex items-center gap-1 ${
                isActive("/fournisseur/[fournisseurId]")
                  ? "font-bold text-destructive"
                  : ""
              }`}
            >
              <CircleGauge size={15} />
              <Link
                href={{
                  pathname: "/fournisseur/[fournisseurId]",
                  params: { fournisseurId: fournisseurId ?? 0 },
                }}
              >
                Dashboard
              </Link>
            </div>
            <div
              className={`flex items-center gap-1 ${
                isActive("/fournisseur/[fournisseurId]/profil")
                  ? "font-bold text-destructive"
                  : ""
              }`}
            >
              <FileUser size={15} />
              <Link
                href={{
                  pathname: "/fournisseur/[fournisseurId]/profil",
                  params: { fournisseurId: fournisseurId ?? 0 },
                }}
              >
                Mon profil
              </Link>
            </div>
            <div
              className={`flex items-center gap-1 ${
                isActive("/fournisseur/[fournisseurId]/tarifs")
                  ? "font-bold text-destructive"
                  : ""
              }`}
            >
              <Euro size={15} />
              <Link
                href={{
                  pathname: "/fournisseur/[fournisseurId]/tarifs",
                  params: { fournisseurId: fournisseurId ?? 0 },
                }}
              >
                Mes tarifs
              </Link>
            </div>
            <div
              className={`flex items-center gap-1 ${
                isActive("/fournisseur/[fournisseurId]/produits")
                  ? "font-bold text-destructive"
                  : ""
              }`}
            >
              <Barcode size={15} />
              <Link
                href={{
                  pathname: "/fournisseur/[fournisseurId]/produits",
                  params: { fournisseurId: fournisseurId ?? 0 },
                }}
              >
                Mes produits
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
          className={`fixed left-0 right-0 top-16 flex h-[calc(100vh-4rem)] items-center justify-center bg-background text-2xl shadow-lg ${
            isMobileNavOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } transition-all duration-300 ease-in-out`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <LocaleButton className="absolute left-6 top-10 flex gap-1" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col gap-4">
              <div
                className={`flex items-center gap-4 ${
                  isActive("/") ? "font-bold text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Home size={30} />
                <Link href="/">{t("home")}</Link>
              </div>
              <div
                className={`flex items-center gap-4 ${
                  isActive("/services") ? "font-bold text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/services">{t("nos-services")}</Link>
              </div>
              <div
                className={`flex items-center gap-4 ${
                  isActive("/gammes") ? "font-bold text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Star size={30} />
                <Link href="/gammes">{t("nos-3-gammes")}</Link>
              </div>
              <div
                className={`flex items-center gap-4 ${
                  isActive("/engagements") ? "font-bold text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <ScrollText size={30} />
                <Link href="/engagements">{t("nos-engagements")}</Link>
              </div>
              <div
                className={`flex items-center gap-4 ${
                  isActive("/partenaires") ? "font-bold text-destructive" : ""
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
                className={`hidden items-center gap-4 max-[600px]:flex ${
                  isActive("/prestataire") ? "font-bold text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/prestataire">{t("devenir-prestataire")}</Link>
              </div>
              <div
                className={`hidden items-center gap-4 max-[600px]:flex ${
                  isActive("/contact") ? "font-bold text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Phone size={30} />
                <Link href="/contact">{t("nous-contacter")}</Link>
              </div>
              <div
                className={`hidden items-center gap-4 max-[600px]:flex ${
                  isActive("/login") ? "font-bold text-destructive" : ""
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

export default HeaderFournisseur;
