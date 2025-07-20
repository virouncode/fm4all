"use client";

import ContactButton from "@/components/buttons/contact-button";
import LocaleButton from "@/components/buttons/locale-button";
import UserButton from "@/components/buttons/UserButton";
import UsersAccountsButton from "@/components/buttons/UsersAccountsButton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
import { CircleGauge, Menu, User, UsersRound, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

const HeaderAdmin = () => {
  const tAdmin = useTranslations("admin");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const path = usePathname();
  const sessionData = useSession().data;
  const user = sessionData?.user;
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
          {/***************** Desktop navigation *****************/}
          <nav className="hidden flex-1 items-center justify-center gap-14 lg:flex">
            <div
              className={`flex items-center gap-1 ${
                isActive("/admin/[adminId]") ? "font-bold text-destructive" : ""
              }`}
            >
              <CircleGauge size={15} />
              <Link
                href={{
                  pathname: "/admin/[adminId]",
                  params: { adminId: user?.id ?? 0 },
                }}
              >
                Dashboard
              </Link>
            </div>
            <UsersAccountsButton isActive={isActive} />
            <div
              className={`flex items-center gap-1 ${
                isActive("/admin/[adminId]/info")
                  ? "font-bold text-destructive"
                  : ""
              }`}
            >
              <User size={15} />
              <Link
                href={{
                  pathname: "/admin/[adminId]/info",
                  params: { adminId: user?.id ?? 0 },
                }}
              >
                Mes informations
              </Link>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LocaleButton className="hidden sm:flex" />
          <ContactButton
            setIsMobileNavOpen={setIsMobileNavOpen}
            className="hidden sm:flex"
          />
          <UserButton
            setIsMobileNavOpen={setIsMobileNavOpen}
            className="hidden sm:flex"
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
        {/***************** Mobile navigation *****************/}
        <div
          className={`fixed left-0 right-0 top-16 z-50 flex h-[calc(100vh-4rem)] items-center justify-center bg-background text-2xl shadow-lg ${
            isMobileNavOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } transition-all duration-300 ease-in-out`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="absolute right-6 top-4 flex items-center gap-4 sm:hidden">
            <LocaleButton className="flex gap-1" />
            <ContactButton setIsMobileNavOpen={setIsMobileNavOpen} />
            <UserButton setIsMobileNavOpen={setIsMobileNavOpen} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col gap-4">
              <div
                className={`flex items-center gap-4 ${
                  isActive("/admin/[adminId]")
                    ? "font-bold text-destructive"
                    : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <CircleGauge size={30} />
                <Link
                  href={{
                    pathname: "/admin/[adminId]",
                    params: { adminId: user?.id ?? 0 },
                  }}
                >
                  Dashboard
                </Link>
              </div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <div
                    className={`flex items-center gap-4 ${
                      isActive("/admin/[adminId]/comptes") ||
                      isActive("/admin/[adminId]/signup")
                        ? "font-bold text-destructive"
                        : ""
                    }`}
                  >
                    <UsersRound size={30} />
                    <p>{tAdmin("utilisateurs")}</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuCheckboxItem
                    checked={isActive("/admin/[adminId]/comptes")}
                    onClick={handleHideMobileNav}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[adminId]/comptes",
                        params: { adminId: user?.id ?? 0 },
                      }}
                      className="!text-base"
                    >
                      {tAdmin("comptes")}
                    </Link>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={isActive("/admin/[adminId]/signup")}
                    onClick={handleHideMobileNav}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[adminId]/signup",
                        params: { adminId: user?.id ?? 0 },
                      }}
                      className="!text-base"
                    >
                      {tAdmin("creer-un-compte")}
                    </Link>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default HeaderAdmin;
