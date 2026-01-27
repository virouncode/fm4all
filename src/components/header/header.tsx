"use client";

import ContactButton from "@/components/buttons/contact-button";
import LocaleButton from "@/components/buttons/locale-button";
import UserButton from "@/components/buttons/UserButton";
import { Link } from "@/i18n/navigation";
import { PathnamesType } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  Banana,
  Building,
  Building2,
  ChartNoAxesCombined,
  Coffee,
  CupSoda,
  Droplet,
  FireExtinguisher,
  Handshake,
  HardHat,
  HeartPulse,
  LayoutDashboard,
  LucideIcon,
  MonitorStop,
  Network,
  ScrollText,
  Shirt,
  SprayCan,
  Star,
  UserRoundCog,
  UsersRound,
  Warehouse,
  Wrench,
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Suspense, useState } from "react";
import LinkedinButton from "../buttons/linkedin-button";
import HeaderButtons from "./header-buttons";
import HeaderNavigationMenu from "./header-navigation-menu";

const Header = () => {
  const locale = useLocale();
  // const { theme } = useTheme();

  // const tGlobal = useTranslations("Global");
  // const t = useTranslations("header");

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const handleHideMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const services: {
    title: string;
    href: {
      pathname: PathnamesType;
      params: { slug: string };
    };
    linkText: string;
    icon: LucideIcon;
  }[] = [
    {
      title: locale === "fr" ? "Nettoyage et propreté" : "Cleaning & Hygiene",
      href: {
        pathname: "/services/[slug]",
        params: { slug: locale === "fr" ? "nettoyage" : "cleaning-services" },
      },
      linkText:
        locale === "fr"
          ? "Entreprise de nettoyage de bureaux"
          : "Office cleaning company",
      icon: SprayCan,
    },
    {
      title: "Maintenance",
      href: {
        pathname: "/services/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "maintenance-multitechnique"
              : "multitechnical-maintenance",
        },
      },
      linkText:
        locale === "fr"
          ? "Entreprise de maintenance multitechnique"
          : "Multi-technical maintenance company",
      icon: Wrench,
    },
    {
      title: locale === "fr" ? "Sécurité incendie" : "Fire safety",
      href: {
        pathname: "/services/[slug]",
        params: { slug: locale === "fr" ? "securite-incendie" : "fire-safety" },
      },
      linkText:
        locale === "fr"
          ? "Entreprise de sécurité incendie"
          : "Fire protection and safety company",
      icon: FireExtinguisher,
    },
    {
      title: locale === "fr" ? "Machines à café" : "Coffee machines",
      href: {
        pathname: "/services/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "machines-a-cafe-en-entreprise"
              : "coffee-machines",
        },
      },
      linkText:
        locale === "fr"
          ? "Location de machines à café en entreprise"
          : "Office coffee machine rental",
      icon: Coffee,
    },
    {
      title: locale === "fr" ? "Fontaines à eau" : "Water dispensers",
      href: {
        pathname: "/services/[slug]",
        params: {
          slug:
            locale === "fr" ? "fontaines-a-eau-entreprise" : "water-dispensers",
        },
      },
      linkText:
        locale === "fr"
          ? "Location de fontaines à eau en entreprise"
          : "Office water dispenser rental",
      icon: Droplet,
    },
    {
      title: "Fruits & Snacks",
      href: {
        pathname: "/services/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "livraison-fruits-entreprise"
              : "office-fruit-basket-delivery",
        },
      },
      linkText:
        locale === "fr"
          ? "Livraison de fruits et snacks en entreprise"
          : "Office fruit and snack delivery service",
      icon: Banana,
    },
    {
      title: locale === "fr" ? "Boissons variées" : "Fresh drinks",
      href: {
        pathname: "/services/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "livraison-boissons-entreprise"
              : "office-drinks-delivery",
        },
      },
      linkText:
        locale === "fr"
          ? "Livraison de boissons en entreprise"
          : "Office drinks delivery company",
      icon: CupSoda,
    },
    {
      title: locale === "fr" ? "Office Manager" : "Office Manager",
      href: {
        pathname: "/services/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "office-manager-externalise"
              : "outsource-office-management",
        },
      },
      linkText:
        locale === "fr"
          ? "Office Manager externalisé"
          : "Outsource your Office Management",
      icon: UserRoundCog,
    },
    {
      title: locale === "fr" ? "Pilotage fm4all" : "fm4all Service",
      href: {
        pathname: "/services/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "pilotage-facility-management"
              : "facilities-management-outsourcing",
        },
      },
      linkText: locale === "fr" ? "Pilotage fm4all" : "fm4all Service",
      icon: LayoutDashboard,
    },
  ];

  const secteurs: {
    title: string;
    href: {
      pathname: PathnamesType;
      params: { slug: string };
    };
    icon: LucideIcon;
  }[] = [
    {
      title: locale === "fr" ? "Bureaux tertiaires" : "Office Space",
      href: {
        pathname: "/secteurs/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "gestion-services-facility-bureaux-paris"
              : "outsourced-facility-services-management-for-office-users-in-paris-area-france",
        },
      },

      icon: MonitorStop,
    },
    {
      title: locale === "fr" ? "Cabinets Médicaux" : "Healthare Facilities",
      href: {
        pathname: "/secteurs/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "cabinets-medicaux"
              : "medical-offices-and-healthcare-facilities",
        },
      },
      icon: HeartPulse,
    },
    {
      title: locale === "fr" ? "Locaux commerciaux" : "Retail & Stores",
      href: {
        pathname: "/secteurs/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "locaux-commerciaux-retail"
              : "retail-commercial-spaces",
        },
      },
      icon: Shirt,
    },
    {
      title: locale === "fr" ? "Entrepôts logistiques" : "Logistics Facilities",
      href: {
        pathname: "/secteurs/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "entrepot-logistique"
              : "warehouses-and-logistics",
        },
      },
      icon: Warehouse,
    },
    {
      title: locale === "fr" ? "Co-working" : "Coworking spaces",
      href: {
        pathname: "/secteurs/[slug]",
        params: {
          slug: locale === "fr" ? "coworking" : "coworking-spaces",
        },
      },
      icon: UsersRound,
    },
    {
      title: "Start-up / Scale-up",
      href: {
        pathname: "/secteurs/[slug]",
        params: {
          slug: locale === "fr" ? "start-up-scale-up" : "start-up-and-scale-up",
        },
      },
      icon: ChartNoAxesCombined,
    },
    {
      title:
        locale === "fr"
          ? "Etablissements recevant du public"
          : "Public Venues Buildings",
      href: {
        pathname: "/secteurs/[slug]",
        params: {
          slug: locale === "fr" ? "erp" : "public-access-buildings-erp",
        },
      },
      icon: Building2,
    },
    {
      title:
        locale === "fr" ? "Immeuble Mono Occupant" : "Single-Tenant Building",
      href: {
        pathname: "/secteurs/[slug]",
        params: {
          slug:
            locale === "fr"
              ? "services-utilisateur-mono-occupant"
              : "single-tenant-building",
        },
      },
      icon: Building,
    },
  ];

  const decouvrir: {
    title: string;
    href: {
      pathname: PathnamesType;
    };
    icon: LucideIcon;
  }[] = [
    {
      title: locale === "fr" ? "Nos 3 gammes" : "Our 3 tiers",
      href: {
        pathname: "/gammes",
      },
      icon: Star,
    },
    {
      title: locale === "fr" ? "Nos engagements" : "Our commitments",
      href: {
        pathname: "/engagements",
      },
      icon: ScrollText,
    },
    {
      title: locale === "fr" ? "Nos partenaires" : "Our partners",
      href: {
        pathname: "/partenaires",
      },
      icon: Handshake,
    },
  ];

  const rejoindre: {
    title: string;
    href: {
      pathname: PathnamesType;
    };
    icon: LucideIcon;
  }[] = [
    {
      title: locale === "fr" ? "Carrière" : "Career",
      href: {
        pathname: "/travail",
      },
      icon: Network,
    },
    {
      title: locale === "fr" ? "Devenir prestataire" : "Become a provider",
      href: {
        pathname: "/prestataire",
      },
      icon: HardHat,
    },
  ];

  return (
    <div className="bg-background sticky top-0 z-50 h-16 w-full shadow">
      <header className="mx-auto flex h-full max-w-7xl items-center justify-between p-6">
        <div className="flex items-center gap-6">
          <Link href="/" data-testid="home-link">
            <div
              className={cn("relative h-[29px] w-[110px] rounded-sm px-4 py-2")}
            >
              <Image
                src="/img/logo_full.webp"
                alt="fm4all-Logo"
                fill
                className="object-contain"
                sizes="100px"
              />
            </div>
          </Link>

          <HeaderNavigationMenu
            services={services}
            secteurs={secteurs}
            decouvrir={decouvrir}
            rejoindre={rejoindre}
            orientation="horizontal"
            handleHideMobileNav={handleHideMobileNav}
            className="hidden min-[1160px]:block"
          />
        </div>
        <HeaderButtons
          isMobileNavOpen={isMobileNavOpen}
          setIsMobileNavOpen={setIsMobileNavOpen}
        />
        {/***************** MOBILE NAVIGATION *****************/}

        <div
          className={`bg-background fixed top-16 right-0 left-0 flex h-[calc(100vh-4rem)] items-start justify-center text-2xl shadow-lg ${
            isMobileNavOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } min-[1160px]:block:hidden block transition-all duration-300 ease-in-out`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="absolute top-4 right-6 flex items-center gap-4 md:hidden">
            <Suspense
              fallback={
                <div className="flex h-9 w-16 animate-pulse cursor-pointer items-center justify-center gap-1 rounded-md border text-sm hover:opacity-75"></div>
              }
            >
              <LocaleButton className="flex gap-1" />
            </Suspense>
            <ContactButton setIsMobileNavOpen={setIsMobileNavOpen} />
            <LinkedinButton setIsMobileNavOpen={setIsMobileNavOpen} />
            <UserButton setIsMobileNavOpen={setIsMobileNavOpen} />
          </div>
          <HeaderNavigationMenu
            services={services}
            secteurs={secteurs}
            decouvrir={decouvrir}
            rejoindre={rejoindre}
            orientation="vertical"
            handleHideMobileNav={handleHideMobileNav}
          />
        </div>
      </header>
    </div>
  );
};

export default Header;
