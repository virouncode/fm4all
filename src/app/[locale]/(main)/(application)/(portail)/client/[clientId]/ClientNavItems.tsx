"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Building2,
  ChevronRight,
  Compass,
  FileSignature,
  FileText,
  Ticket,
  Wrench,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { UserRoleType } from "@/zod-schemas/enums";

type ClientNavItemsProps = {
  currentRole: UserRoleType;
};

export default function ClientNavItems({ currentRole }: ClientNavItemsProps) {
  const pathname = usePathname();
  const { clientId } = useParams() as { clientId: string };

  const isActive = (segment: string) => pathname.includes(segment);

  const [ticketsOpen, setTicketsOpen] = useState(isActive("/tickets/"));
  const [interOpen, setInterOpen] = useState(isActive("/interventions/"));
  const [devisOpen, setDevisOpen] = useState(isActive("/devis/"));
  const [contrOpen, setContrOpen] = useState(isActive("/contrats/"));
  const [sitesOpen, setSitesOpen] = useState(isActive("/sites/"));
  const [compteOpen, setCompteOpen] = useState(isActive("/compte/"));

  return (
    <div className="flex flex-col">
      <SidebarGroup>
        <SidebarGroupLabel asChild className="mt-2 mb-6 w-full">
          <div className="flex w-full items-center justify-center">
            <Link href="/" title="Accueil">
              <div className="relative h-[23px] w-[100px]">
                <Image
                  src="/img/logo_full.webp"
                  alt="fm4all-Logo"
                  fill
                  sizes="100px"
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
        </SidebarGroupLabel>
      </SidebarGroup>
      {/* ----------- DASHBOARD ----------- */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive(`/client/${clientId}`)}
              >
                <Link
                  href={{
                    pathname: "/client/[clientId]",
                    params: { clientId },
                  }}
                >
                  <Compass className="h-4 w-4" />
                  <span className="text-sm">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ----------- TICKETS ----------- */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {/* Parent item collapsible */}
            <Collapsible open={ticketsOpen} onOpenChange={setTicketsOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/tickets/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      <span>Tickets</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        ticketsOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              {/* Sous-menu */}
              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                {/* Nouveau ticket */}
                {currentRole === "client_admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("nouveau-ticket")}
                    >
                      <Link
                        href={{
                          pathname: "/client/[clientId]/tickets/nouveau-ticket",
                          params: { clientId },
                        }}
                      >
                        Nouveau ticket
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {/* Tickets en cours */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("tickets-en-cours")}
                  >
                    <Link
                      href={{
                        pathname: "/client/[clientId]/tickets/tickets-en-cours",
                        params: { clientId },
                      }}
                    >
                      Tickets en cours
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("action-requise")}
                  >
                    <Link
                      href={{
                        pathname: "/client/[clientId]/tickets/action-requise",
                        params: { clientId },
                        query: {
                          status: "en_attente_client",
                        },
                      }}
                    >
                      Action requise
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Tickets à valider */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("tickets-a-valider")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/client/[clientId]/tickets/tickets-a-valider",
                        params: { clientId },
                        query: {
                          status: "a_valider",
                        },
                      }}
                    >
                      Tickets à valider
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible open={interOpen} onOpenChange={setInterOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/interventions/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      <span>Interventions</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        interOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("mes-interventions")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/client/[clientId]/interventions/mes-interventions",
                        params: { clientId },
                      }}
                    >
                      Mes interventions
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("rapports-intervention")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/client/[clientId]/interventions/rapports-intervention",
                        params: { clientId },
                      }}
                    >
                      Rapports
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ----------- DEVIS ----------- */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible open={devisOpen} onOpenChange={setDevisOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/devis/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileSignature className="h-4 w-4" />
                      <span>Devis</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        devisOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                {/* Nouveau devis */}
                {currentRole === "client_admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("nouvelle-demande")}
                    >
                      <Link
                        href={{
                          pathname: "/client/[clientId]/devis/nouvelle-demande",
                          params: { clientId },
                        }}
                      >
                        Nouvelle demande
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {/* Devis en cours */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("demandes-en-cours")}
                  >
                    <Link
                      href={{
                        pathname: "/client/[clientId]/devis/demandes-en-cours",
                        params: { clientId },
                      }}
                    >
                      Mes demandes en cours
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Devis  */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("mes-devis")}>
                    <Link
                      href={{
                        pathname: "/client/[clientId]/devis/mes-devis",
                        params: { clientId },
                      }}
                    >
                      Mes devis
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ----------- CONTRATS ----------- */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible open={contrOpen} onOpenChange={setContrOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/contrats/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Contrats</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        contrOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                {/* Mes contrats */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("mes-contrats")}
                  >
                    <Link
                      href={{
                        pathname: "/client/[clientId]/contrats/mes-contrats",
                        params: { clientId },
                      }}
                    >
                      Mes contrats
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Dépenses & factures */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("depenses-et-factures")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/client/[clientId]/contrats/depenses-et-factures",
                        params: { clientId },
                      }}
                    >
                      Dépenses & factures
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Forfaits */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("forfaits")}>
                    <Link
                      href={{
                        pathname: "/client/[clientId]/contrats/forfaits",
                        params: { clientId },
                      }}
                    >
                      Suivi des forfaits
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ----------- SITES ----------- */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible open={sitesOpen} onOpenChange={setSitesOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/sites/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Sites</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        sitesOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                {/* Mes sites */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("mes-sites")}>
                    <Link
                      href={{
                        pathname: "/client/[clientId]/sites/mes-sites",
                        params: { clientId },
                      }}
                    >
                      Mes sites
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Nouveau site */}
                {currentRole === "client_admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("nouveau-site")}
                    >
                      <Link
                        href={{
                          pathname: "/client/[clientId]/sites/nouveau-site",
                          params: { clientId },
                        }}
                      >
                        Ajouter un site
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
