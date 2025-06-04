"use client";

import UserButton from "@/components/buttons/UserButton";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Barcode,
  CalendarDays,
  CreditCard,
  EuroIcon,
  LayoutDashboard,
  Settings,
  UserIcon,
} from "lucide-react";
import Image from "next/image";

type SidebarFournisseurProps = {
  fournisseurId: number;
};

const SidebarFournisseur = ({ fournisseurId }: SidebarFournisseurProps) => {
  const pathName = usePathname();
  const items = [
    {
      title: "Tableau de bord",
      href: {
        pathname: "/fournisseur/[fournisseurId]/dashboard" as const,
        params: { fournisseurId },
      },
      icon: LayoutDashboard,
    },
    {
      title: "Mon profil",
      href: {
        pathname: "/fournisseur/[fournisseurId]/profil" as const,
        params: { fournisseurId },
      },
      icon: UserIcon,
    },
    {
      title: "Mes tarifs",
      href: {
        pathname: "/fournisseur/[fournisseurId]/tarifs" as const,
        params: { fournisseurId },
      },
      icon: EuroIcon,
    },
    {
      title: "Mes produits",
      href: {
        pathname: "/fournisseur/[fournisseurId]/produits" as const,
        params: { fournisseurId },
      },
      icon: Barcode,
    },
    {
      title: "Mes interventions",
      href: {
        pathname: "/fournisseur/[fournisseurId]/interventions" as const,
        params: { fournisseurId },
      },
      icon: CalendarDays,
    },
    {
      title: "Factures et paiements",
      href: {
        pathname: "/fournisseur/[fournisseurId]/factures" as const,
        params: { fournisseurId },
      },
      icon: CreditCard,
    },
    {
      title: "Mon compte",
      href: {
        pathname: "/fournisseur/[fournisseurId]/compte" as const,
        params: { fournisseurId },
      },
      icon: Settings,
    },
  ];
  const isActive = (href: {
    pathname: string;
    params: { fournisseurId: number };
  }) => {
    return pathName.includes(href.pathname);
  };
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarTrigger />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel asChild className="mt-6 mb-14 w-full">
            <div className="flex items-center justify-center gap-6 w-full">
              <Link href="/" title="Accueil">
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
              <UserButton />
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={`${isActive(item.href) ? "bg-slate-100" : ""} hover:bg-slate-100`}
                    asChild
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon size={15} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarFournisseur;
