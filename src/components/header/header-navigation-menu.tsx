"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Factory,
  HandPlatter,
  LucideIcon,
  Telescope,
  Users,
} from "lucide-react";
import { ComponentProps } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

type LinkHrefType = ComponentProps<typeof Link>["href"];

type HeaderNavigationMenuProps = {
  services: {
    title: string;
    href: LinkHrefType;
    linkText: string;
    icon: LucideIcon;
  }[];
  secteurs: {
    title: string;
    href: LinkHrefType;
    icon: LucideIcon;
  }[];
  rejoindre: {
    title: string;
    href: LinkHrefType;
    icon: LucideIcon;
  }[];
  decouvrir: {
    title: string;
    href: LinkHrefType;
    icon: LucideIcon;
  }[];
  orientation: "horizontal" | "vertical";
  handleHideMobileNav: () => void;
  className?: string;
};

const HeaderNavigationMenu = ({
  services,
  secteurs,
  decouvrir,
  rejoindre,
  orientation,
  handleHideMobileNav,
  className,
}: HeaderNavigationMenuProps) => {
  const locale = useLocale();
  const path = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return path === "/";
    return path.includes(href);
  };
  const isMobile = useIsMobile();

  return orientation === "horizontal" ? (
    //DESKTOP
    <NavigationMenu className={`${className}`} viewport={isMobile}>
      <NavigationMenuList className="flex items-center gap-6">
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className="px-0"
            data-testid="services-trigger"
          >
            <div
              className={`flex items-center gap-1 text-base ${isActive("/services") ? "text-primary dark:text-foreground font-bold" : ""}`}
            >
              <HandPlatter size={15} />
              <p>Services</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[250px]">
              <li className="hover:bg-accent px-2">
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
                    className="hover:bg-accent px-2"
                    onClick={handleHideMobileNav}
                  >
                    <NavigationMenuLink asChild className="text-base">
                      <Link
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
              className={`flex items-center gap-1 text-base ${isActive("/secteurs") ? "text-primary dark:text-foreground font-bold" : ""}`}
            >
              <Factory size={15} />
              <p>{locale === "fr" ? "Secteurs" : "Sectors"}</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[250px]">
              <li className="hover:bg-accent px-2">
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
                  <li key={secteur.title} className="hover:bg-accent px-2">
                    <NavigationMenuLink asChild className="text-base">
                      <Link
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
          <NavigationMenuTrigger
            className="px-0"
            data-testid="decouvrir-trigger"
          >
            <div
              className={`flex items-center gap-1 text-base ${isActive("/gammes") || isActive("/engagements") || isActive("/partenaires") ? "text-primary dark:text-foreground font-bold" : ""}`}
            >
              <Telescope size={15} />
              <p>{locale === "fr" ? "Découvrir" : "Discover"}</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[250px]">
              {decouvrir.map((item) => {
                return (
                  <li key={item.title} className="hover:bg-accent px-2">
                    <NavigationMenuLink asChild className="text-base">
                      <Link
                        href={item.href}
                        className="flex w-full flex-row items-center gap-4 hover:underline"
                      >
                        <item.icon className="size-5" />
                        {item.title}
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
            data-testid="decouvrir-trigger"
          >
            <div
              className={`flex items-center gap-1 text-base ${isActive("/travail") || isActive("/prestataire") ? "text-primary dark:text-foreground font-bold" : ""}`}
            >
              <Users size={15} />
              <p>{locale === "fr" ? "Nous rejoindre" : "Join Us"}</p>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[250px]">
              {rejoindre.map((item) => {
                return (
                  <li key={item.title} className="hover:bg-accent px-2">
                    <NavigationMenuLink asChild className="text-base">
                      <Link
                        href={item.href}
                        className="flex w-full flex-row items-center gap-4 hover:underline"
                      >
                        <item.icon className="size-5" />
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
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
              className={`flex items-center gap-2 ${isActive("/services") ? "text-primary dark:text-foreground font-bold" : ""}`}
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
              className={`flex items-center gap-2 ${isActive("/secteurs") ? "text-primary dark:text-foreground font-bold" : ""}`}
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
                      href={secteur.href}
                      className="flex w-full items-center gap-4 !text-lg hover:underline"
                      title={secteur.title}
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
        <AccordionItem value={"decouvrir"}>
          <AccordionTrigger className="text-lg">
            <div
              className={`flex items-center gap-2 ${isActive("/gammes") || isActive("/engagements") || isActive("/partenaires") ? "text-primary dark:text-foreground font-bold" : ""}`}
            >
              <Telescope />
              <span>{locale === "fr" ? "Découvrir" : "Discover"}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2">
              {decouvrir.map((item) => {
                return (
                  <li
                    key={item.title}
                    className="hover:bg-accent px-4 py-2"
                    onClick={handleHideMobileNav}
                  >
                    <Link
                      href={item.href}
                      title={item.title}
                      aria-label={item.title}
                      className="flex w-full items-center gap-4 !text-lg hover:underline"
                    >
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                      <span className="sr-only">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value={"rejoindre"}>
          <AccordionTrigger className="text-lg">
            <div
              className={`flex items-center gap-2 ${isActive("/travail") || isActive("/prestataire") ? "text-primary dark:text-foreground font-bold" : ""}`}
            >
              <Users />
              <span>{locale === "fr" ? "Nous rejoindre" : "Join Us"}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2">
              {rejoindre.map((item) => {
                return (
                  <li
                    key={item.title}
                    className="hover:bg-accent px-4 py-2"
                    onClick={handleHideMobileNav}
                  >
                    <Link
                      href={item.href}
                      title={item.title}
                      aria-label={item.title}
                      className="flex w-full items-center gap-4 !text-lg hover:underline"
                    >
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                      <span className="sr-only">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </nav>
  );
};

export default HeaderNavigationMenu;
