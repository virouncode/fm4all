"use client";
import { Button } from "@/components/ui/button";
import { CircleUser, HandPlatter, Home, Menu, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";

const Header = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const path = usePathname();

  const isActive = (href: string) => path === href;

  const handleShowMobileNav = () => {
    setIsMobileNavOpen(true);
  };
  const handleHideMobileNav = () => {
    setIsMobileNavOpen(false);
  };
  return (
    <div className="w-full sticky top-0 h-16 bg-background z-20 shadow">
      <header className="max-w-7xl h-full flex justify-between items-center p-6 mx-auto">
        <div className="flex items-center gap-6">
          <div className="relative h-[23px] w-[100px] ">
            <Link href="/">
              <Image
                src="/img/logo-full.png"
                alt="Logo"
                fill={true}
                quality={100}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-4">
            <div
              className={`flex gap-1 items-center ${
                isActive("/") ? "text-destructive" : ""
              }`}
            >
              <Home size={15} />
              <Link href="/">Home</Link>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("/nos-services") ? "text-destructive" : ""
              }`}
            >
              <HandPlatter size={15} />
              <Link href="/nos-services">Nos services</Link>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("/nos-3-gammes") ? "text-destructive" : ""
              }`}
            >
              <Star size={15} />
              <Link href="/nos-3-gammes">Nos 3 gammes</Link>
            </div>
            <div
              className={`flex gap-1 items-center ${
                isActive("/hof-managers") ? "text-destructive" : ""
              }`}
            >
              <CircleUser size={15} />
              <Link href="/hof-managers">HOF Managers</Link>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button title="Mon devis en ligne" variant="destructive">
            {/* <Link href="/mon-devis">Je réalise mon devis en ligne</Link> */}
            Mon devis en ligne
          </Button>
          <Button
            title="Devenir prestataire"
            variant="outline"
            className="hidden min-[600px]:block"
          >
            <Link href="/devenir-prestataire">Devenir prestataire</Link>
          </Button>
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
          <div className="lg:flex hidden">
            <ModeToggle />
          </div>
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
          <div className="absolute top-4 left-6">
            <ModeToggle />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-4 ">
              <div
                className={`flex gap-4 items-center ${
                  isActive("/") ? "text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Home size={30} />
                <Link href="/">Home</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/nos-services") ? "text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/nos-services">Nos services</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/nos-3-gammes") ? "text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <Star size={30} />
                <Link href="/nos-3-gammes">Nos 3 gammes</Link>
              </div>
              <div
                className={`flex gap-4 items-center ${
                  isActive("/hof-managers") ? "text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <CircleUser size={30} />
                <Link href="/hof-managers">HOF Managers</Link>
              </div>
              <div
                className={`hidden max-[600px]:flex gap-4 items-center ${
                  isActive("/devenir-prestataire") ? "text-destructive" : ""
                }`}
                onClick={handleHideMobileNav}
              >
                <HandPlatter size={30} />
                <Link href="/devenir-prestataire">Devenir prestataire</Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
