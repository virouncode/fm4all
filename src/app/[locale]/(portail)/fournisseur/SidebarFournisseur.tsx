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
import {
  Barcode,
  CreditCard,
  EuroIcon,
  LayoutDashboard,
  Settings,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const items = [
  {
    title: "Tableau de bord",
    href: {
      pathname: "/fournisseur/19/dashboard" as const,
      params: { fournisseurId: 19 },
    },
    icon: LayoutDashboard,
  },
  {
    title: "Mon profil",
    href: {
      pathname: "/fournisseur/19/profil" as const,
      params: { fournisseurId: 19 },
    },
    icon: UserIcon,
  },
  {
    title: "Mes tarifs",
    href: {
      pathname: "/fournisseur/19/tarifs" as const,
      params: { fournisseurId: 19 },
    },
    icon: EuroIcon,
  },
  {
    title: "Mes produits",
    href: {
      pathname: "/fournisseur/19/produits" as const,
      params: { fournisseurId: 19 },
    },
    icon: Barcode,
  },
  {
    title: "Factures et paiements",
    href: {
      pathname: "/fournisseur/19/factures" as const,
      params: { fournisseurId: 19 },
    },
    icon: CreditCard,
  },
  {
    title: "Mon compte",
    href: {
      pathname: "/fournisseur/19/compte" as const,
      params: { fournisseurId: 19 },
    },
    icon: Settings,
  },
];

const SidebarFournisseur = () => {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarTrigger />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel asChild className="mt-6 mb-14 w-full">
            <div className="flex items-center justify-center gap-6 w-full">
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
              <UserButton />
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href.pathname}>
                      <item.icon />
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
