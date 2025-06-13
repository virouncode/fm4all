"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { Factory, Handshake, Menu, ScrollText, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { Secteur, Service } from "../../../sanity.types";
import ContactButton from "../buttons/contact-button";
import DevisButton from "../buttons/devis-button";
import LocaleButton from "../buttons/locale-button";
import UserButton from "../buttons/UserButton";

type HeaderNavigationMenuProps = {
  services: Service[];
  secteurs: Secteur[];
  locale: LocaleType;
};

const HeaderNavigationMenu = ({
  services,
  secteurs,
  locale,
}: HeaderNavigationMenuProps) => {
  const t = useTranslations("header");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const path = usePathname();
  const handleShowMobileNav = () => {
    setIsMobileNavOpen(true);
  };
  const handleHideMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return path === "/";
    return path.includes(href);
  };
  return (
    <div className="flex items-center gap-6 justify-between w-full">
      <Link href="/">
        <div className="relative h-[23px] w-[100px]">
          <Image
            src="/img/logo_full.webp"
            alt="fm4all-Logo"
            fill={true}
            sizes="300px"
            quality={100}
            className="object-contain"
          />
        </div>
      </Link>
      <NavigationMenu className="hidden xl:flex items-center">
        <NavigationMenuList>
          {/* <NavigationMenuItem>
            <NavigationMenuTrigger className="px-2">
              <div className="flex items-center gap-1 text-base">
                <HandPlatter size={15} />
                <p>Services</p>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px]">
                {services.map((service) => {
                  const serviceUrl = service.slug?.current ?? "";
                  return (
                    <li key={service._id} className="hover:bg-accent px-4 py-2">
                      <NavigationMenuLink asChild className="w-full relative">
                        <Link
                          href={{
                            pathname: `/services/[slug]`,
                            params: { slug: serviceUrl },
                          }}
                          title={service.linkText}
                          aria-label={service.linkText}
                          className="w-full block"
                        >
                          <span>{service.titre}</span>
                          <span className="sr-only">{service.linkText}</span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem> */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="px-2">
              <div className="flex items-center gap-1 text-base">
                <Factory size={15} />
                <p>{t("nos-secteurs")}</p>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px]">
                {secteurs.map((secteur) => {
                  const secteurUrl = secteur.slug?.current ?? "";
                  return (
                    <li key={secteur._id} className="px-4 py-2 hover:bg-accent">
                      <NavigationMenuLink asChild>
                        <Link
                          href={{
                            pathname: `/secteurs/[slug]`,
                            params: { slug: secteurUrl },
                          }}
                          title={secteur.titre}
                          aria-label={secteur.titre}
                        >
                          {secteur.titre}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className="px-2">
              <div className="flex items-center gap-1">
                <Star size={15} />
                <Link
                  href="/gammes"
                  title={t("nos-3-gammes")}
                  aria-label={t("nos-3-gammes")}
                >
                  {t("nos-3-gammes")}
                </Link>
              </div>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className="px-2">
              <div className="flex items-center gap-1">
                <ScrollText size={15} />
                <Link
                  href="/engagements"
                  title={t("nos-engagements")}
                  aria-label={t("nos-engagements")}
                >
                  {t("nos-engagements")}
                </Link>
              </div>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className="px-2">
              <div className="flex items-center gap-1">
                <Handshake size={15} />
                <Link
                  href="/partenaires"
                  title={t("nos-partenaires")}
                  aria-label={t("nos-partenaires")}
                >
                  {t("nos-partenaires")}
                </Link>
              </div>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-4">
        <DevisButton
          title={locale === "fr" ? "Mon devis en ligne" : "My online quote"}
          text={locale === "fr" ? "Mon devis en ligne" : "My online quote"}
          className="text-sm"
          disabled={path.includes("/mon-devis")}
          setIsMobileNavOpen={setIsMobileNavOpen}
        />
        {/* <Button
          title={locale === "fr" ? "Devenir prestataire" : "Become a provider"}
          variant="outline"
          className="hidden min-[600px]:flex justify-center items-center"
          size="default"
          asChild
          onClick={() => setIsMobileNavOpen(false)}
        >
          <Link href="/prestataire">
            {locale === "fr" ? "Devenir prestataire" : "Become a provider"}
          </Link>
        </Button> */}
        <LocaleButton className="hidden md:flex" />
        <ContactButton
          setIsMobileNavOpen={setIsMobileNavOpen}
          className="hidden md:flex"
        />
        <UserButton
          setIsMobileNavOpen={setIsMobileNavOpen}
          className="hidden md:flex"
        />
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
    </div>
  );
};

export default HeaderNavigationMenu;
