"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { PathnamesType } from "@/i18n/routing";
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
import { useLocale } from "next-intl";

type HeaderNavigationMenuProps = {
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
  services,
  secteurs,
  orientation,
  handleHideMobileNav,
}: HeaderNavigationMenuProps) => {
  const locale = useLocale();
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
              className={`flex items-center gap-1 text-base ${isActive("/services") ? "text-destructive font-bold" : ""}`}
            >
              <HandPlatter size={15} />
              <p>Services</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px]">
              <li className="hover:bg-accent px-6">
                <NavigationMenuLink asChild className="text-base">
                  <Link
                    href={"/services"}
                    title={
                      locale === "fr" ? "Tous nos services" : "All our services"
                    }
                    aria-label={
                      locale === "fr" ? "Tous nos services" : "All our services"
                    }
                    className="flex w-full flex-row items-center gap-4 hover:underline"
                  >
                    <HandPlatter className="size-5" />
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
                    className="hover:bg-accent px-6"
                    onClick={handleHideMobileNav}
                  >
                    <NavigationMenuLink asChild className="text-base">
                      <Link
                        //@ts-expect-error ok - href is a complex object
                        href={service.href}
                        title={service.linkText}
                        aria-label={service.linkText}
                        className="flex w-full flex-row items-center gap-4 hover:underline"
                      >
                        <service.icon className="size-5" />
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
              className={`flex items-center gap-1 text-base ${isActive("/secteurs") ? "text-destructive font-bold" : ""}`}
            >
              <Factory size={15} />
              <p>{locale === "fr" ? "Secteurs" : "Sectors"}</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px]">
              <li className="hover:bg-accent px-6">
                <NavigationMenuLink asChild className="text-base">
                  <Link
                    href={"/secteurs"}
                    className="flex w-full flex-row items-center gap-4 hover:underline"
                  >
                    <Factory className="size-5" />
                    {locale === "fr" ? "Tous nos secteurs" : "All our sectors"}
                  </Link>
                </NavigationMenuLink>
              </li>
              {secteurs.map((secteur) => {
                return (
                  <li key={secteur.title} className="hover:bg-accent px-6">
                    <NavigationMenuLink asChild className="text-base">
                      <Link
                        //@ts-expect-error ok - href is a complex object
                        href={secteur.href}
                        className="flex w-full flex-row items-center gap-4 hover:underline"
                      >
                        <secteur.icon className="size-5" />
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
            className="text-base"
          >
            <div
              className={`flex flex-row items-center gap-1 ${
                isActive("/gammes") ? "text-destructive font-bold" : ""
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
            className="text-base"
          >
            <div
              className={`flex flex-row items-center gap-1 ${
                isActive("/engagements") ? "text-destructive font-bold" : ""
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
            className="text-base"
          >
            <div
              className={`flex flex-row items-center gap-1 ${
                isActive("/partenaires") ? "text-destructive font-bold" : ""
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
              className={`flex items-center gap-2 ${isActive("/services") ? "text-destructive font-bold" : ""}`}
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
                  className="flex w-full items-center gap-4 !text-lg hover:underline"
                >
                  <HandPlatter className="size-5" />
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
                      className="flex w-full items-center gap-4 !text-lg hover:underline"
                    >
                      <service.icon className="size-5" />
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
              className={`flex items-center gap-2 ${isActive("/secteurs") ? "text-destructive font-bold" : ""}`}
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
                  className="flex w-full items-center gap-4 !text-lg hover:underline"
                >
                  <Factory className="size-5" />
                  <span>
                    {locale === "fr" ? "Tous nos secteurs" : "All our sectors"}
                  </span>
                </Link>
              </li>
              {secteurs.map((secteur) => {
                return (
                  <li
                    key={secteur.title}
                    className="hover:bg-accent px-4 py-2"
                    onClick={handleHideMobileNav}
                  >
                    <Link
                      //@ts-expect-error ok - href is a complex object
                      href={secteur.href}
                      className="flex w-full items-center gap-4 !text-lg hover:underline"
                    >
                      <secteur.icon className="size-5" />
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
            className={`flex items-center gap-2 py-4 ${isActive("/gammes") ? "text-destructive font-bold" : ""}`}
          >
            <Star />
            <Link href="/gammes" className="w-full text-lg">
              {locale === "fr" ? "Gammes" : "Tiers"}
            </Link>
          </div>
        </AccordionItem>
        <AccordionItem value={"engagements"} onClick={handleHideMobileNav}>
          <div
            className={`flex items-center gap-2 py-4 ${isActive("/engagements") ? "text-destructive font-bold" : ""}`}
          >
            <ScrollText />
            <Link href="/engagements" className="w-full text-lg">
              {locale === "fr" ? "Engagements" : "Commitments"}
            </Link>
          </div>
        </AccordionItem>
        <AccordionItem value={"partenaires"} onClick={handleHideMobileNav}>
          <div
            className={`flex items-center gap-2 py-4 ${isActive("/partenaires") ? "text-destructive font-bold" : ""}`}
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
