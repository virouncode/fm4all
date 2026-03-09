"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useAppStore } from "@/stores/application/appStore";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";

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
  Building,
  Building2,
  ClipboardList,
  Euro,
  FileText,
  HandPlatter,
  Handshake,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { ComponentProps } from "react";

type LinkHrefType = ComponentProps<typeof Link>["href"];

type NavItemType = {
  key: string;
  label: string;
  href: LinkHrefType;
  icon: React.ElementType;
  match?: "startsWith" | "exact";
};

type NavSectionType = {
  label?: string;
  items: NavItemType[];
};

const NAV: Record<RoleEntrepriseType, NavSectionType[]> = {
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
      ],
    },
    {
      label: "Exploitation",
      items: [
        {
          key: "tickets",
          label: "Tickets",
          href: "/app/tickets",
          icon: Ticket,
          match: "startsWith",
        },
        {
          key: "prestations",
          label: "Prestations",
          href: "/app/prestations",
          icon: HandPlatter,
          match: "startsWith",
        },
        {
          key: "checklists",
          label: "Checklists",
          href: "/app/checklists",
          icon: ListChecks,
          match: "startsWith",
        },
        {
          key: "mes-prestataires",
          label: "Mes prestataires",
          href: "/app/mes-prestataires",
          icon: Building2,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Patrimoine",
      items: [
        {
          key: "sites",
          label: "Sites",
          href: "/app/sites",
          icon: MapPin,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Équipe",
      items: [
        {
          key: "utilisateurs",
          label: "Utilisateurs",
          href: "/app/utilisateurs",
          icon: Users,
          match: "startsWith",
        },
        {
          key: "mon-entreprise",
          label: "Mon entreprise",
          href: "/app/mon-entreprise",
          icon: Building,
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
      ],
    },
    {
      label: "Achats",
      items: [
        {
          key: "devis",
          label: "Devis",
          href: "/app/devis",
          icon: Handshake,
          match: "startsWith",
        },
        {
          key: "contrats",
          label: "Contrats",
          href: "/app/contrats",
          icon: BriefcaseBusiness,
          match: "startsWith",
        },
        {
          key: "facturation",
          label: "Facturation",
          href: "/app/facturation",
          icon: Euro,
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
      ],
    },
    {
      label: "Exploitation",
      items: [
        {
          key: "tickets",
          label: "Tickets",
          href: "/app/tickets",
          icon: Ticket,
          match: "startsWith",
        },
        {
          key: "prestations",
          label: "Prestations",
          href: "/app/prestations",
          icon: HandPlatter,
          match: "startsWith",
        },
        {
          key: "checklists",
          label: "Checklists",
          href: "/app/checklists",
          icon: ListChecks,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Périmètre",
      items: [
        {
          key: "mes-sites-clients",
          label: "Sites clients",
          href: "/app/mes-sites-clients",
          icon: MapPin,
          match: "startsWith",
        },
        {
          key: "mes-clients",
          label: "Mes clients",
          href: "/app/mes-clients",
          icon: Building2,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Équipe",
      items: [
        {
          key: "utilisateurs",
          label: "Utilisateurs",
          href: "/app/utilisateurs",
          icon: Users,
          match: "startsWith",
        },
        {
          key: "mon-entreprise",
          label: "Mon entreprise",
          href: "/app/mon-entreprise",
          icon: Building,
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
          key: "contrats",
          label: "Contrats",
          href: "/app/contrats",
          icon: BriefcaseBusiness,
          match: "startsWith",
        },
        {
          key: "facturation",
          label: "Facturation",
          href: "/app/facturation",
          icon: Euro,
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
          label: "Tableau de bord",
          href: "/app",
          icon: LayoutDashboard,
          match: "exact",
        },
      ],
    },
    {
      label: "Exploitation",
      items: [
        {
          key: "tickets",
          label: "Tickets",
          href: "/app/tickets",
          icon: Ticket,
          match: "startsWith",
        },
        {
          key: "prestations",
          label: "Prestations",
          href: "/app/prestations",
          icon: HandPlatter,
          match: "startsWith",
        },
        {
          key: "checklists",
          label: "Checklists",
          href: "/app/checklists",
          icon: ListChecks,
          match: "startsWith",
        },
      ],
    },
    {
      label: "Réseau",
      items: [
        {
          key: "entreprises",
          label: "Entreprises",
          href: "/app/entreprises",
          icon: Building2,
          match: "startsWith",
        },
        {
          key: "sites-clients",
          label: "Sites clients",
          href: "/app/sites-clients",
          icon: MapPin,
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
      ],
    },
    {
      label: "Administration",
      items: [
        {
          key: "utilisateurs",
          label: "Utilisateurs",
          href: "/app/utilisateurs",
          icon: Users,
          match: "startsWith",
        },
        {
          key: "mon-entreprise",
          label: "Mon entreprise",
          href: "/app/mon-entreprise",
          icon: Building,
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
      ],
    },
    {
      label: "Achats",
      items: [
        {
          key: "devis",
          label: "Devis",
          href: "/app/devis",
          icon: Handshake,
          match: "startsWith",
        },
        {
          key: "contrats",
          label: "Contrats",
          href: "/app/contrats",
          icon: BriefcaseBusiness,
          match: "startsWith",
        },
        {
          key: "facturation",
          label: "Facturation",
          href: "/app/facturation",
          icon: Euro,
          match: "startsWith",
        },
      ],
    },
  ],
};

function isActive(pathname: string, href: string, match: NavItemType["match"]) {
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
        <SidebarGroup key={`${effectivePosture}-${idx}`} className="py-1">
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
