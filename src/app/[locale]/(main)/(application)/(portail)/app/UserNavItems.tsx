"use client";

import { Link } from "@/i18n/navigation";
import { useAppStore } from "@/stores/application/appStore";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  HandPlatter,
  Handshake,
  LayoutDashboard,
  MapPin,
  Settings,
  Shield,
  Ticket,
  Users,
} from "lucide-react";
import { ComponentProps } from "react";

type LinkHrefType = ComponentProps<typeof Link>["href"];

type NavItem = {
  key: string;
  label: string;
  href: LinkHrefType;
  icon: React.ElementType;
  match?: "startsWith" | "exact";
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

const NAV: Record<RoleEntrepriseType, NavSection[]> = {
  client: [
    {
      items: [
        {
          key: "dashboard",
          label: "Tableau de bord",
          href: "/app",
          icon: LayoutDashboard,
          match: "exact",
        },
        {
          key: "tickets",
          label: "Tickets",
          href: "/app/tickets",
          icon: Ticket,
          match: "startsWith",
        },
        {
          key: "services",
          label: "Services",
          href: "/app/services",
          icon: HandPlatter,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Ressources",
      items: [
        {
          key: "sites",
          label: "Sites",
          href: "/app/sites",
          icon: MapPin,
          match: "startsWith",
        },
        {
          key: "documents",
          label: "Documents",
          href: "/app/documents",
          icon: FileText,
          match: "startsWith",
        },
        {
          key: "utilisateurs",
          label: "Utilisateurs",
          href: "/app/utilisateurs",
          icon: Users,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Commercial",
      items: [
        {
          key: "devis",
          label: "Devis",
          href: "/app/devis",
          icon: Handshake,
          match: "startsWith",
        },
        {
          key: "facturation",
          label: "Facturation",
          href: "/app/facturation",
          icon: CreditCard,
          match: "startsWith",
        },
        {
          key: "contrats",
          label: "Contrats",
          href: "/app/contrats",
          icon: BriefcaseBusiness,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Paramètres",
      items: [
        {
          key: "settings",
          label: "Paramètres",
          href: "/app/parametres",
          icon: Settings,
          match: "startsWith",
        },
      ],
    },
  ],

  prestataire: [
    {
      items: [
        {
          key: "dashboard",
          label: "Tableau de bord",
          href: "/app",
          icon: LayoutDashboard,
          match: "exact",
        },
        {
          key: "tickets",
          label: "Interventions",
          href: "/app/tickets",
          icon: Ticket,
          match: "startsWith",
        },
        {
          key: "planning",
          label: "Planning",
          href: "/app/planning",
          icon: ClipboardList,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Commercial",
      items: [
        {
          key: "devis",
          label: "Devis",
          href: "/app/devis",
          icon: Handshake,
          match: "startsWith",
        },
        {
          key: "facturation",
          label: "Facturation",
          href: "/app/facturation",
          icon: CreditCard,
          match: "startsWith",
        },
        {
          key: "contrats",
          label: "Contrats",
          href: "/app/contrats",
          icon: BriefcaseBusiness,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Ressources",
      items: [
        {
          key: "documents",
          label: "Documents",
          href: "/app/documents",
          icon: FileText,
          match: "startsWith",
        },
        {
          key: "utilisateurs",
          label: "Utilisateurs",
          href: "/app/utilisateurs",
          icon: Users,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Paramètres",
      items: [
        {
          key: "settings",
          label: "Paramètres",
          href: "/app/parametres",
          icon: Settings,
          match: "startsWith",
        },
      ],
    },
  ],

  plateforme: [
    {
      items: [
        {
          key: "dashboard",
          label: "Pilotage",
          href: "/app",
          icon: LayoutDashboard,
          match: "exact",
        },
        {
          key: "tickets",
          label: "Tickets",
          href: "/app/tickets",
          icon: Ticket,
          match: "startsWith",
        },
        {
          key: "clients",
          label: "Entreprises",
          href: "/app/entreprises",
          icon: Building2,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Catalogue",
      items: [
        {
          key: "services",
          label: "Services",
          href: "/app/services",
          icon: ClipboardList,
          match: "startsWith",
        },
        {
          key: "documents",
          label: "Documents",
          href: "/app/documents",
          icon: FileText,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Admin",
      items: [
        {
          key: "utilisateurs",
          label: "Utilisateurs",
          href: "/app/utilisateurs",
          icon: Users,
          match: "startsWith",
        },
        {
          key: "securite",
          label: "Sécurité",
          href: "/app/securite",
          icon: Shield,
          match: "startsWith",
        },
        {
          key: "settings",
          label: "Paramètres",
          href: "/app/parametres",
          icon: Settings,
          match: "startsWith",
        },
      ],
    },
  ],
};

function isActive(pathname: string, href: string, match: NavItem["match"]) {
  if (match === "exact") return pathname === href;
  return (
    pathname === href ||
    pathname.startsWith(href + "/") ||
    pathname.startsWith(href)
  );
}

export default function UserNavItems() {
  const pathname = usePathname();
  const posture = useAppStore((s) => s.postureActive);
  const roles = useAppStore((s) => s.rolesEntreprise);

  if (!posture) return null;

  // garde-fou : si posture invalide, fallback
  const effectivePosture: RoleEntrepriseType = roles.includes(posture)
    ? posture
    : roles.includes("plateforme")
      ? "plateforme"
      : roles.includes("client")
        ? "client"
        : "prestataire";

  const sections = NAV[effectivePosture];

  return (
    <>
      {sections.map((section, idx) => (
        <SidebarGroup key={`${effectivePosture}-${idx}`}>
          {section.label ? (
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          ) : null}

          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(
                  pathname,
                  item.href as string,
                  item.match,
                );

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
