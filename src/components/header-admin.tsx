"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { CircleGauge, Menu, UsersRound, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import ContactButton from "./contact-button";
import LocaleButton from "./locale-button";
import UserButton from "./portal/UserButton";
import UsersAccountsButton from "./UsersAccountsButton";

const HeaderAdmin = () => {
  const t = useTranslations("header");
  const tAdmin = useTranslations("admin");
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
        <div className="flex items-center gap-6 flex-1">
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
          <nav className="hidden lg:flex items-center gap-14 justify-center flex-1">
            <div
              className={`flex gap-1 items-center ${
                isActive("/admin/dashboard") ? "text-destructive font-bold" : ""
              }`}
            >
              <CircleGauge size={15} />
              <Link href="/admin/dashboard">Dashboard</Link>
            </div>
            <UsersAccountsButton isActive={isActive} />
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
          className={`flex items-center justify-center fixed top-16 left-0 right-0 bg-background shadow-lg h-[calc(100vh-4rem)] text-2xl z-50 ${
            isMobileNavOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } transition-all ease-in-out duration-300`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="sm:hidden absolute top-4 right-6 flex items-center gap-4">
            <LocaleButton className="flex gap-1" />
            <ContactButton setIsMobileNavOpen={setIsMobileNavOpen} />
            <UserButton setIsMobileNavOpen={setIsMobileNavOpen} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-4 ">
              <div
                className={`flex gap-4 items-center ${
                  isActive("/admin/dashboard")
                    ? "text-destructive font-bold"
                    : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <CircleGauge size={30} />
                <Link href="/admin/dashboard">Dashboard</Link>
              </div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <div
                    className={`flex gap-4 items-center ${
                      isActive("/admin/comptes") || isActive("/admin/signup")
                        ? "text-destructive font-bold"
                        : ""
                    }`}
                  >
                    <UsersRound size={30} />
                    <p>{tAdmin("utilisateurs")}</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuCheckboxItem
                    checked={isActive("/admin/comptes")}
                    onClick={handleHideMobileNav}
                  >
                    <Link href="/admin/comptes" className="!text-base">
                      {tAdmin("comptes")}
                    </Link>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={isActive("/admin/signup")}
                    onClick={handleHideMobileNav}
                  >
                    <Link href="/admin/signup" className="!text-base">
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
