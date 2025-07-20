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
          <NavigationMenuTrigger
            className="px-0"
            data-testid="services-trigger"
          >
            <div
              className={`flex items-center gap-1 text-base ${isActive("/services") ? "font-bold text-destructive" : ""}`}
            >
              <HandPlatter size={15} />
              <p>Services</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] py-2">
              <li className="px-6 py-2 hover:bg-accent">
                <NavigationMenuLink asChild className="relative w-full">
                  <Link
                    href={"/services"}
                    title={
                      locale === "fr" ? "Tous nos services" : "All our services"
                    }
                    aria-label={
                      locale === "fr" ? "Tous nos services" : "All our services"
                    }
                    className="flex w-full items-center gap-4 hover:underline"
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
                    className="px-6 py-2 hover:bg-accent"
                    onClick={handleHideMobileNav}
                  >
                    <NavigationMenuLink asChild className="relative w-full">
                      <Link
                        //@ts-expect-error ok - href is a complex object
                        href={service.href}
                        title={service.linkText}
                        aria-label={service.linkText}
                        className="flex w-full items-center gap-4 hover:underline"
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
          <NavigationMenuTrigger
            className="px-0"
            data-testid="secteurs-trigger"
          >
            <div
              className={`flex items-center gap-1 text-base ${isActive("/secteurs") ? "font-bold text-destructive" : ""}`}
            >
              <Factory size={15} />
              <p>{locale === "fr" ? "Secteurs" : "Sectors"}</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] py-2">
              <li className="px-6 py-2 hover:bg-accent">
                <NavigationMenuLink asChild className="relative w-full">
                  <Link
                    href={"/secteurs"}
                    className="flex w-full items-center gap-4 hover:underline"
                  >
                    <Factory size={20} />
                    {locale === "fr" ? "Tous nos secteurs" : "All our sectors"}
                  </Link>
                </NavigationMenuLink>
              </li>
              {secteurs.map((secteur) => {
                return (
                  <li key={secteur.title} className="px-6 py-2 hover:bg-accent">
                    <NavigationMenuLink asChild>
                      <Link
                        //@ts-expect-error ok - href is a complex object
                        href={secteur.href}
                        className="flex w-full items-center gap-4"
                      >
                        <secteur.icon size={20} />
                        {secteur.title}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            onClick={handleHideMobileNav}
            data-testid="gammes-link"
          >
            <div
              className={`flex items-center gap-1 ${
                isActive("/gammes") ? "font-bold text-destructive" : ""
              }`}
            >
              <Star size={15} />
              <Link href="/gammes">{locale === "fr" ? "Gammes" : "Tiers"}</Link>
            </div>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            onClick={handleHideMobileNav}
            data-testid="engagements-link"
          >
            <div
              className={`flex items-center gap-1 ${
                isActive("/engagements") ? "font-bold text-destructive" : ""
              }`}
            >
              <ScrollText size={15} />
              <Link href="/engagements">
                {locale === "fr" ? "Engagements" : "Commitments"}
              </Link>
            </div>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            onClick={handleHideMobileNav}
            data-testid="partenaires-link"
          >
            <div
              className={`flex items-center gap-1 ${
                isActive("/partenaires") ? "font-bold text-destructive" : ""
              }`}
            >
              <Handshake size={15} />
              <Link href="/partenaires">
                {locale === "fr" ? "Partenaires" : "Partners"}
              </Link>
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
        className="mt-20 w-full px-6 lg:w-1/2"
      >
        <AccordionItem value={"services"}>
          <AccordionTrigger className="text-lg">
            <div
              className={`flex items-center gap-2 ${isActive("/services") ? "font-bold text-destructive" : ""}`}
            >
              <HandPlatter />
              <span>Services</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2">
              <li
                className="px-4 py-2 hover:bg-accent"
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
                  className="flex w-full items-center gap-4 !text-lg hover:underline"
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
                    className="px-4 py-2 hover:bg-accent"
                    onClick={handleHideMobileNav}
                  >
                    <Link
                      //@ts-expect-error ok - href is a complex object
                      href={service.href}
                      title={service.linkText}
                      aria-label={service.linkText}
                      className="flex w-full items-center gap-4 !text-lg hover:underline"
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
              className={`flex items-center gap-2 ${isActive("/secteurs") ? "font-bold text-destructive" : ""}`}
            >
              <Factory />
              <span>{locale === "fr" ? "Secteurs" : "Sectors"}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2">
              <li
                className="px-4 py-2 hover:bg-accent"
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
                  className="flex w-full items-center gap-4 !text-lg hover:underline"
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
                    <Link
                      //@ts-expect-error ok - href is a complex object
                      href={secteur.href}
                      className="flex w-full items-center gap-4 !text-lg hover:underline"
                    >
                      <secteur.icon size={20} />
                      {secteur.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value={"gammes"} onClick={handleHideMobileNav}>
          <div
            className={`flex items-center gap-2 py-4 ${isActive("/gammes") ? "font-bold text-destructive" : ""}`}
          >
            <Star />
            <Link href="/gammes" className="w-full text-lg">
              {locale === "fr" ? "Gammes" : "Tiers"}
            </Link>
          </div>
        </AccordionItem>
        <AccordionItem value={"engagements"} onClick={handleHideMobileNav}>
          <div
            className={`flex items-center gap-2 py-4 ${isActive("/engagements") ? "font-bold text-destructive" : ""}`}
          >
            <ScrollText />
            <Link href="/engagements" className="w-full text-lg">
              {locale === "fr" ? "Engagements" : "Commitments"}
            </Link>
          </div>
        </AccordionItem>
        <AccordionItem value={"partenaires"} onClick={handleHideMobileNav}>
          <div
            className={`flex items-center gap-2 py-4 ${isActive("/partenaires") ? "font-bold text-destructive" : ""}`}
          >
            <Handshake />
            <Link href="/partenaires" className="w-full text-lg">
              {locale === "fr" ? "Partenaires" : "Partners"}
            </Link>
          </div>
        </AccordionItem>
      </Accordion>
    </nav>
  );
};

export default HeaderNavigationMenu;
