"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { LocaleType, PathnamesType } from "@/i18n/routing";
import {
  Factory,
  HandPlatter,
  Handshake,
  LucideIcon,
  ScrollText,
  Star,
} from "lucide-react";

import { ObfuscatedLink } from "@/components/links/ObfuscatedLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link, usePathname } from "@/i18n/navigation";

type HeaderNavigationMenuProps = {
  locale: LocaleType;
  services: {
    title: string;
    href: {
      pathname: PathnamesType;
      params: { slug: string };
    };
    linkText: string;
    icon: LucideIcon;
  }[];
  secteurs: {
    title: string;
    href: {
      pathname: PathnamesType;
      params: { slug: string };
    };
    icon: LucideIcon;
  }[];
  orientation: "horizontal" | "vertical";
  handleHideMobileNav: () => void;
};

const HeaderNavigationMenu = ({
  locale,
  services,
  secteurs,
  orientation,
  handleHideMobileNav,
}: HeaderNavigationMenuProps) => {
  const path = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return path === "/";
    return path.includes(href);
  };

  return orientation === "horizontal" ? (
    //DESKTOP
    <NavigationMenu>
      <NavigationMenuList className="flex items-center gap-4">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="px-0">
            <div
              className={`flex items-center gap-1 text-base  ${isActive("/services") ? "text-destructive font-bold" : ""}`}
            >
              <HandPlatter size={15} />
              <p>Services</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px]">
              <li className="hover:bg-accent px-4 py-2">
                <NavigationMenuLink asChild className="w-full relative">
                  <Link
                    href={"/services"}
                    title={
                      locale === "fr" ? "Tous nos services" : "All our services"
                    }
                    aria-label={
                      locale === "fr" ? "Tous nos services" : "All our services"
                    }
                    className="w-full flex items-center gap-4 hover:underline"
                  >
                    <HandPlatter size={20} />
                    <span>
                      {locale === "fr"
                        ? "Tous nos services"
                        : "All our services"}
                    </span>
                  </Link>
                </NavigationMenuLink>
              </li>
              {services.map((service) => {
                return (
                  <li
                    key={service.title}
                    className="hover:bg-accent px-4 py-2"
                    onClick={handleHideMobileNav}
                  >
                    <NavigationMenuLink asChild className="w-full relative">
                      <Link
                        //@ts-expect-error ok - href is a complex object
                        href={service.href}
                        title={service.linkText}
                        aria-label={service.linkText}
                        className="w-full flex items-center gap-4 hover:underline"
                      >
                        <service.icon size={20} />
                        <span>{service.title}</span>
                        <span className="sr-only">{service.linkText}</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="px-0">
            <div
              className={`flex items-center gap-1 text-base ${isActive("/secteurs") ? "text-destructive font-bold" : ""}`}
            >
              <Factory size={15} />
              <p>{locale === "fr" ? "Secteurs" : "Sectors"}</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px]">
              <li className="hover:bg-accent px-4 py-2">
                <NavigationMenuLink asChild className="w-full relative">
                  <ObfuscatedLink
                    href={"/secteurs"}
                    className="w-full flex items-center gap-4 hover:underline"
                  >
                    <Factory size={20} />
                    {locale === "fr" ? "Tous nos secteurs" : "All our sectors"}
                  </ObfuscatedLink>
                </NavigationMenuLink>
              </li>
              {secteurs.map((secteur) => {
                return (
                  <li key={secteur.title} className="px-4 py-2 hover:bg-accent">
                    <NavigationMenuLink asChild>
                      <ObfuscatedLink
                        //@ts-expect-error ok - href is a complex object
                        href={secteur.href}
                        className="w-full flex items-center gap-4"
                      >
                        <secteur.icon size={20} />
                        {secteur.title}
                      </ObfuscatedLink>
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild onClick={handleHideMobileNav}>
            <div
              className={`flex gap-1 items-center ${
                isActive("/gammes") ? "text-destructive font-bold" : ""
              }`}
            >
              <Star size={15} />
              <ObfuscatedLink href="/gammes">
                {locale === "fr" ? "Gammes" : "Tiers"}
              </ObfuscatedLink>
            </div>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild onClick={handleHideMobileNav}>
            <div
              className={`flex gap-1 items-center ${
                isActive("/engagements") ? "text-destructive font-bold" : ""
              }`}
            >
              <ScrollText size={15} />
              <ObfuscatedLink href="/engagements">
                {locale === "fr" ? "Engagements" : "Commitments"}
              </ObfuscatedLink>
            </div>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild onClick={handleHideMobileNav}>
            <div
              className={`flex gap-1 items-center ${
                isActive("/partenaires") ? "text-destructive font-bold" : ""
              }`}
            >
              <Handshake size={15} />
              <ObfuscatedLink href="/partenaires">
                {locale === "fr" ? "Partenaires" : "Partners"}
              </ObfuscatedLink>
            </div>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ) : (
    //MOBILE
    <nav className="w-full">
      <Accordion
        type="single"
        collapsible
        className="w-full lg:w-1/2 px-6 mt-20"
      >
        <AccordionItem value={"services"}>
          <AccordionTrigger className="text-lg">
            <div
              className={`flex items-center gap-2
                  ${isActive("/services") ? "text-destructive font-bold" : ""}`}
            >
              <HandPlatter />
              <span>Services</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2">
              <li
                className="hover:bg-accent px-4 py-2"
                onClick={handleHideMobileNav}
              >
                <Link
                  href={"/services"}
                  title={
                    locale === "fr" ? "Tous nos services" : "All our services"
                  }
                  aria-label={
                    locale === "fr" ? "Tous nos services" : "All our services"
                  }
                  className="w-full flex items-center gap-4 hover:underline !text-lg"
                >
                  <HandPlatter size={20} />
                  <span>
                    {locale === "fr" ? "Tous nos services" : "All our services"}
                  </span>
                </Link>
              </li>
              {services.map((service) => {
                return (
                  <li
                    key={service.title}
                    className="hover:bg-accent px-4 py-2"
                    onClick={handleHideMobileNav}
                  >
                    <Link
                      //@ts-expect-error ok - href is a complex object
                      href={service.href}
                      title={service.linkText}
                      aria-label={service.linkText}
                      className="w-full flex items-center gap-4 hover:underline !text-lg"
                    >
                      <service.icon size={20} />
                      <span>{service.title}</span>
                      <span className="sr-only">{service.linkText}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value={"secteurs"}>
          <AccordionTrigger className="text-lg">
            <div
              className={`flex items-center gap-2
                  ${isActive("/secteurs") ? "text-destructive font-bold" : ""}`}
            >
              <Factory />
              <span>{locale === "fr" ? "Secteurs" : "Sectors"}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2">
              <li
                className="hover:bg-accent px-4 py-2"
                onClick={handleHideMobileNav}
              >
                <Link
                  href={"/secteurs"}
                  title={
                    locale === "fr" ? "Tous nos secteurs" : "All our sectors"
                  }
                  aria-label={
                    locale === "fr" ? "Tous nos secteurs" : "All our sectors"
                  }
                  className="w-full flex items-center gap-4 hover:underline !text-lg"
                  locale={locale}
                >
                  <Factory size={20} />
                  <span>
                    {locale === "fr" ? "Tous nos secteurs" : "All our sectors"}
                  </span>
                </Link>
              </li>
              {secteurs.map((secteur) => {
                return (
                  <li
                    key={secteur.title}
                    className="px-4 py-2 hover:bg-accent"
                    onClick={handleHideMobileNav}
                  >
                    <ObfuscatedLink
                      //@ts-expect-error ok - href is a complex object
                      href={secteur.href}
                      className="w-full flex items-center gap-4 hover:underline !text-lg"
                    >
                      <secteur.icon size={20} />
                      {secteur.title}
                    </ObfuscatedLink>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value={"gammes"} onClick={handleHideMobileNav}>
          <div
            className={`flex items-center gap-2 py-4 ${isActive("/gammes") ? "text-destructive font-bold" : ""}`}
          >
            <Star />
            <ObfuscatedLink href="/gammes" className="text-lg w-full">
              {locale === "fr" ? "Gammes" : "Tiers"}
            </ObfuscatedLink>
          </div>
        </AccordionItem>
        <AccordionItem value={"engagements"} onClick={handleHideMobileNav}>
          <div
            className={`flex items-center gap-2 py-4 ${isActive("/engagements") ? "text-destructive font-bold" : ""}`}
          >
            <ScrollText />
            <ObfuscatedLink href="/engagements" className="text-lg w-full">
              {locale === "fr" ? "Engagements" : "Commitments"}
            </ObfuscatedLink>
          </div>
        </AccordionItem>
        <AccordionItem value={"partenaires"} onClick={handleHideMobileNav}>
          <div
            className={`flex items-center gap-2 py-4 ${isActive("/partenaires") ? "text-destructive font-bold" : ""}`}
          >
            <Handshake />
            <ObfuscatedLink href="/partenaires" className="text-lg w-full">
              {locale === "fr" ? "Partenaires" : "Partners"}
            </ObfuscatedLink>
          </div>
        </AccordionItem>
      </Accordion>
    </nav>
  );
};

export default HeaderNavigationMenu;
